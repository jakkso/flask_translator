import React from 'react';

import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import FormControl from '@material-ui/core/FormControl';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import Modal from "@material-ui/core/Modal/Modal";
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import withStyles from '@material-ui/core/styles/withStyles';

import Unverified from './unactivated';

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
  avatar: {
    margin: theme.spacing.unit,
    backgroundColor: theme.palette.secondary.main,
  },
  form: {
    width: '100%', // Fix IE 11 issue.
    marginTop: theme.spacing.unit,
  },
  submit: {
    marginTop: theme.spacing.unit * 3,
  },
  modal: {
    position: 'absolute',
    width: theme.spacing.unit * 50,
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[5],
    padding: theme.spacing.unit * 4,
    outline: 'none',
    top:'50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
  },
});

class Auth extends React.Component {
  state = {
    username: '',
    password: '',
    password2: '',
    registration: false,
    userErr: false,
    pwErr: false,
    unverified: false,
  };

  onChange = (event) => {
    this.setState({ [event.target.id]: event.target.value })
  };

  handleOpen = () => {
    this.setState({registration: true})
  };

  handleClose = () => {
    this.setState({registration: false, unverified: false})
  };

  validateUsername() {
    const {username} = this.state;
    const {errMsg} = this.props;
    const re = /[^@]+@[^@]+\.[^@]+/;
    if (! re.test(username)) {
      errMsg('Invalid email address');
      return false;
    }
    return true;
  }

  validatePassword() {
    const {password, password2} = this.state;
    const {errMsg} = this.props;
    const re = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{14,}$/;
    if (!re.test(password)) {
      errMsg('Passwords must be at least 14 characters and have a letter and number');
      return false;
    } else if (password !== password2) {
      errMsg('Passwords do not match');
      return false;
    }
    return true;
  }

  onSubmit = (event) => {
    event.preventDefault();
    const {username, password, registration} = this.state;
    const {submitAuth, errMsg} = this.props;
    if (!username || !password) return errMsg('Username and password required');
    if (registration) {
      if (!this.validatePassword() || !this.validateUsername()) return;
    }
    const resp = submitAuth({username: username, password: password, registration: registration});
    if (resp.success) {
      this.setState({
        username: '',
        password: '',
        password2: '',
        registration: false,
        userErr: false,
        pwErr: false,})
    }
    else if (resp.msg === 'Unverified email address') {
      this.setState({unverified: true})
    }
  };

  render() {
    const {classes} = this.props;
    const {username, password, password2, registration, unverified} = this.state;
    const verificationModal = unverified ?
      <Unverified
        username={username}
        sendReq={console.log}
        onClose={this.handleClose}
      />
      :null;
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
                onChange={this.onChange}
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
                onChange={this.onChange}
              />
            </FormControl>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              className={classes.submit}
              onSubmit={this.onSubmit}
              onClick={this.onSubmit}
            >
              Sign in
            </Button>
          </form>
          <Button
            variant="contained"
            color="secondary"
            className={classes.submit}
            onClick={this.handleOpen}
            fullWidth
          >
            Register
          </Button>
        </Paper>
        <Modal
          aria-labelledby="simple-modal-title"
          aria-describedby="simple-modal-description"
          open={registration}
          onClose={this.handleClose}
        >
          <div className={classes.modal}>
            <Typography variant="h6" id="modal-title">
              Register
            </Typography>
            <form>
              <FormControl
                margin="normal"
                required
                fullWidth
              >
                <InputLabel htmlFor="username">Email Address</InputLabel>
                <Input id="username" name="username" autoComplete="email" autoFocus value={username} onChange={this.onChange} />
              </FormControl>
              <FormControl
                margin="normal"
                required
                fullWidth
              >
                <InputLabel htmlFor="password">Password</InputLabel>
                <Input
                  id="password"
                  name="password"
                  value={password}
                  onChange={this.onChange}
                  type="password"
                />
              </FormControl>
              <FormControl
                margin="normal"
                required
                fullWidth
              >
                <InputLabel htmlFor="password2">Repeat Password</InputLabel>
                <Input
                  id="password2"
                  name="password2"
                  value={password2}
                  onChange={this.onChange}
                  type="password"
                />
              </FormControl>
              <Button
                fullWidth
                variant="contained"
                color="primary"
                className={classes.submit}
                onSubmit={this.onSubmit}
                onClick={this.onSubmit}
              >
                Submit
              </Button>
            </form>
          </div>
        </Modal>
      </main>
    );
  }
}

export default withStyles(styles)(Auth)
