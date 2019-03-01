import Avatar from "@material-ui/core/Avatar/Avatar";
import Button from "@material-ui/core/Button/Button";
import CssBaseline from "@material-ui/core/CssBaseline/CssBaseline";
import FormControl from "@material-ui/core/FormControl/FormControl";
import Input from "@material-ui/core/Input/Input";
import InputLabel from "@material-ui/core/InputLabel/InputLabel";
import LockOutlinedIcon from "@material-ui/icons/LockOutlined";
import Typography from "@material-ui/core/Typography/Typography";
import Paper from "@material-ui/core/Paper/Paper";
import { shallow } from "enzyme";
import jest from "jest-mock";
import React from "react";

import { Login } from "../login";
import { styles } from "../../styles/styles";

let wrapper;

describe("Login component", () => {
  it("Contains correct components", () => {
    wrapper = shallow(<Login classes={styles} />);
    expect(wrapper.find("main").length).toEqual(1);
    expect(wrapper.find(Avatar).length).toEqual(1);
    expect(wrapper.find(Button).length).toEqual(3);
    expect(wrapper.find(CssBaseline).length).toEqual(1);
    expect(wrapper.find(FormControl).length).toEqual(2);
    expect(wrapper.find(Input).length).toEqual(2);
    expect(wrapper.find(InputLabel).length).toEqual(2);
    expect(wrapper.find(LockOutlinedIcon).length).toEqual(1);
    expect(wrapper.find(Typography).length).toEqual(1);
    expect(wrapper.find(Paper).length).toEqual(1);
  });

  it("Renders children components", () => {
    const children = <div id="hello">Hello!</div>;
    wrapper = shallow(<Login classes={styles} children={children} />);
    expect(wrapper.find("#hello").length).toEqual(1);
    expect(wrapper.find("#hello").text()).toEqual("Hello!");
  });

  it("Changes to input elements call onChange prop", () => {
    const onChange = jest.fn();
    wrapper = shallow(<Login classes={styles} onChange={onChange} />);
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

  it("Click events register properly", () => {
    const onClick = jest.fn();
    wrapper = shallow(
      <Login
        classes={styles}
        toggleModal={onClick}
        onSubmit={onClick}
        resetPassword={onClick}
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
    wrapper
      .find(Button)
      .at(2)
      .simulate("click");
    expect(onClick).toHaveBeenCalledTimes(3);
  });
});
