import React from "react";
import { connect } from "react-redux";
import { Provider } from "react-redux";
import { createStore } from "redux";

import Auth from "./comps/auth/auth";
import Bubble from "./comps/notification/notification";
import MainMenu from "./comps/menus/mainMenu";
import Request from "./scripts/sendRequest";
import { setAccessToken, setInfoText, setRefreshToken } from "./actions";
import Translate from "./comps/translate/translate";
import rootReducer from "./reducers";

export const store = createStore(rootReducer);

export class MainView extends React.Component {
  /**
   * Access tokens expire after 15 min, this method retrieves a new one using refresh
   * token.  If the refresh attempt fails, log out user
   * @return {boolean}
   */
  refreshAccessToken = async () => {
    const { refreshToken } = this.props.tokens;
    const resp = await Request.refreshAccessToken(refreshToken);
    if (resp.accessToken) {
      this.props.setAccessToken(resp.accessToken);
    } else {
      await this.logout();
      this.props.setInfoText("Please log in again.");
    }
    return resp.success;
  };

  /**
   * Invalidates refresh and access tokens via API calls, removes them from state
   * @param event
   */
  logout = async event => {
    if (event) event.preventDefault();
    const { accessToken, refreshToken } = this.props.tokens;
    this.props.setAccessToken(null);
    this.props.setRefreshToken(null);
    await Request.logout(accessToken, refreshToken);
  };

  render() {
    const { tokens } = this.props;
    const loggedIn = tokens.accessToken && tokens.refreshToken;
    const translator = loggedIn ? (
      <Translate refreshAccessToken={this.refreshAccessToken} />
    ) : (
      <Auth />
    );
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
    );
  }
}
const mapStateToProps = state => ({ tokens: state.tokens });
export const ConnectedMainView = connect(
  mapStateToProps,
  { setAccessToken, setInfoText, setRefreshToken }
)(MainView);

const providerWrapper = () => {
  const App = ConnectedMainView;
  return (
    <Provider store={store}>
      <App />
    </Provider>
  );
};

export default providerWrapper;
