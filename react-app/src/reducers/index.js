import { combineReducers } from "redux";

import infoText from "./infoText";
import tokens from "./tokens";

export default combineReducers({
  tokens,
  infoText
});
