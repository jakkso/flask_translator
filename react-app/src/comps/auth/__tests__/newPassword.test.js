import Button from "@material-ui/core/Button";
import Paper from "@material-ui/core/Paper";
import Typography from "@material-ui/core/Typography";
import FormControl from "@material-ui/core/FormControl/FormControl";
import InputLabel from "@material-ui/core/InputLabel/InputLabel";
import Input from "@material-ui/core/Input/Input";
import { shallow } from "enzyme";
import React from "react";

import { styles } from "../../styles/styles";
import { NewPassword } from "../newPassword";

let wrapper;

describe("NewPassword", () => {
  it("Contains correct components", () => {
    wrapper = shallow(<NewPassword classes={styles} />);
    expect(wrapper.find("main").length).toEqual(1);
    expect(wrapper.find(Button).length).toEqual(2);
    expect(wrapper.find(Paper).length).toEqual(1);
    expect(wrapper.find(FormControl).length).toEqual(2);
    expect(wrapper.find(Input).length).toEqual(2);
    expect(wrapper.find(InputLabel).length).toEqual(2);
    expect(wrapper.find(Typography).length).toEqual(2);
  });

  it("Changes to input elements call onChange prop", () => {
    const onChange = jest.fn();
    wrapper = shallow(<NewPassword classes={styles} onChange={onChange} />);
    wrapper
      .find(Input)
      .at(0)
      .simulate("change");
    wrapper
      .find(Input)
      .at(1)
      .simulate("change");
    expect(onChange).toHaveBeenCalledTimes(2);
  });

  it("Submit calls onSubmit", () => {
    const onSubmit = jest.fn();
    wrapper = shallow(
      <NewPassword classes={styles} logout={onSubmit} onSubmit={onSubmit} />
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
