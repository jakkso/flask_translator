import React from "react";
import ReactDOM from "react-dom";
import { shallow } from "enzyme";

import App from "./App";
import { MainView } from "./App";
import Auth from "./comps/auth/auth";
import Bubble from "./comps/notification/notification";
import MainMenu from "./comps/menus/mainMenu";
import Request from "./scripts/sendRequest";
import Translate from "./comps/translate/translate";
import sinon from "sinon";

const tokens = { accessToken: "", refreshToken: "" };
let wrapper;

it("renders without crashing", () => {
  const div = document.createElement("div");
  ReactDOM.render(<App />, div);
  ReactDOM.unmountComponentAtNode(div);
});

describe("App Component", () => {
  it("should contain correct components", () => {
    wrapper = shallow(<MainView tokens={tokens} />);
    expect(wrapper.find(Auth).length).toEqual(1);
    expect(wrapper.find(Bubble).length).toEqual(1);
    expect(wrapper.find(MainMenu).length).toEqual(1);
    // Auth is mounted opposite translate, depending upon if login is successful
    expect(wrapper.find(Translate).length).toEqual(0);
    tokens.accessToken = "123";
    tokens.refreshToken = "456";
    wrapper.setProps({ tokens: tokens });
    wrapper.update();
    expect(wrapper.find(Translate).length).toEqual(1);
    expect(wrapper.find(Auth).length).toEqual(0);
  });

  it("refreshAccessToken behaves as expected", async () => {
    let res;
    sinon
      .stub(Request, "sendRequest")
      .onFirstCall()
      .returns({ error: "err" })
      .onSecondCall()
      .returns({ access_token: "123" })
      .onThirdCall()
      .returns({});
    const setInfoText = jest.fn();
    const setAccessToken = jest.fn();
    const setRefreshToken = jest.fn();
    wrapper = shallow(
      <MainView
        setInfoText={setInfoText}
        setRefreshToken={setRefreshToken}
        setAccessToken={setAccessToken}
        tokens={tokens}
      />
    );
    // error is returned by API
    res = await wrapper.instance().refreshAccessToken();
    expect(res).toEqual(false);
    expect(setInfoText).toHaveBeenCalledWith("err");
    // access_token is returned
    res = await wrapper.instance().refreshAccessToken();
    expect(res).toEqual(true);
    expect(setAccessToken).toHaveBeenCalledWith("123");
    // Otherwise logout the user
    res = await wrapper.instance().refreshAccessToken();
    expect(res).toEqual(false);
    expect(setInfoText).toHaveBeenCalledWith("Please log in again.");
    expect(setRefreshToken).toHaveBeenCalled();
    expect(setAccessToken).toHaveBeenCalled();
  });

  it("logout behaves as expected", async () => {
    const setInfoText = jest.fn();
    const setAccessToken = jest.fn();
    const setRefreshToken = jest.fn();
    wrapper = shallow(
      <MainView
        setInfoText={setInfoText}
        setRefreshToken={setRefreshToken}
        setAccessToken={setAccessToken}
        tokens={tokens}
      />
    );
    await wrapper.instance().logout();
    expect(setAccessToken).toHaveBeenCalledWith(null);
    expect(setRefreshToken).toHaveBeenCalledWith(null);
  });
});
