import Button from "@material-ui/core/Button";
import Paper from "@material-ui/core/Paper";
import Typography from "@material-ui/core/Typography";
import FormControl from "@material-ui/core/FormControl/FormControl";
import InputLabel from "@material-ui/core/InputLabel/InputLabel";
import Input from "@material-ui/core/Input/Input";
import Modal from "@material-ui/core/Modal/Modal";
import { shallow } from "enzyme";
import React from "react";

import { styles } from "../../styles/styles";
import { DeleteAccount } from "../deleteAccount";

let wrapper;

describe("Delete Account", () => {
  it("Contains correct components", () => {
    wrapper = shallow(<DeleteAccount classes={styles} />);
    expect(wrapper.find(Button).length).toEqual(2);
    expect(wrapper.find(Paper).length).toEqual(1);
    expect(wrapper.find(Typography).length).toEqual(2);
    expect(wrapper.find(FormControl).length).toEqual(1);
    expect(wrapper.find(InputLabel).length).toEqual(1);
    expect(wrapper.find(Input).length).toEqual(1);
    expect(wrapper.find(Modal).length).toEqual(1);
  });
  it("Click events fire", () => {
    const onSubmit = jest.fn();
    wrapper = shallow(
      <DeleteAccount classes={styles} toggleDeleteAccount={onSubmit} />
    );
    wrapper
      .find(Button)
      .at(0)
      .simulate("click");
    wrapper
      .find(Button)
      .at(1)
      .simulate("click");
    expect(onSubmit).toHaveBeenCalledTimes(1);
    // if password isn't set, it returns and doesn't call props.onClick
    wrapper.setState({ password: "hunter2" });
    wrapper.instance().onSubmit = onSubmit;
    wrapper
      .find(Button)
      .at(1)
      .simulate("click");
    expect(onSubmit).toHaveBeenCalledTimes(2);
  });
});
