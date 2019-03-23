import Paper from "@material-ui/core/Paper";
import Typography from "@material-ui/core/Typography";
import { shallow } from "enzyme";
import React from "react";

import { TextDisplay } from "../textDisplay";

let wrapper;
const classes = { root: {} };

describe("Text Display Paper component", () => {
  it("Returns a Paper component", () => {
    wrapper = shallow(<TextDisplay classes={classes} />);
    expect(wrapper.find(Paper).length).toEqual(1);
  });

  it("Contains two Typography Components", () => {
    wrapper = shallow(<TextDisplay classes={classes} />);
    expect(wrapper.find(Typography).length).toEqual(2);
  });
});
