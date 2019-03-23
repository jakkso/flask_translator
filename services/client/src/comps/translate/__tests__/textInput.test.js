import TextField from "@material-ui/core/TextField";
import { shallow } from "enzyme";
import React from "react";

import { TextInput } from "../textInput";

let wrapper;
const classes = { textField: "" };

describe("Text Input", () => {
  it("TextField component returned", () => {
    wrapper = shallow(<TextInput classes={classes} />);
    expect(wrapper.find(TextField).length).toEqual(1);
  });
});
