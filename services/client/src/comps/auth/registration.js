import React from "react";

import withStyles from "@material-ui/core/styles/withStyles";

import { styles } from "../styles/styles";
import Modal from "@material-ui/core/Modal/Modal";
import Typography from "@material-ui/core/Typography/Typography";
import FormControl from "@material-ui/core/FormControl/FormControl";
import InputLabel from "@material-ui/core/InputLabel/InputLabel";
import Input from "@material-ui/core/Input/Input";
import Button from "@material-ui/core/Button/Button";

export const Register = props => {
  const {
    username,
    password,
    password2,
    onChange,
    onSubmit,
    classes,
    toggleModal
  } = props;
  return (
    <Modal
      aria-labelledby="simple-modal-title"
      aria-describedby="simple-modal-description"
      open={true}
      onClose={toggleModal}
    >
      <div className={classes.modal}>
        <Typography variant="h6" id="modal-title">
          Register
        </Typography>
        <form>
          <FormControl margin="normal" required fullWidth>
            <InputLabel htmlFor="username">Email Address</InputLabel>
            <Input
              id="username"
              name="username"
              autoComplete="email"
              autoFocus
              value={username}
              onChange={onChange}
            />
          </FormControl>
          <FormControl margin="normal" required fullWidth>
            <InputLabel htmlFor="password">Password</InputLabel>
            <Input
              required
              id="password"
              name="password"
              value={password}
              onChange={onChange}
              type="password"
            />
          </FormControl>
          <FormControl margin="normal" required fullWidth onSubmit={onSubmit}>
            <InputLabel htmlFor="password2">Repeat Password</InputLabel>
            <Input
              required
              id="password2"
              name="password2"
              value={password2}
              onChange={onChange}
              type="password"
            />
          </FormControl>
          <Button
            fullWidth
            variant="contained"
            color="primary"
            className={classes.submit}
            onSubmit={onSubmit}
            onClick={onSubmit}
          >
            Submit
          </Button>
        </form>
      </div>
    </Modal>
  );
};

export default withStyles(styles)(Register);
