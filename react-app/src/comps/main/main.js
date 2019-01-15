import React from 'react';

import './main.css'

import Auth from '../auth/auth'

export default class MainView extends React.Component {
  constructor(props) {
    super(props);
    // Bind instance methods
    this.onAuthChange = this.onAuthChange.bind(this);
    this.onAuthSubmit = this.onAuthSubmit.bind(this);
    this.getLangs = this.getLangs.bind(this);
    // State construction
    this.state = {
      username: '',
      password: '',
      checkbox: false,
      errText: '',
      inputText: '',
      translatedText: '',
      sourceLang: null,
      targetLang: null,
      access_token: null,
      refresh_token: null,
      logged_in: false,
      langs: null,
    }
  }

  /**
   * Make network call after comp mounts.  This will trigger
   * a component re-render if user is logged in.
   */
  componentDidMount() {
    const langs = this.getLangs();
    this.setState({langs});
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
   * Handles logging in / registration
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
   * In the future this will be replaced with an api call to MS,
   * but I'm on a plane without net access, so I can't get an example
   * of what the return value actually is.  I think it's somewhat similar to this.
   */
  getLangs() {
    const langs = [
      {name: 'en', fullName: 'English'},
      {name: 'fr', fullName: 'French'},
      {name: 'it', fullName: 'Italian'},
      {name: 'es', fullName: 'Spanish'},
    ];
    return langs;
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