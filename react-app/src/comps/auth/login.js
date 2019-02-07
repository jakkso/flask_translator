import React from 'react';

import withStyles from '@material-ui/core/styles/withStyles';


import {styles} from '../styles/styles'
import CssBaseline from "@material-ui/core/CssBaseline/CssBaseline";
import Paper from "@material-ui/core/Paper/Paper";
import Avatar from "@material-ui/core/Avatar/Avatar";
import LockOutlinedIcon from "@material-ui/core/SvgIcon/SvgIcon";
import Typography from "@material-ui/core/Typography/Typography";
import FormControl from "@material-ui/core/FormControl/FormControl";
import InputLabel from "@material-ui/core/InputLabel/InputLabel";
import Input from "@material-ui/core/Input/Input";
import Button from "@material-ui/core/Button/Button";


const Login = (props) => {
  const {
    username,
    password,
    onChange,
    onSubmit,
    toggleModal,
    resetPassword,
    classes,
  } = props;
  return (
    <main className={classes.main}>
      <CssBaseline />
      <Paper className={classes.paper}>
        <Avatar className={classes.avatar}>
          <LockOutlinedIcon />
        </Avatar>
        <Typography component="h1" variant="h5">
          Sign in
        </Typography>
        <form className={classes.form}>
          <FormControl margin="normal" required fullWidth>
            <InputLabel htmlFor="email">Email Address</InputLabel>
            <Input
              id="username"
              name="email"
              autoComplete="email"
              autoFocus
              value={username}
              onChange={onChange}
            />
          </FormControl>
          <FormControl margin="normal" required fullWidth>
            <InputLabel htmlFor="password">Password</InputLabel>
            <Input
              name="password"
              type="password"
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={onChange}
            />
          </FormControl>
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            className={classes.submit}
            onSubmit={onSubmit}
            onClick={onSubmit}
          >
            Sign in
          </Button>
        </form>
        <Button
          variant="contained"
          color="secondary"
          className={classes.submit}
          onClick={toggleModal}
          fullWidth
        >
          Register
        </Button>
        <Button
          fullWidth
          variant="contained"
          className={classes.submit}
          onClick={resetPassword}
        >
          Forget Password?
        </Button>
      </Paper>
    </main>
  );
};

export default withStyles(styles)(Login);
