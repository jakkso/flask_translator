import React from 'react';

import Auth from './comps/auth/auth';
import Bubble from './comps/notification/notification';
import MainMenu from './comps/menus/mainMenu';
import Translate from './comps/translate/translate';



export default class MainView extends React.Component {
  baseUrl = process.env.REACT_APP_API_URL;  // custom env var must start with REACT_APP_
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
   * Error handler for sendRequest
   * @param response
   * @return {{ok}|Object}
   */
  handleErrors = (response) => {
    const errors = [400, 401, 500];
    if (!response.ok && !errors.includes(response.status)) {
      console.error(response);
      throw Error(response);
    } else {
      return response;
    }
  };

  sendRequest = async (body, endpoint, additionalHeaders = {}, method = 'POST') => {
    const url = this.baseUrl + endpoint;
    const headers = {...{'Content-Type': 'application/json'}, ...additionalHeaders};
    const options = {
      method: method,
      mode: 'cors',
      headers: headers,
      body: JSON.stringify(body)
  };
    try {
      const resp = this.handleErrors(await fetch(url, options));
      return await resp.json();
    } catch (e) {
      return {error: 'Something went wrong, try again later.'}
    }

  };

  getFreshAuthHeader = async () => {
    await this.refreshAccessToken();
    const {accessToken} = this.state;
    return {'Authorization': `Bearer ${accessToken}`}
  };

  /**
   * Access tokens expire after 15 min, this method retrieves a new one using refresh
   * token.  If the refresh attempt fails, log out user
   * @return {boolean}
   */
  refreshAccessToken = async () => {
    const {refreshToken} = this.state;
    const resp = await this.sendRequest({}, 'token/refresh', {'Authorization': `Bearer ${refreshToken}`});
    if (resp.error) {
      this.createSnackbar(resp.error);
      return false;
    } else if (resp.access_token) {
      this.setState({accessToken: resp.access_token});
      return true;
    } else {
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
    this.setState({accessToken, refreshToken});
  };

  /**
   * @param sourceLang abbreviation of a language's name.  e.g., `en` for English
   * @param targetLang abbreviation of a language's name.  e.g., `en` for English
   * @param text Text to translate
   * @return {Promise<*>}
   */
  sendTranslateRequest = async (sourceLang, targetLang, text) => {
    const headers = {'Authorization': `Bearer ${this.state.accessToken}`};
    const body = {text: text, to: targetLang, from: sourceLang};
    const resp = await this.sendRequest(body, 'translate', headers);
    // resp.msg indicates that something went wrong, i.e., the access token is missing, invalid or expired
    if (resp.msg) {
      const refreshSuccessful = await this.refreshAccessToken();
      if (refreshSuccessful) {
        return this.sendTranslateRequest(sourceLang, targetLang, text);
      }
      // resp.error means there something went wrong with the request to Azure's translate API
    } else if (resp.error) {
      this.createSnackbar('Something went wrong, please try again later.')
    } else if (resp[0]){
      return resp[0];
    }
  };

  /**
   * Invalidates refresh and access tokens via API calls, removes them from state
   * @param event
   */
  logout = async (event) => {
    if (event) event.preventDefault();
    const {accessToken, refreshToken} = this.state;
    this.setState({accessToken: null, refreshToken: null});
    const headers = {'Authorization': `Bearer ${accessToken}`};
    await this.sendRequest({}, 'logout/access', headers);
    headers['Authorization'] = `Bearer ${refreshToken}`;
    await this.sendRequest({}, 'logout/refresh', headers);
  };

  render() {
    const {accessToken, refreshToken, infoText} = this.state;
    const loggedIn = accessToken && refreshToken;
    const translator = loggedIn ?
      <Translate sendReq={this.sendTranslateRequest} />
      : <Auth
        sendRequest={this.sendRequest}
        createSnackbar={this.createSnackbar}
        setTokens={this.setTokens}
      />;
    const error = infoText ? <Bubble message={infoText} clearText={()=> this.setState({infoText: ''})} /> : null;
    return (
      <div>
        <MainMenu
          loggedIn={loggedIn}
          logout={this.logout}
          sendRequest={this.sendRequest}
          getFreshAuthHeader={this.getFreshAuthHeader}
          createSnackbar={this.createSnackbar}
        />
        {translator}
        {error}
      </div>
    )
  }
}
