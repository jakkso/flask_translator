import React from 'react'

import LanguageChooser from './langChooser';
import MaterialLangSelect from './langChooser';

import './translate.css'

export default class Translate extends React.Component {
  constructor(props) {
    super(props);
    // sendReq and logout are method calls to parent component
    const {sendReq, logout} = props;
    this.sendReq = sendReq;
    this.logout = logout;

    this.onChange = this.onChange.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
    this.getLangs = this.getLangs.bind(this);

    this.state = {
      inputText: '',
      translatedText: '',
      sourceLang: 'en',
      targetLang: 'es',
      langs: null,
    };
  }

  /**
   * onchange handler for storing source and target languages and inputText in state
   * @param event
   */
  onChange(event) {
    this.setState({ [event.target.name]: event.target.value });
  }

  /**
   * @param event
   * @return {Promise<void>}
   */
  async onSubmit(event) {
    event.preventDefault();
    const {inputText, sourceLang, targetLang} = this.state;
    const resp = await this.sendReq(sourceLang, targetLang, inputText);
    if (!resp.success) return;
    const trans = resp.translations;
    const text = trans[0].text;
    this.setState({translatedText: text, inputText: ''})
  }

  /**
   * @return {Promise<null>}
   */
  async getLangs() {
    const langsURL = 'https://api.cognitive.microsofttranslator.com/languages?api-version=3.0';
    const res = await fetch(langsURL);
    const data = await res.json();
    const langs = Object.entries(data.translation);
    this.setState({langs});
  }

  /**
   * After comp mounts, send request to get available languages from microsoft
   */
  componentDidMount() {
    this.getLangs()
  }

  render() {
    const {inputText, translatedText, sourceLang, targetLang, langs} = this.state;
    const srcSelect = langs ? <MaterialLangSelect
      langs={langs}
      excluded={targetLang}
      onChange={this.onChange}
      id="sourceLang"
      selected={sourceLang}
      label="Source Language"
    />: null;
    const targetSelect = langs ? <MaterialLangSelect
      langs={langs}
      excluded={sourceLang}
      onChange={this.onChange}
      id="targetLang"
      selected={targetLang}
      label="Target Language"
    />: null;
    return (
      <div>
        <button
          onClick={this.logout}
        >
          Logout
        </button>
        {srcSelect}
        {targetSelect}
        <form>
          <input
            id="inputText"
            onChange={this.onChange}
            onSubmit={this.onSubmit}
            value={inputText}
          />
          <button onClick={this.onSubmit}>
            Translate
          </button>
        </form>
        <div id="translatedText">
          <span>TRANSLATED TEXT</span>
          <div>
            {translatedText}
          </div>
        </div>
      </div>
    )
  }
}