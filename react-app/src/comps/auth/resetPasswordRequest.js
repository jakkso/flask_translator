import React from 'react';

import Button from '@material-ui/core/Button';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import withStyles from '@material-ui/core/styles/withStyles';
import FormControl from "@material-ui/core/FormControl/FormControl";
import InputLabel from "@material-ui/core/InputLabel/InputLabel";
import Input from "@material-ui/core/Input/Input";

const styles = theme => ({
  main: {
    width: 'auto',
    display: 'block', // Fix IE 11 issue.
    marginLeft: theme.spacing.unit * 3,
    marginRight: theme.spacing.unit * 3,
    [theme.breakpoints.up(400 + theme.spacing.unit * 3 * 2)]: {
      width: 400,
      marginLeft: 'auto',
      marginRight: 'auto',
    },
  },
  paper: {
    marginTop: theme.spacing.unit * 8,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: `${theme.spacing.unit * 2}px ${theme.spacing.unit * 3}px ${theme.spacing.unit * 3}px`,
  },
  buttons: {
    marginTop: theme.spacing.unit * 3,
  },
  submit: {
    marginTop: theme.spacing.unit * 3,
  },
  form: {
    width: '100%', // Fix IE 11 issue.
    marginTop: theme.spacing.unit,
  },
});

const ResetPasswordRequest = (props) => {
  const {username, onChange, onSubmit, logout, classes} = props;
  return (
    <main className={classes.main}>
      <Paper className={classes.paper}>
        <Typography component="h1" variant="h5">
          Reset Password
        </Typography>
        <Typography component="p">
          Forget your password?  Enter your email and we'll send a password reset email.
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
              onSubmit={onSubmit}
            />
          </FormControl>
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            className={classes.submit}
            onClick={onSubmit}
          >
            Reset Password
          </Button>
          <Button
            type="button"
            fullWidth
            variant="contained"
            color="secondary"
            className={classes.submit}
            onClick={logout}
          >
            Back
          </Button>
        </form>
      </Paper>
    </main>
  )
};

export default withStyles(styles)(ResetPasswordRequest)