import React from "react";

import Grid from "@material-ui/core/Grid";
import Paper from "@material-ui/core/Paper";
import { connect } from "react-redux";

import Button from "./submitButton";
import LanguageSelector from "./languageSelector";
import Request from "../../scripts/sendRequest";
import TextInput from "./textInput";
import TextDisplay from "./textDisplay";
import { setInfoText } from "../../actions";

const DEFAULT_ERR_MSG = 'Something went wrong, please try again later.';

export class Translate extends React.Component {
  state = {
    inputText: "",
    translatedText: "",
    sourceLang: "en",
    targetLang: "es",
    langs: null
  };

  /**
   * onchange handler for storing source and target languages and inputText in state
   * @param event
   */
  onChange = event => {
    this.setState({ [event.target.name]: event.target.value });
  };

  /**
   *
   * @param event
   * @return {Promise<void>}
   */
  onSubmit = async event => {
    if (event) event.preventDefault();
    const { inputText, sourceLang, targetLang, langs } = this.state;
    if (!langs) return this.props.setInfoText(DEFAULT_ERR_MSG);
    const response = await Request.translation(sourceLang, targetLang, inputText, this.props.tokens.accessToken);
    if (response.success) this.setState({ translatedText: response.message, inputText: "" });
    else {
      if (response.message === 'Internal server error') {
        this.props.setInfoText(DEFAULT_ERR_MSG);
      } else if (response.message === 'Invalid token') {
        const success = await this.props.refreshAccessToken();
        if (success) return this.onSubmit();
      }
    }
  };

  /**
   * Watch for Return key-presses.
   * Prevents addition of newline character to the input box, as well
   * as the page refresh, instead calling submit
   * @param event
   */
  onKeyDown = event => {
    if (event.keyCode === 13 || event.which === 13) {
      event.preventDefault();
      return this.onSubmit();
    }
  };

  /**
   * Populate state with array of languages fetched from the azure api
   * @return {void}
   */
  async componentDidMount() {
    const langsURL =
      "https://api.cognitive.microsofttranslator.com/languages?api-version=3.0";
    const res = await fetch(langsURL);
    const data = await res.json();
    this.setState({ langs: Object.entries(data.translation) });
  }

  render() {
    const {
      inputText,
      translatedText,
      sourceLang,
      targetLang,
      langs
    } = this.state;
    const srcSelect = langs ? (
      <LanguageSelector
        langs={langs}
        excluded={targetLang}
        onChange={this.onChange}
        id="sourceLang"
        selected={sourceLang}
        label="Source Language"
      />
    ) : null;
    const targetSelect = langs ? (
      <LanguageSelector
        langs={langs}
        excluded={sourceLang}
        onChange={this.onChange}
        id="targetLang"
        selected={targetLang}
        label="Target Language"
      />
    ) : null;
    return (
      <div>
        <Grid
          container
          direction={"column"}
          justify={"space-evenly"}
          alignItems={"center"}
          spacing={8}
        >
          <Grid item container xs={12} direction={"row"} justify={"center"}>
            {srcSelect}
            {targetSelect}
          </Grid>
          <Paper>
            <Grid
              item
              container
              direction={"row"}
              justify={"center"}
              alignItems={"center"}
            >
              <form>
                <TextInput
                  inputText={inputText}
                  onChange={this.onChange}
                  onSubmit={this.onSubmit}
                  onKeyDown={this.onKeyDown}
                />
              </form>
              <Button onClick={this.onSubmit} buttonText="Translate" />
            </Grid>
          </Paper>
          <Grid item xs={12}>
            <TextDisplay text={translatedText} />
          </Grid>
        </Grid>
      </div>
    );
  }
}
const mapStateToProps = state => ({ tokens: state.tokens });

const ConnectedTranslate = connect(
  mapStateToProps,
  { setInfoText }
)(Translate);
export default ConnectedTranslate;
