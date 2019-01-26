import React from 'react';

import './main.css'

import Bubble from '../notification/notification';
import SignIn from '../auth/auth';
import TitleBar from '../titleBar/titleBar';
import Translate from '../translate/translate';

export default class MainView extends React.Component {
  constructor(props) {
    super(props);
    this.baseUrl = 'http://localhost:5000/';

    // Bind instance methods
    this.onAuthChange = this.onAuthChange.bind(this);
    this.onAuthSubmit = this.onAuthSubmit.bind(this);
    this.refreshAccessToken = this.refreshAccessToken.bind(this);
    this.logout = this.logout.bind(this);
    this.sendTranslateRequest = this.sendTranslateRequest.bind(this);

    // State construction
    this.state = {
      username: '',
      password: '',
      checkbox: false,
      errText: '',
      accessToken: null,
      refreshToken: null,
      langs: null,
    }
  }

  /**
   * Handler for managing user input on auth components
   * @param event
   */
  onAuthChange(event) {
    switch (event.target.id) {
      case 'username':
        return this.setState({username: event.target.value});
      case 'password':
        return this.setState({password: event.target.value});
      case 'registrationCheckbox':
        return this.setState(prevState => {
          return {checkbox: !prevState.checkbox}
        });
      default:
        return;
    }
  }

  /**
   * Handles logging in / registration calls
   * @param event
   */
  async onAuthSubmit(event) {
    event.preventDefault();
    let url;
    const {username, password, checkbox} = this.state;
    const body = JSON.stringify({username: username, password: password});
    const headers = {"Content-Type": 'application/json'};
    const fetchOptions = {
      method: 'POST',
      mode: 'cors',
      headers: headers,
      body: body
    };
    if (checkbox) {
      url = this.baseUrl + 'registration';
    } else {
      url = this.baseUrl + 'login';
    }
    if (!username || !password) return;
    const resp = await fetch(url, fetchOptions);
    const data = await resp.json();  // resolve the promise returned by fetch
    if (data.message === `User ${username} already exists`) {
      return this.setState({errText: data.message});
    } else if (data.message === 'Bad credentials' || data.message === `User ${username} does not exist`) {
      return this.setState({errText: 'Bad username or password'});
    } else if (data.message === `Logged in as ${username}` || data.message === `User ${username} was created`) {
      if (data.access_token && data.refresh_token) {
        this.setState({username: '', password: ''});
        return this.setState({
          accessToken: data.access_token,
          refreshToken: data.refresh_token,
          errText: ''
        });
      } else {
        return this.setState({username: '', password: '', errText: 'Authentication failure, please try again later'})
      }
    }
  }

  /**
   * Access tokens expire after 15 min, this method retrieves a new one using refresh
   * token.  If the refresh attempt fails, log out user
   * @return {boolean}
   */
  async refreshAccessToken() {
    const {refreshToken} = this.state;
    const url = this.baseUrl + 'token/refresh';
    const headers = {'Content-Type': 'application/json', 'Authorization': `Bearer ${refreshToken}`};
    const options = {
      method: 'POST',
      mode: 'cors',
      headers: headers,
    };
    const resp = await fetch(url, options);
    const data = await resp.json();
    if (data.access_token) {
      this.setState({accessToken: data.access_token});
      return true;
    }
    else {
      await this.logout();
      this.setState({errText: 'Please log in again.'});
      return false;
    }
  }

  /**
   * @param sourceLang abbreviation of a language's name.  e.g., `en` for English
   * @param targetLang abbreviation of a language's name.  e.g., `en` for English
   * @param text Text to translate
   * @return {Promise<*>}
   */
  async sendTranslateRequest(sourceLang, targetLang, text) {
    const translateURL = this.baseUrl + 'translate';
    const headers = {'Content-Type': 'application/json', 'Authorization': `Bearer ${this.state.accessToken}`};
    const body = {text: text, to: targetLang, from: sourceLang};
    const resp = await fetch(translateURL, {
      method: 'POST',
      mode: 'cors',
      headers: headers,
      body: JSON.stringify(body)
    });
    const data = await resp.json();
    // data.msg indicates that something went wrong, i.e., the access token is missing, invalid or expired
    if (data.msg) {
      const refreshSuccessful = await this.refreshAccessToken();
      if (refreshSuccessful) {
        return this.sendTranslateRequest(sourceLang, targetLang, text);
      }
      // data.error means there something went wrong with the request to Azure's translate API
    } else if (data.error) {
      this.setState({errText: 'Something went wrong, please try again later.'});
    } else if (data[0]){
      return data[0];
    }
  }

  /**
   * Invalidates refresh and access tokens via API calls, removes them from state
   * @param event
   */
  async logout(event) {
    // Can also be called by refreshAccessToken, which doesn't call with event param
    if (event) event.preventDefault();
    const logoutURL = this.baseUrl + 'logout/';
    const {accessToken, refreshToken} = this.state;
    this.setState({accessToken: null, refreshToken: null, checkbox: false});
    const headers = {'Content-Type': 'application/json', 'Authorization': `Bearer ${accessToken}`};
    const options = {
      method: 'POST',
      mode: 'cors',
      headers: headers,
    };
    await fetch(logoutURL + 'access', options);
    options.headers['Authorization'] = `Bearer ${refreshToken}`;
    await fetch(logoutURL + 'refresh', options);
  }

  render() {
    const {accessToken, refreshToken, username, password, errText} = this.state;
    const loggedIn = accessToken && refreshToken;
    const translator = loggedIn ?
      <Translate sendReq={this.sendTranslateRequest} logout={this.logout}/>
      : null;
    const error = errText ? <Bubble message={errText} clearText={()=> this.setState({errText: ''})} /> : null;
    const signIn = loggedIn ? null : <SignIn
      username={username}
      password={password}
      onChange={this.onAuthChange}
      onSubmit={this.onAuthSubmit}
    />;
      return (
        <div>
          <TitleBar/>
          {signIn}
          {translator}
          {error}
        </div>
    )
  }
}