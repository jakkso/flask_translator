import Modal from "@material-ui/core/Modal/Modal";
import Typography from "@material-ui/core/Typography/Typography";
import FormControl from "@material-ui/core/FormControl/FormControl";
import InputLabel from "@material-ui/core/InputLabel/InputLabel";
import Input from "@material-ui/core/Input/Input";
import Button from "@material-ui/core/Button/Button";
import { shallow } from "enzyme";
import React from "react";

import { styles } from "../../styles/styles";
import { Register } from "../registration";

let wrapper;

describe("Registration Modal", () => {
  it("Returns correct components", () => {
    wrapper = shallow(<Register classes={styles} />);
    expect(wrapper.find(Button).length).toEqual(1);
    expect(wrapper.find(Input).length).toEqual(3);
    expect(wrapper.find(InputLabel).length).toEqual(3);
    expect(wrapper.find(FormControl).length).toEqual(3);
    expect(wrapper.find(Typography).length).toEqual(1);
    expect(wrapper.find(Modal).length).toEqual(1);
  });
  it("Input Changes call onChange prop", () => {
    const onChange = jest.fn();
    wrapper = shallow(<Register classes={styles} onChange={onChange} />);
    wrapper
      .find(Input)
      .at(0)
      .simulate("change");
    wrapper
      .find(Input)
      .at(1)
      .simulate("change");
    wrapper
      .find(Input)
      .at(2)
      .simulate("change");
    expect(onChange).toHaveBeenCalledTimes(3);
  });
  it("Submission / onClick calls firings register", () => {
    const onSubmit = jest.fn();
    wrapper = shallow(<Register classes={styles} onSubmit={onSubmit} />);
    wrapper
      .find(Button)
      .at(0)
      .simulate("click");
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });
});
