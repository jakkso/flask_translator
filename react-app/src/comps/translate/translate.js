import React from 'react'

import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';

import Button from './submitButton';
import LanguageSelector from './languageSelector';
import TextInput from './textInput';
import TextDisplay from './textDisplay';


export default class Translate extends React.Component {
  state = {
    inputText: '',
    translatedText: '',
    sourceLang: 'en',
    targetLang: 'es',
    langs: null,
  };

  /**
   * onchange handler for storing source and target languages and inputText in state
   * @param event
   */
  onChange = (event) => {
    this.setState({ [event.target.name]: event.target.value });
  };

  /**
   * @param event
   * @return {Promise<void>}
   */
  onSubmit = async (event) => {
    event.preventDefault();
    const {inputText, sourceLang, targetLang} = this.state;
    const resp = await this.props.sendReq(sourceLang, targetLang, inputText);
    if (!resp) return;
    const trans = resp.translations;
    const text = trans[0].text;
    this.setState({translatedText: text, inputText: ''})
  };

  /**
   * Populate state with array of languages fetched from the azure api
   * @return {Promise<void>}
   */
  async componentDidMount() {
    const langsURL = 'https://api.cognitive.microsofttranslator.com/languages?api-version=3.0';
    const res = await fetch(langsURL);
    const data = await res.json();
    this.setState({langs: Object.entries(data.translation)});
  }

  render() {
    const {inputText, translatedText, sourceLang, targetLang, langs} = this.state;
    const srcSelect = langs ?
      <LanguageSelector
        langs={langs}
        excluded={targetLang}
        onChange={this.onChange}
        id="sourceLang"
        selected={sourceLang}
        label="Source Language"
      />: null;
    const targetSelect = langs ?
      <LanguageSelector
        langs={langs}
        excluded={sourceLang}
        onChange={this.onChange}
        id="targetLang"
        selected={targetLang}
        label="Target Language"
      />: null;
    return (
      <div>
        <Grid
          container
          direction={"column"}
          justify={"space-evenly"}
          alignItems={"center"}
          spacing={8}
        >
          <Grid
            item
            container
            xs={12}
            direction={"row"}
            justify={"center"}
          >
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
                />
              </form>
              <Button onClick={this.onSubmit} buttonText="Translate"/>
            </Grid>
          </Paper>
          <Grid item xs={12}>
            <TextDisplay text={translatedText} />
          </Grid>
        </Grid>
      </div>
    )
  }
}