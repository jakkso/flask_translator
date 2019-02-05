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

import NewPassword from './newPassword';
import ResetPassword from './resetPasswordRequest';
import Unactivated from './unactivated';

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
    unactivated: false,
    resetPassword: false,
    passwordResetToken: '',
  };

  clearState = () => {
    this.setState({
      username: '',
      password: '',
      password2: '',
      registration: false,
      unactivated: false,
      resetPassword: false,
      passwordResetToken: '',
    })
  };

  onChange = (event) => {
    this.setState({ [event.target.id]: event.target.value })
  };

  toggleModal = () => {
    this.setState((prevState => {
      return {registration: !prevState.registration,};
    }))
  };

  componentDidMount() {
    this.tokenParser();
  }

  /**
   * Checks url for query parameters, calls methods as needed
   * @return {Promise<void>}
   */
  tokenParser = async () => {
    const url = new URL(window.location.href);
    const params = url.searchParams;
    const activationToken = params.get('activate');
    const passwordResetToken = params.get('reset_password');
    if (activationToken) this.activationHandler(activationToken);
    if (passwordResetToken) this.setState({passwordResetToken});
    // Remove token from URL
    if (activationToken || passwordResetToken) {
      window.history.pushState(null, "", window.location.href.split("?")[0]);
    }
   };

  /**
   * Called by tokenParser, handles activation API calls
   * @param token
   * @return {Promise<void>}
   */
  activationHandler = async (token) => {
    const {createSnackbar} = this.props;
    const resp = await this.sendRequest({token: token}, 'activate', 'PUT');
    if (resp.message.includes('has been verified')) this.clearState();
    createSnackbar(resp.message)
  };

  /**
   * Validates email address, creating notification if not valid.
   * The regex used is as simple as possible, addresses must be reachable
   * @return {boolean}
   */
  validateUsername() {
    const {username} = this.state;
    const {createSnackbar} = this.props;
    const re = /[^@]+@[^@]+\.[^@]+/;
    if (!re.test(username)) {
      createSnackbar('Invalid email address');
      return false;
    }
    return true;
  }

  /**
   * Validates passwords match and meet min requirements, creating notification if not
   * @return {boolean}
   */
  validatePassword() {
    const {password, password2} = this.state;
    const {createSnackbar} = this.props;
    const re = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{14,}$/;
    if (!re.test(password)) {
      createSnackbar('Passwords must be at least 14 characters and have a letter and number');
      return false;
    } else if (password !== password2) {
      createSnackbar('Passwords do not match');
      return false;
    }
    return true;
  }

  /**
   * Sends authentication requests to server, return object of the server's response
   * @param body {Object} containing request parameters
   * @param endpoint {string}
   * @param method {string}
   * @return {Promise<{Object}>}
   */
  sendRequest = async (body, endpoint, method = 'POST') => {
    const url = this.props.baseUrl + endpoint;
    const jsonBody = JSON.stringify(body);
    const headers = {'Content-Type': 'application/json'};
    const options = {
      method: method,
      mode: 'cors',
      headers: headers,
      body: jsonBody
    };
    const resp = await fetch(url, options);
    return await resp.json();
  };

  /**
   *
   * @param event
   * @return {Promise<*>}
   */
  loginHandler = async (event) => {
    if (event) event.preventDefault();
    const {username, password} = this.state;
    const {createSnackbar, setTokens} = this.props;
    if (!username || !password) return createSnackbar('Username and password required');
    const resp = await this.sendRequest({username: username, password: password}, 'login');
    switch (resp.message) {
      case 'Bad credentials':
        return createSnackbar('Bad username or password');
      case 'Unverified email address':
        return this.setState({unactivated: true});
      case `Logged in as ${username}`:
        return setTokens(resp.access_token, resp.refresh_token);
      default:
        return;
    }
  };

  /**
   *
   * @param event
   * @return {Promise<*>}
   */
  registrationHandler = async (event) => {
    if (event) event.preventDefault();
    if (!this.validatePassword() || !this.validateUsername()) return;
    const {username, password} = this.state;
    const {createSnackbar} = this.props;
    const resp = await this.sendRequest({username: username, password: password}, 'registration');
    if (resp.message === `User ${username} was created`) this.setState({unactivated: true});
    return createSnackbar(resp.message);
  };

  /**
   * Submits password reset requests
   * @return {Promise<void>}
   */
  passwordResetHandler = async (event) => {
    if (event) event.preventDefault();
    const {passwordResetToken, password} = this.state;
    const {createSnackbar} = this.props;
    if (!this.validatePassword()) return;
    const resp = await this.sendRequest({token: passwordResetToken, password: password}, 'reset_password', 'PUT');
    createSnackbar(resp.message);
    this.clearState();
  };

  /**
   * Requests new activation email to be sent to username
   * @return {Promise<*>}
   */
  reqActivationEmail = async () => {
    const {username, password} = this.state;
    const {createSnackbar} = this.props;
    const resp = await this.sendRequest({username: username, password: password}, 'activate');
    if (resp.message === 'Bad credentials') this.clearState();
    return createSnackbar(resp.message);
  };

  /**
   * Requests password reset email to be sent to username
   * @return {Promise<*>}
   */
  reqPasswordReset = async (event) => {
    if (event) event.preventDefault();
    const {username} = this.state;
    const {createSnackbar} = this.props;
    if (!username) return createSnackbar('Please enter your email');
    const resp = await this.sendRequest({username: username}, 'reset_password');
    createSnackbar(resp.message);
    this.clearState();
  };

  render() {
    const {classes} = this.props;
    const {
      username,
      password,
      password2,
      registration,
      unactivated,
      resetPassword,
      passwordResetToken
    } = this.state;
    if (unactivated) {
      return (
        <Unactivated
          sendReq={this.reqActivationEmail}
          logout={this.clearState}
        />
      )
    } else if (resetPassword) {
      return (
        <ResetPassword
          username={username}
          onChange={this.onChange}
          logout={this.clearState}
          onSubmit={this.reqPasswordReset}
        />
      )
    } else if (passwordResetToken) {
      return (
        <NewPassword
          password={password}
          password2={password2}
          onChange={this.onChange}
          onSubmit={this.passwordResetHandler}
          logout={this.clearState}
        />
      )
    }
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
              onSubmit={this.loginHandler}
              onClick={this.loginHandler}
            >
              Sign in
            </Button>
          </form>
          <Button
            variant="contained"
            color="secondary"
            className={classes.submit}
            onClick={this.toggleModal}
            fullWidth
          >
            Register
          </Button>
          <Button
            fullWidth
            variant="contained"
            className={classes.submit}
            onClick={()=>{this.setState({resetPassword: true})}}
          >
            Forget Password?
          </Button>
        </Paper>
        <Modal
          aria-labelledby="simple-modal-title"
          aria-describedby="simple-modal-description"
          open={registration}
          onClose={this.toggleModal}
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
                <Input
                  id="username"
                  name="username"
                  autoComplete="email"
                  autoFocus
                  value={username}
                  onChange={this.onChange}
                />
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
                onSubmit={this.registrationHandler}
                onClick={this.registrationHandler}
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
