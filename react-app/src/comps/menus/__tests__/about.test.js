import Button from "@material-ui/core/Button/Button";
import Modal from "@material-ui/core/Modal/Modal";
import Typography from "@material-ui/core/Typography/Typography";
import { shallow } from "enzyme";
import React from "react";

import { AboutModal } from "../about";

let wrapper;
const classes = { modal: "", submit: "" };

describe("About Modal", () => {
  it("Returns a Modal component, with 2 typography and 1 button component", () => {
    wrapper = shallow(<AboutModal classes={classes} />);
    expect(wrapper.find(Modal).length).toEqual(1);
    expect(wrapper.find(Typography).length).toEqual(2);
    expect(wrapper.find(Button).length).toEqual(1);
  });

  it("Typography components contain correct text", () => {
    wrapper = shallow(<AboutModal classes={classes} />);
    expect(wrapper.find("#modal-title").length).toEqual(1);
    expect(
      wrapper
        .find("#modal-title")
        .dive()
        .dive()
        .text()
    ).toEqual("About");
    expect(
      wrapper
        .find(Typography)
        .at(1)
        .dive()
        .dive()
        .text()
    ).toContain("RESTful");
  });
});
