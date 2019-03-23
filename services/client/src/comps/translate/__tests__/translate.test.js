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

  it("onSubmit should work as expected", async () => {
    const stub = sinon.stub(Request, "translation").returns({});
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
    await wrapper.instance().onSubmit();
    expect(setInfoText).toHaveBeenCalledWith(
      "Something went wrong, please try again later."
    );
    wrapper.setState({ langs: langs, inputText: 'dogs are good', sourceLang: 'en', targetLang: 'es' });
    stub.withArgs('en', 'es', 'dogs are good').returns({ success: false, message: "Internal server error" });
    // Simulating API error
    await wrapper.instance().onSubmit();
    expect(setInfoText).toHaveBeenCalledWith(
      "Something went wrong, please try again later."
    );
    // Now for a successful translation request
    stub.withArgs('en', 'es', 'dogs are good').returns({ success: true, message: "los perros son buenos" });
    await wrapper.instance().onSubmit();
    expect(wrapper.state().translatedText).toEqual("los perros son buenos");
    expect(wrapper.state().inputText).toEqual('');

    wrapper.setState({ inputText: 'dogs are friendly cats', translatedText: '' });
    // Simulating expired accessToken, where refreshAccessToken must be called
    stub.withArgs('en', 'es', 'dogs are friendly cats')
      .onFirstCall().returns({ success: false, message: "Invalid token" })
      .onSecondCall().returns({ success: true, message: "perros son buenos"});
    await wrapper.instance().onSubmit();
    expect(refreshAccessToken).toHaveBeenCalled();
    expect(wrapper.state().translatedText).toEqual('perros son buenos');
    expect(wrapper.state().inputText).toEqual('');
    stub.restore();
  });

  it("should handle onKeyDown correctly", async () => {
    const setInfoText = jest.fn();
    const preventDefault = jest.fn();
    const event = {keyCode: 13, preventDefault: preventDefault};
    wrapper = shallow(
      <Translate
        setInfoText={setInfoText}
      />);
    wrapper.instance().onKeyDown(event);
    // langs are empty, therefore default error message is displayed
    expect(setInfoText).toHaveBeenCalled();
    expect(preventDefault).toHaveBeenCalled();
    event.which = 13;
    event.keyCode = null;
    wrapper.instance().onKeyDown(event);
    expect(setInfoText).toHaveBeenCalled();
    expect(preventDefault).toHaveBeenCalled();
  });
});
