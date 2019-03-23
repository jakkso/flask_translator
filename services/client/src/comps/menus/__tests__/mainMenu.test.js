import Drawer from "@material-ui/core/Drawer";
import { shallow } from "enzyme";
import React from "react";

import AboutModal from "../about";
import DeleteAccount from "../../auth/deleteAccount";
import { MainMenu } from "../mainMenu";
import TitleBar from "../titleBar";

const classes = { list: "" };
let wrapper;

describe("MainMenu Component", () => {
  it("Returns the correct components", () => {
    wrapper = shallow(<MainMenu classes={classes} />);
    expect(wrapper.find("div").length).toEqual(2);
    expect(wrapper.find(TitleBar).length).toEqual(1);
    expect(wrapper.find(Drawer).length).toEqual(1);
    expect(wrapper.find(AboutModal).length).toEqual(0);
    expect(wrapper.find(DeleteAccount).length).toEqual(0);
    // Delete Account and AboutModal items only render when
    // state is set to true for each
    wrapper.setState({ showAbout: true });
    expect(wrapper.find(AboutModal).length).toEqual(1);
    wrapper.setState({ showDelete: true });
    expect(wrapper.find(DeleteAccount).length).toEqual(1);
  });

  it("toggleAbout functions as expected", () => {
    wrapper = shallow(<MainMenu classes={classes} />);
    expect(wrapper.state().showAbout).toEqual(false);
    wrapper.instance().toggleAbout();
    expect(wrapper.state().showAbout).toEqual(true);
    expect(wrapper.state().showDrawer).toEqual(false);
  });

  it("toggleDelete functions as expected", () => {
    wrapper = shallow(<MainMenu classes={classes} />);
    expect(wrapper.state().showDelete).toEqual(false);
    wrapper.instance().toggleDeleteAccount();
    expect(wrapper.state().showDelete).toEqual(true);
    expect(wrapper.state().showDrawer).toEqual(false);
  });

  it("toggleDrawer functions as expected", () => {
    wrapper = shallow(<MainMenu classes={classes} />);
    expect(wrapper.state().showDrawer).toEqual(false);
    wrapper.instance().toggleDrawer();
    expect(wrapper.state().showDrawer).toEqual(true);
    wrapper.instance().toggleDrawer();
    expect(wrapper.state().showDrawer).toEqual(false);
  });

  it("logout functions as expected", () => {
    wrapper = shallow(<MainMenu classes={classes} logout={() => {}} />);
    wrapper.setState({ showDrawer: true });
    expect(wrapper.state().showDrawer).toEqual(true);
    wrapper.instance().logout();
    expect(wrapper.state().showDrawer).toEqual(false);
    setTimeout(() => {
      expect(wrapper.instance().props.logout).toHaveBeenCalledTimes(1);
    }, 301);
  });
});
