import React from 'react';

import './main.css'

import Auth from '../auth/auth';
import Translator from '../translate/translate';

export default class MainView extends React.Component {
  constructor(props) {
    super(props);
    // Bind instance methods
    this.onAuthChange = this.onAuthChange.bind(this);
    this.onAuthSubmit = this.onAuthSubmit.bind(this);
    this.logout = this.logout.bind(this);
    this.sendTranslateRequest = this.sendTranslateRequest.bind(this);
    this.baseUrl = 'localhost:5000/';

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
  onAuthSubmit(event) {
    event.preventDefault();
    const {checkbox} = this.state;
    if (checkbox) {
      // registration call
    } else {
      // login call
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


      return (
      <div>
        {auth}
      </div>
    )
  }

}