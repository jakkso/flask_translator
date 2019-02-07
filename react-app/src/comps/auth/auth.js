import React from 'react';

import Login from './login';
import NewPassword from './newPassword';
import Register from "./registration";
import ResetPassword from './resetPasswordRequest';
import Unactivated from './unactivated';


export default class Auth extends React.Component {
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

  setResetPassword = () => {
    this.setState({resetPassword: true})
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
    if (activationToken || passwordResetToken) { // Remove token from URL
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
    const resp = await this.props.sendRequest({}, 'user/activate', {'Authorization': `Bearer ${token}`}, 'PUT');
    if (resp.error) createSnackbar(resp.error);
    else if (resp.msg) createSnackbar('Link invalid or expired');
    else if (resp.message) createSnackbar(resp.message);
    this.clearState();
  };

  /**
   * Validates email address, creating notification if not valid.
   * The regex used is as simple as possible, addresses must be reachable to be verified
   * If users screw up, they won't be able to activate / use the account
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
   *
   * @param event
   * @return {Promise<*>}
   */
  loginHandler = async (event) => {
    if (event) event.preventDefault();
    const {username, password} = this.state;
    const {createSnackbar, setTokens} = this.props;
    if (!username || !password) return createSnackbar('Username and password required');
    const resp = await this.props.sendRequest({username: username, password: password}, 'user/login');
    if (resp.error){
      createSnackbar(resp.error);
    } else {
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
    }
  };

  /**
   *
   * @param event
   * @return {Promise<*>}
   */
  registrationHandler = async (event) => {
    if (event) event.preventDefault();
    if (!this.validateUsername() || !this.validatePassword()) return;
    const {username, password} = this.state;
    const {createSnackbar} = this.props;
    const resp = await this.props.sendRequest({username: username, password: password}, 'user/registration');
    if (resp.error) {
      createSnackbar(resp.error);
      this.clearState();
    } else if (resp.message === `User ${username} was created`){
      this.setState({unactivated: true});
      createSnackbar(resp.message);
    }
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
    const resp = await this.props.sendRequest({password: password}, 'user/reset_password', {'Authorization': `Bearer ${passwordResetToken}`}, 'PUT');
    if (resp.error) createSnackbar(resp.error);
    else if (resp.msg) createSnackbar('Link invalid or expired');
    else if (resp.message) createSnackbar(resp.message);
    this.clearState();
  };

  /**
   * Requests new activation email to be sent to username
   * @return {Promise<*>}
   */
  reqActivationEmail = async () => {
    const {username, password} = this.state;
    const {createSnackbar} = this.props;
    const resp = await this.props.sendRequest({username: username, password: password}, 'user/activate');
    if (resp.error) createSnackbar(resp.error);
    else if (resp.message === 'Bad credentials') {
      this.clearState();
      return createSnackbar(resp.message);
    }
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
    const resp = await this.props.sendRequest({username: username}, 'user/reset_password');
    if (resp.error) createSnackbar(resp.error);
    else createSnackbar('Sending email...');
    this.clearState();
  };

  render() {
    const {
      username,
      password,
      password2,
      registration,
      unactivated,
      resetPassword,
      passwordResetToken
    } = this.state;
    let displayItem;

    if (unactivated) {
      displayItem = (
        <Unactivated
          sendReq={this.reqActivationEmail}
          logout={this.clearState}
        />
      )
    } else if (resetPassword) {
      displayItem = (
        <ResetPassword
          username={username}
          onChange={this.onChange}
          logout={this.clearState}
          onSubmit={this.reqPasswordReset}
        />
      )
    } else if (passwordResetToken) {
      displayItem = (
        <NewPassword
          password={password}
          password2={password2}
          onChange={this.onChange}
          onSubmit={this.passwordResetHandler}
          logout={this.clearState}
        />
      )
    } else {
      const registerModal = registration ?
        <Register
          password={password}
          password2={password2}
          onChange={this.onChange}
          onSubmit={this.registrationHandler}
          toggleModal={this.toggleModal}
        />: null;
      displayItem = (
        <Login
          username={username}
          password={password}
          onChange={this.onChange}
          onSubmit={this.loginHandler}
          toggleModal={this.toggleModal}
          resetPassword={this.setResetPassword}
        >
          {registerModal}
        </Login>
      )
    }
    return (
      displayItem
    );
  }
}
