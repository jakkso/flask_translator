import Snackbar from "@material-ui/core/Snackbar";
import { shallow } from "enzyme";
import React from "react";

import { Bubble } from "./notification";

let wrapper;

describe("Notification Bubble", () => {
  it("Returns a Snackbar component", () => {
    wrapper = shallow(<Bubble />);
    expect(wrapper.find(Snackbar).length).toEqual(1);
  });

  it("Bubble initially renders as closed", () => {
    wrapper = shallow(<Bubble />);
    expect(wrapper.state().open).toEqual(false);
  });

  it("Bubble handleClose sets state to close, calls props.setInfoText", () => {
    wrapper = shallow(<Bubble infoText={"Hello!"} setInfoText={() => {}} />);
    expect(wrapper.state().open).toEqual(false);
    wrapper.setState({ open: true });
    expect(wrapper.state().open).toEqual(true);
    wrapper.instance().handleClose();
    expect(wrapper.state().open).toEqual(false);
    setTimeout(() => {
      expect(wrapper.instance().props.setInfoText).toHaveBeenCalledTimes(1);
    }, 501);
  });
});
