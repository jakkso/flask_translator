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
    const resp = await fetch(url, fetchOptions);
    const data = await resp.json();  // resolve the promise returned by fetch
    if (data.message === `User ${username} already exists`) {
      return this.setState({errText: data.message});
    } else if (data.message === 'Bad credentials' || data.message === `User ${username} does not exist`) {
      return this.setState({errText: 'Bad username or password'});
    } else if (data.message === `Logged in as ${username}` || data.message === `User ${username} was created`) {
      if (data.access_token && data.refresh_token) {
        return this.setState({access_token: data.access_token, refresh_token: data.refresh_token});
      }
      }
  }

  /**
   * TODO this is a naive implementation.  Contains no error handling.
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
      method: 'GET',
      mode: 'cors',
      headers: headers,
      body: JSON.stringify(body)
    });
    const data = await resp.json()[0];
    return data.translations['text'];
  }

  /**
   * Logs out refresh and access tokens, removes them from state
   * @param event
   */
  logout(event) {
    event.preventDefault();
    // TODO call logout flask API here
    this.setState({access_token: null, refresh_token: null})
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
        errText={errText}
        onChange={this.onAuthChange}
        onSubmit={this.onAuthSubmit}
      />;
    const translator = loggedIn ?
      <Translate sendReq={this.sendTranslateRequest} logout={this.logout}/>
      : null;
      return (
      <div>
        {auth}
        {translator}
      </div>
    )
  }

}