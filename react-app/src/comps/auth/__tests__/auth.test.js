import { shallow } from "enzyme";
import React from "react";

import { Auth } from "../auth";
import Login from "../login";
import Unactivated from "../unactivated";
import Register from "../registration";
import ResetPassword from "../resetPasswordRequest";

let wrapper;

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
});
