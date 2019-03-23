import Button from "@material-ui/core/Button";
import Paper from "@material-ui/core/Paper";
import Typography from "@material-ui/core/Typography";
import FormControl from "@material-ui/core/FormControl/FormControl";
import InputLabel from "@material-ui/core/InputLabel/InputLabel";
import Input from "@material-ui/core/Input/Input";
import { shallow } from "enzyme";
import React from "react";

import { styles } from "../../styles/styles";
import { ResetPasswordRequest } from "../resetPasswordRequest";

let wrapper;

describe("Password Reset Request", () => {
  it("Returns correct components", () => {
    wrapper = shallow(<ResetPasswordRequest classes={styles} />);
    expect(wrapper.find(Button).length).toEqual(2);
    expect(wrapper.find(Paper).length).toEqual(1);
    expect(wrapper.find(Typography).length).toEqual(2);
    expect(wrapper.find(FormControl).length).toEqual(1);
    expect(wrapper.find(InputLabel).length).toEqual(1);
    expect(wrapper.find(Input).length).toEqual(1);
  });
  it("onChange fires on change events", () => {
    const onChange = jest.fn();
    wrapper = shallow(
      <ResetPasswordRequest classes={styles} onChange={onChange} />
    );
    wrapper
      .find(Input)
      .at(0)
      .simulate("change");
    expect(onChange).toHaveBeenCalledTimes(1);
  });
  it("onSubmit fires when buttons clicked", () => {
    const onSubmit = jest.fn();
    wrapper = shallow(
      <ResetPasswordRequest
        classes={styles}
        onSubmit={onSubmit}
        logout={onSubmit}
      />
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
