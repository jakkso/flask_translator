import React from 'react';
import { connect } from 'react-redux';
import { Provider } from 'react-redux';
import { createStore } from 'redux';

import Auth from './comps/auth/auth';
import Bubble from './comps/notification/notification';
import MainMenu from './comps/menus/mainMenu';
import sendRequest from './scripts/sendRequest';
import { setAccessToken, setInfoText, setRefreshToken } from "./actions";
import Translate from './comps/translate/translate';
import rootReducer from './reducers';

export const store = createStore(rootReducer);


class MainView extends React.Component {
  /**
   * Access tokens expire after 15 min, this method retrieves a new one using refresh
   * token.  If the refresh attempt fails, log out user
   * @return {boolean}
   */
  refreshAccessToken = async () => {
    const {refreshToken} = this.props.tokens;
    const resp = await sendRequest({}, 'token/refresh', {'Authorization': `Bearer ${refreshToken}`});
    if (resp.error) {
      this.this.props.setInfoText(resp.error);
      return false;
    } else if (resp.access_token) {
      this.props.setAccessToken(resp.access_token);
      return true;
    } else {
      await this.logout();
      this.this.props.setInfoText('Please log in again.');
      return false;
    }
  };

  /**
   * Invalidates refresh and access tokens via API calls, removes them from state
   * @param event
   */
  logout = async (event) => {
    if (event) event.preventDefault();
    const {accessToken, refreshToken} = this.props.tokens;
    this.props.setAccessToken(null);
    this.props.setRefreshToken(null);
    const headers = {'Authorization': `Bearer ${accessToken}`};
    await sendRequest({}, 'logout/access', headers);
    headers['Authorization'] = `Bearer ${refreshToken}`;
    await sendRequest({}, 'logout/refresh', headers);
  };

  render() {
    const { tokens } = this.props;
    const loggedIn = tokens.accessToken && tokens.refreshToken;
    const translator = loggedIn ?
      <Translate refreshAccessToken={this.refreshAccessToken}/>
      : <Auth />;
    return (
      <div>
        <MainMenu
          loggedIn={loggedIn}
          logout={this.logout}
          refreshAccessToken={this.refreshAccessToken}
        />
        {translator}
        <Bubble />
      </div>
    )
  }
}

const providerWrapper = () => {
  const mapStateToProps = state => ({ tokens: state.tokens  });
  const App = connect(mapStateToProps, {setAccessToken, setInfoText, setRefreshToken})(MainView);
  return (
    <Provider store={store}>
      <App />
    </Provider>
  )
};

export default providerWrapper;