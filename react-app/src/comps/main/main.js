import React from 'react';

import Auth from '../auth/auth';
import Bubble from '../notification/notification';
import TitleBar from '../titleBar/titleBar';
import Translate from '../translate/translate';
import Unverified from '../auth/unactivated';

export default class MainView extends React.Component {
  constructor(props) {
    super(props);
    this.baseUrl = 'http://localhost:5000/';

    // Bind instance methods
    this.errMsg = this.errMsg.bind(this);
    this.logout = this.logout.bind(this);
    this.refreshAccessToken = this.refreshAccessToken.bind(this);
    this.sendTranslateRequest = this.sendTranslateRequest.bind(this);
    this.submitAuthRequest = this.submitAuthRequest.bind(this);

    // State construction
    this.state = {
      errText: '',
      accessToken: null,
      refreshToken: null,
      langs: null,
    }
  }

  /**
   *
   * @param errText {string}
   */
  errMsg(errText) {
    this.setState({errText})
  }

  /**
   *
   * @param creds {object} containing username, password and registration attributes
   * @return {Promise<void>}
   */
  async submitAuthRequest(creds) {
    const url = creds.registration ? this.baseUrl + 'registration': this.baseUrl + 'login';
    const body = JSON.stringify({username: creds.username, password: creds.password});
    const headers = {"Content-Type": 'application/json'};
    const options = {
      method: 'POST',
      mode: 'cors',
      headers: headers,
      body: body
    };

    const resp = await fetch(url, options);
    const data = await resp.json();
    const res = {success: null, msg: null};
    if (data.message === `User ${creds.username} already exists`) {
      return this.errMsg(data.message);
    } else if (data.message === 'Bad credentials' || data.message === `User ${creds.username} does not exist`) {
      this.errMsg('Bad username or password');
      res.success = false;
    } else if (data.message === 'Unverified email address') {
      res.success = false;
      res.msg = data.message;
    } else if (data.message === `Logged in as ${creds.username}` || data.message === `User ${creds.username} was created`) {
      if (data.access_token && data.refresh_token) {
        this.setState({
          accessToken: data.access_token,
          refreshToken: data.refresh_token,
          errText: ''
        });
        res.success = true;
      }
    } else {
      this.errMsg('Authentication failure, please try again later');
      res.success = false;
      res.msg = 'Authentication failure, please try again later';
    }
    return res;
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
    const {accessToken, refreshToken, errText} = this.state;
    const loggedIn = accessToken && refreshToken;
    const translator = loggedIn ?
      <Translate sendReq={this.sendTranslateRequest} logout={this.logout}/>
      : null;
    const error = errText ? <Bubble message={errText} clearText={()=> this.setState({errText: ''})} /> : null;
    const signIn = loggedIn ? null : <Auth submitAuth={this.submitAuthRequest} errMsg={this.errMsg}/>;
      return (
        <div>
          {/*<TitleBar/>*/}
          {signIn}
          {/*{translator}*/}
          {/*{error}*/}
        </div>
    )
  }
}
