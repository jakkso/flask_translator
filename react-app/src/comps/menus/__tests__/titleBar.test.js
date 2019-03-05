import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import IconButton from "@material-ui/core/IconButton";
import MenuIcon from "@material-ui/icons/Menu";
import { shallow } from "enzyme";
import React from "react";

import { styles, TitleBar } from "../titleBar";

let wrapper;

describe("TitleBar", () => {
  it("Returns proper components", () => {
    wrapper = shallow(<TitleBar classes={styles} />);
    expect(wrapper.find("div").length).toEqual(1);
    expect(wrapper.find(AppBar).length).toEqual(1);
    expect(wrapper.find(Toolbar).length).toEqual(1);
    expect(wrapper.find(Typography).length).toEqual(1);
    expect(wrapper.find(IconButton).length).toEqual(1);
    expect(wrapper.find(MenuIcon).length).toEqual(1);
  });
});
