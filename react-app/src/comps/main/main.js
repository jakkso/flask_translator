import React from 'react';

import Auth from '../auth/auth';
import Bubble from '../notification/notification';
import TitleBar from '../titleBar/titleBar';
import Translate from '../translate/translate';

export default class MainView extends React.Component {
  baseUrl = 'http://localhost:5000/';
  state = {
    infoText: '',
    accessToken: null,
    refreshToken: null,
    langs: null,
  };

  /**
   *
   * @param text {string}
   */
  createSnackbar = (text) => {
    this.setState({infoText: text})
  };

  /**
   * Access tokens expire after 15 min, this method retrieves a new one using refresh
   * token.  If the refresh attempt fails, log out user
   * @return {boolean}
   */
  refreshAccessToken = async () => {
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
      this.createSnackbar('Please log in again.');
      return false;
    }
  };

  /**
   * Token setter, used by Auth child component.
   * @param accessToken
   * @param refreshToken
   */
  setTokens = (accessToken, refreshToken) => {
    this.setState({accessToken, refreshToken})
  };

  /**
   * @param sourceLang abbreviation of a language's name.  e.g., `en` for English
   * @param targetLang abbreviation of a language's name.  e.g., `en` for English
   * @param text Text to translate
   * @return {Promise<*>}
   */
  sendTranslateRequest = async (sourceLang, targetLang, text) => {
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
      this.createSnackbar('Something went wrong, please try again later.')
    } else if (data[0]){
      return data[0];
    }
  };

  /**
   * Invalidates refresh and access tokens via API calls, removes them from state
   * @param event
   */
  logout = async (event) => {
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
  };

  render() {
    const {accessToken, refreshToken, infoText} = this.state;
    const loggedIn = accessToken && refreshToken;
    const translator = loggedIn ?
      <Translate sendReq={this.sendTranslateRequest} logout={this.logout}/>
      : null;
    const error = infoText ? <Bubble message={infoText} clearText={()=> this.setState({infoText: ''})} /> : null;
    const signIn = loggedIn ? null : <Auth baseUrl={this.baseUrl} createSnackbar={this.createSnackbar} setTokens={this.setTokens}/>;
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
