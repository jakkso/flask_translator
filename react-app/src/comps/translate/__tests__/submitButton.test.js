import Button from "@material-ui/core/Button";
import { mount, shallow } from "enzyme";
import React from "react";
import sinon from "sinon";

import { UtilityButton } from "../submitButton";
let wrapper;

describe("Utility Button", () => {
    it("Returns a button", () => {
        wrapper = mount(<UtilityButton buttonText="BUTTON" classes={{}} />);
        expect(wrapper.find("button").length).toEqual(1);
        expect(wrapper.find("span").length).toEqual(2);
    });

    it("Contains 2 span elements", () => {
        wrapper = mount(<UtilityButton buttonText="BUTTON" classes={{}} />);
        expect(wrapper.find("span").length).toEqual(2);
    });

    it("Shallow renders a Button element", () => {
        wrapper = shallow(<UtilityButton buttonText="BUTTON" classes={{}} />);
        expect(wrapper.find(Button).length).toEqual(1);
    });

    it("Simulate button click", () => {
        const onClick = sinon.spy();
        const wrapper = shallow(
            <UtilityButton buttonText="BUTTON" classes={{}} onClick={onClick} />
        );
        wrapper.find(Button).simulate("click");
        expect(onClick.called).toEqual(true);
    });
});
