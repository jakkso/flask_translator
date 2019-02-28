import React from "react";
import { shallow } from "enzyme";

import { LanguageSelector } from "../languageSelector";

describe("LanguageSelector", () => {
    let wrapper;
    const langs = [
        ["en", { name: "English" }],
        ["es", { name: "Spanish" }],
        ["de", { name: "German" }]
    ];

    it("Returns a form", () => {
        wrapper = shallow(
            <LanguageSelector
                langs={langs}
                selected={"en"}
                classes={{
                    root: "LanguageSelector-root-323",
                    formControl: "MuiFormControl-root-123"
                }}
            />
        );
        expect(wrapper.find("form").length).toEqual(1);
        expect(wrapper.find(".LanguageSelector-root-323").length).toEqual(1);
        expect(wrapper.find(".MuiFormControl-root-123").length).toEqual(1);
    });
});
