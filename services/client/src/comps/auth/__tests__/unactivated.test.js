import Button from "@material-ui/core/Button";
import Paper from "@material-ui/core/Paper";
import Typography from "@material-ui/core/Typography";
import { shallow } from "enzyme";
import React from "react";

import { styles, Unactivated } from "../unactivated";

let wrapper;

describe("Unactivated", () => {
  it("Returns corrected components", () => {
    wrapper = shallow(<Unactivated classes={styles} />);
    expect(wrapper.find(Button).length).toEqual(2);
    expect(wrapper.find(Paper).length).toEqual(1);
    expect(wrapper.find(Typography).length).toEqual(3);
  });
  it("Click events fire", () => {
    const onSubmit = jest.fn();
    wrapper = shallow(
      <Unactivated classes={styles} sendReq={onSubmit} logout={onSubmit} />
    );
    wrapper
      .find(Button)
      .at(0)
      .simulate("click");
    wrapper
      .find(Button)
      .at(1)
      .simulate("click");
    expect(onSubmit).toHaveBeenCalledTimes(2);
  });
});
