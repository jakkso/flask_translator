import Grid from "@material-ui/core/Grid";
import Paper from "@material-ui/core/Paper";
import { shallow } from "enzyme";
import React from "react";
import sinon from "sinon";

import Button from "../submitButton";
import LanguageSelector from "../languageSelector";
import TextInput from "../textInput";
import TextDisplay from "../textDisplay";
import { Translate } from "../translate";
import Request from "../../../scripts/sendRequest";

let wrapper;
const langs = [
  ["en", { name: "English" }],
  ["es", { name: "Spanish" }],
  ["de", { name: "German" }]
];

describe("Translate Component", () => {
  it("Returns correct components", () => {
    wrapper = shallow(<Translate />);
    expect(wrapper.find(Button).length).toEqual(1);
    // language selectors aren't rendered until the list of languages is fetched
    expect(wrapper.find(LanguageSelector).length).toEqual(0);
    expect(wrapper.find(TextInput).length).toEqual(1);
    expect(wrapper.find(TextDisplay).length).toEqual(1);
    expect(wrapper.find(Grid).length).toEqual(4);
    expect(wrapper.find(Paper).length).toEqual(1);
    expect(wrapper.find("div").length).toEqual(1);
    expect(wrapper.find("form").length).toEqual(1);
    wrapper.instance().setState({ langs: langs });
    wrapper.update();
    // Now that we have a language list, selectors are rendered
    expect(wrapper.find(LanguageSelector).length).toEqual(2);
  });

  it("onChange should update event.target.name to event.target.value", () => {
    wrapper = shallow(<Translate />);
    const event = { target: { name: "inputText", value: "hello" } };
    wrapper.instance().onChange(event);
    expect(wrapper.state().inputText).toEqual("hello");
  });

  it("sendTranslateRequest should work as expected", async () => {
    const stub = sinon.stub(Request, "sendRequest").returns({});
    const setInfoText = jest.fn();
    const refreshAccessToken = jest.fn(() => true);
    const tokens = { refreshToken: 123, accessToken: 456 };
    wrapper = shallow(
      <Translate
        setInfoText={setInfoText}
        tokens={tokens}
        refreshAccessToken={refreshAccessToken}
      />
    );
    // If languages haven't been fetched yet, function will return early
    await wrapper.instance().sendTranslateRequest();
    expect(setInfoText).toHaveBeenCalledWith(
      "Something went wrong, please try again later."
    );
    wrapper.setState({ langs: langs });
    const headers = { Authorization: "Bearer 456" };
    const body = { text: "dogs are good", to: "es", from: "en" };
    stub.withArgs(body, "translate", headers).returns({ error: "" });
    // Simulating API error
    await wrapper.instance().sendTranslateRequest("en", "es", "dogs are good");
    expect(setInfoText).toHaveBeenCalledWith(
      "Something went wrong, please try again later."
    );
    // Now for a successful translation request
    stub.withArgs(body, "translate", headers).returns(["hello", "there"]);
    let req = await wrapper
      .instance()
      .sendTranslateRequest("en", "es", "dogs are good");
    expect(req).toEqual("hello");
    // Now simulating expired accessToken, where refreshAccessToken must be called
    stub.reset();
    stub
      .withArgs(body, "translate", headers)
      .onFirstCall()
      .returns({ msg: { msg: "" } })
      .onSecondCall()
      .returns(["there"]);
    req = await wrapper
      .instance()
      .sendTranslateRequest("en", "es", "dogs are good");
    expect(refreshAccessToken).toHaveBeenCalled();
    expect(req).toEqual("there");
    stub.restore();
  });
});
