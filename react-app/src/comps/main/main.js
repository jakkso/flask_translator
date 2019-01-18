import React from 'react';

import './main.css'

import Auth from '../auth/auth';
import Translate from '../translate/translate';

export default class MainView extends React.Component {
  constructor(props) {
    super(props);
    // Bind instance methods
    this.onAuthChange = this.onAuthChange.bind(this);
    this.onAuthSubmit = this.onAuthSubmit.bind(this);
    this.logout = this.logout.bind(this);
    this.sendTranslateRequest = this.sendTranslateRequest.bind(this);
    this.baseUrl = 'http://localhost:5000/';

    // State construction
    this.state = {
      username: '',
      password: '',
      checkbox: false,
      errText: '',
      access_token: null,
      refresh_token: null,
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
      // registration call
      url = this.baseUrl + 'registration';
    } else {
      // login call
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
          access_token: data.access_token,
          refresh_token: data.refresh_token,
          errText: ''
        });
      }
      }
  }

  /**
   * @param sourceLang abbreviation of a language's name.  e.g., `en` for English
   * @param targetLang abbreviation of a language's name.  e.g., `en` for English
   * @param text Text to translate
   * @return {Promise<*>}
   */
  async sendTranslateRequest(sourceLang, targetLang, text) {
    const secretURL = this.baseUrl + 'secret';
    const headers = {'Content-Type': 'application/json', 'Authorization': `Bearer ${this.state.access_token}`};
    const body = {text: text, to: targetLang, from: sourceLang};
    const resp = await fetch(secretURL, {
      method: 'POST',
      mode: 'cors',
      headers: headers,
      body: JSON.stringify(body)
    });
    const data = await resp.json();
    if (data.error) {
      this.setState({errText: `Error: ${data.error.code} ${data.error.message}`});
      return {success: false, message: data.error.message}
    }
    if (data[0]){
      data[0].success = true;
      return data[0];
    }
  }

  /**
   * Invalidates refresh and access tokens via API calls, removes them from state
   * @param event
   */
  async logout(event) {
    event.preventDefault();
    const logoutURL= this.baseUrl + 'logout/';
    const access_headers = {'Content-Type': 'application/json', 'Authorization': `Bearer ${this.state.access_token}`};
    const refresh_headers = {'Content-Type': 'application/json', 'Authorization': `Bearer ${this.state.refresh_token}`};
    const options = {
      method: 'POST',
      mode: 'cors',
      headers: access_headers,
    };
    const invalidateAccess = await fetch(logoutURL + 'access', options);
    options.headers = refresh_headers;
    const invalidateRefresh = await fetch(logoutURL + 'refresh', options);
    if (invalidateAccess.ok && invalidateRefresh.ok) {
      this.setState({access_token: null, refresh_token: null})
    }

  }

  render() {
    const {access_token, refresh_token} = this.state;
    const {username, password, checkbox, errText} = this.state;
    const loggedIn = access_token && refresh_token;
    const auth = loggedIn ? null :
      <Auth
        username={username}
        password={password}
        checkbox={checkbox}
        onChange={this.onAuthChange}
        onSubmit={this.onAuthSubmit}
      />;
    const translator = loggedIn ?
      <Translate sendReq={this.sendTranslateRequest} logout={this.logout}/>
      : null;
    const error = errText ? <div>{errText}</div> : null;
      return (
      <div>
        {auth}
        {translator}
        {error}
      </div>
    )
  }

}