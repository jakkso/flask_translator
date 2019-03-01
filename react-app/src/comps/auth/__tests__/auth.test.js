import { shallow } from "enzyme";
import React from "react";
import sinon from "sinon";

import { Auth } from "../auth";
import Login from "../login";
import Unactivated from "../unactivated";
import Register from "../registration";
import ResetPassword from "../resetPasswordRequest";
import Request from "../../../scripts/sendRequest";

let wrapper;
const password = "hunter2hunter2hunter2";
const username = "bob@bob.com";

describe("Auth Component", () => {
  it("Contains correct Components", () => {
    wrapper = shallow(<Auth />);
    expect(wrapper.find(Login).length).toEqual(1);
    wrapper.setState({ unactivated: true });
    expect(wrapper.find(Unactivated).length).toEqual(1);
    wrapper.setState({ unactivated: false, registration: true });
    expect(wrapper.find(Register).length).toEqual(1);
    wrapper.setState({ registration: false, resetPassword: true });
    expect(wrapper.find(ResetPassword).length).toEqual(1);
  });

  it("Validate username works as expected", () => {
    const setInfoText = jest.fn();
    wrapper = shallow(<Auth setInfoText={setInfoText} />);
    wrapper.setState({ username: "bob" });
    expect(wrapper.instance().validateUsername()).toEqual(false);
    wrapper.setState({ username: "bob.com" });
    expect(wrapper.instance().validateUsername()).toEqual(false);
    wrapper.setState({ username: "bob@bob.com" });
    expect(wrapper.instance().validateUsername()).toEqual(true);
    // setInfoText is only called when username is invalid
    expect(setInfoText).toHaveBeenCalledTimes(2);
  });

  it("Validate password works as expected", () => {
    const setInfoText = jest.fn();
    wrapper = shallow(<Auth setInfoText={setInfoText} />);
    wrapper.setState({ password: "hunter2", password2: "hunter1" });
    expect(wrapper.instance().validatePassword()).toEqual(false);
    wrapper.setState({
      password: "hunter2hunter2hunter2",
      password2: "hunter1"
    });
    expect(wrapper.instance().validatePassword()).toEqual(false);
    wrapper.setState({ password2: "hunter2hunter2hunter2" });
    expect(wrapper.instance().validatePassword()).toEqual(true);
    expect(setInfoText).toHaveBeenCalledTimes(2);
  });

  it("clearState works as expected", () => {
    wrapper = shallow(<Auth />);
    wrapper.setState({
      username: "bob",
      password: "hunter2",
      password2: "hunter2",
      registration: true,
      unactivated: true,
      resetPassword: true,
      passwordResetToken: "hunter2resetToken"
    });
    wrapper.instance().clearState();
    expect(wrapper.state().username).toEqual("");
    expect(wrapper.state().password).toEqual("");
    expect(wrapper.state().password2).toEqual("");
    expect(wrapper.state().passwordResetToken).toEqual("");
    expect(wrapper.state().registration).toEqual(false);
    expect(wrapper.state().unactivated).toEqual(false);
    expect(wrapper.state().resetPassword).toEqual(false);
  });

  it("togglePasswordRest works as expected", () => {
    wrapper = shallow(<Auth />);
    wrapper.instance().togglePasswordReset();
    expect(wrapper.state().resetPassword).toEqual(true);
  });

  it("toggleModal toggles state.registration", () => {
    wrapper = shallow(<Auth />);
    expect(wrapper.state().registration).toEqual(false);
    wrapper.instance().toggleModal();
    expect(wrapper.state().registration).toEqual(true);
    wrapper.instance().toggleModal();
    expect(wrapper.state().registration).toEqual(false);
  });

  it("onChange changes state of event.target.id correctly", () => {
    wrapper = shallow(<Auth />);
    const event = { target: { id: "username", value: "bob@bob.com" } };
    expect(wrapper.state().username).toEqual("");
    wrapper.instance().onChange(event);
    expect(wrapper.state().username).toEqual("bob@bob.com");
  });

  it("Activation handler calls setInfoText as expected", async () => {
    const setInfoText = jest.fn();
    const stub = sinon.stub(Request, "sendRequest");
    wrapper = shallow(<Auth setInfoText={setInfoText} />);
    stub
      .withArgs({}, "user/activate", { Authorization: `Bearer error` }, "PUT")
      .returns({ error: "error" });
    await wrapper.instance().activationHandler("error");
    expect(setInfoText).toHaveBeenCalledWith("error");
    stub
      .withArgs({}, "user/activate", { Authorization: `Bearer expired` }, "PUT")
      .returns({ msg: "expired" });
    await wrapper.instance().activationHandler("expired");
    expect(setInfoText).toHaveBeenCalledWith("Link invalid or expired");
    stub
      .withArgs({}, "user/activate", { Authorization: `Bearer success` }, "PUT")
      .returns({ message: "success" });
    await wrapper.instance().activationHandler("success");
    expect(setInfoText).toHaveBeenCalledWith("success");
    stub.restore();
  });

  it("loginHandler works as expected", async () => {
    const setInfoText = jest.fn();
    const setAccessToken = jest.fn();
    const setRefreshToken = jest.fn();
    const stub = sinon.stub(Request, "sendRequest");
    wrapper = shallow(
      <Auth
        setInfoText={setInfoText}
        setAccessToken={setAccessToken}
        setRefreshToken={setRefreshToken}
      />
    );
    await wrapper.instance().loginHandler();
    expect(setInfoText).toHaveBeenCalledWith("Username and password required");
    wrapper.setState({ username: username, password: password });
    stub
      .withArgs({ username: username, password: password }, "user/login")
      .returns({ error: "error" });
    await wrapper.instance().loginHandler();
    expect(setInfoText).toHaveBeenCalledWith("error");
    stub
      .withArgs({ username: username, password: password }, "user/login")
      .returns({ message: "Bad credentials" });
    await wrapper.instance().loginHandler();
    expect(setInfoText).toHaveBeenCalledWith("Bad username or password");
    stub
      .withArgs({ username: username, password: password }, "user/login")
      .returns({ message: "Unverified email address" });
    await wrapper.instance().loginHandler();
    expect(wrapper.state().unactivated).toEqual(true);
    stub
      .withArgs({ username: username, password: password }, "user/login")
      .returns({
        message: "Logged in as bob@bob.com",
        access_token: 123,
        refresh_token: 456
      });
    await wrapper.instance().loginHandler();
    expect(setInfoText).toHaveBeenCalledWith("Logged in as bob@bob.com");
    expect(setAccessToken).toHaveBeenCalledWith(123);
    expect(setRefreshToken).toHaveBeenCalledWith(456);
    stub.restore();
  });

  it("registrationHandler works as expected", async () => {
    const setInfoText = jest.fn();
    const stub = sinon.stub(Request, "sendRequest");
    wrapper = shallow(<Auth setInfoText={setInfoText} />);
    await wrapper.instance().registrationHandler();
    expect(setInfoText).toHaveBeenCalledWith("Invalid email address");
    wrapper.setState({ username: username });
    await wrapper.instance().registrationHandler();
    expect(setInfoText).toHaveBeenCalledWith(
      "Passwords must be at least 14 characters and have a letter and number"
    );
    wrapper.setState({ password: password, password2: password });
    stub
      .withArgs({ username: username, password: password }, "user/registration")
      .returns({ error: "error" });
    await wrapper.instance().registrationHandler();
    expect(setInfoText).toHaveBeenCalledWith("error");
    setInfoText.mockReset();
    stub
      .withArgs({ username: username, password: password }, "user/registration")
      .returns({ message: "User bob@bob.com was created" });
    wrapper.setState({
      username: username,
      password: password,
      password2: password
    });
    await wrapper.instance().registrationHandler();
    expect(setInfoText).toHaveBeenCalledWith("User bob@bob.com was created");
    expect(wrapper.state().unactivated).toEqual(true);
    wrapper.setState({ unactivated: false });
    stub
      .withArgs({ username: username, password: password }, "user/registration")
      .returns({ message: "User already exists" });
    await wrapper.instance().registrationHandler();
    expect(setInfoText).toHaveBeenCalledWith("User already exists");
    expect(wrapper.state().unactivated).toEqual(false);

    stub.restore();
  });

  it("passwordResetHandler works as expected", async () => {
    const setInfoText = jest.fn();
    const stub = sinon.stub(Request, "sendRequest");
    wrapper = shallow(<Auth setInfoText={setInfoText} />);
    wrapper.instance().passwordResetHandler();
    expect(setInfoText).toHaveBeenCalledWith(
      "Passwords must be at least 14 characters and have a letter and number"
    );
    wrapper.setState({
      password: password,
      password2: password,
      passwordResetToken: 123
    });
    stub
      .withArgs(
        { password: password },
        "user/reset_password",
        { Authorization: `Bearer 123` },
        "PUT"
      )
      .returns({ error: "error" });
    await wrapper.instance().passwordResetHandler();
    expect(setInfoText).toHaveBeenCalledWith("error");
    wrapper.setState({
      password: password,
      password2: password,
      passwordResetToken: 123
    });
    stub
      .withArgs(
        { password: password },
        "user/reset_password",
        { Authorization: `Bearer 123` },
        "PUT"
      )
      .returns({ msg: "error" });
    await wrapper.instance().passwordResetHandler();
    expect(setInfoText).toHaveBeenCalledWith("Link invalid or expired");
    wrapper.setState({
      password: password,
      password2: password,
      passwordResetToken: 123
    });
    stub
      .withArgs(
        { password: password },
        "user/reset_password",
        { Authorization: `Bearer 123` },
        "PUT"
      )
      .returns({ message: "success" });
    await wrapper.instance().passwordResetHandler();
    expect(setInfoText).toHaveBeenCalledWith("success");
    stub.restore();
  });

  it("reqActivationEmail works as expected", async () => {
    const setInfoText = jest.fn();
    const stub = sinon.stub(Request, "sendRequest");
    wrapper = shallow(<Auth setInfoText={setInfoText} />);
    wrapper.setState({ username: username, password: password });
    stub
      .withArgs({ username: username, password: password }, "user/activate")
      .returns({ error: "error" });
    await wrapper.instance().reqActivationEmail();
    expect(setInfoText).toHaveBeenCalledWith("error");
    wrapper.setState({ username: username, password: password });
    stub
      .withArgs({ username: username, password: password }, "user/activate")
      .returns({ message: "Bad credentials" });
    await wrapper.instance().reqActivationEmail();
    expect(setInfoText).toHaveBeenCalledWith("Bad credentials");
    wrapper.setState({ username: username, password: password });
    stub
      .withArgs({ username: username, password: password }, "user/activate")
      .returns({ message: "User activated" });
    await wrapper.instance().reqActivationEmail();
    expect(setInfoText).toHaveBeenCalledWith("User activated");
    stub
      .withArgs({ username: username, password: password }, "user/activate")
      .returns({ message: "User already active" });
    await wrapper.instance().reqActivationEmail();
    expect(setInfoText).toHaveBeenCalledWith("User already active");
    stub.restore();
  });

  it("reqPasswordReset works as expected", async () => {
    const setInfoText = jest.fn();
    const stub = sinon.stub(Request, "sendRequest");
    wrapper = shallow(<Auth setInfoText={setInfoText} />);
    await wrapper.instance().reqPasswordReset();
    expect(setInfoText).toHaveBeenCalledWith("Please enter your email");
    wrapper.setState({ username: username });
    stub
      .withArgs({ username: username }, "user/reset_password")
      .returns({ error: "error" });
    await wrapper.instance().reqPasswordReset();
    expect(setInfoText).toHaveBeenCalledWith("error");
    wrapper.setState({ username: username });
    stub
      .withArgs({ username: username }, "user/reset_password")
      .returns({ message: "success" });
    await wrapper.instance().reqPasswordReset();
    expect(setInfoText).toHaveBeenCalledWith("Sending email...");
    stub.restore();
  });
});
