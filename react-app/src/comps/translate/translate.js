import React from 'react'

import LanguageChooser from './langChooser';

import './translate.css'

/**
 * SFC to display the translator UI
 * @param props
 */
export function Translator(props){
  const {
    inputText,
    translatedText,
    langs,
    sourceLang,
    targetLang,
    onChange,
    onSubmit,
    logout} = props;

  const srcChooser = langs ?
    <LanguageChooser
      langs={langs}
      excluded={targetLang}
      onChange={onChange}
      name='source-lang'
      selected={sourceLang}
    /> : null;
  const targetChooser = langs ?
    <LanguageChooser
      langs={langs}
      excluded={sourceLang}
      onChange={onChange}
      name='target-lang'
      selected={targetLang}
    /> : null;

    return (
    <div>
      <button
        onSubmit={logout}
      >
        Logout
      </button>
      {srcChooser}
      {targetChooser}
      <form>
        <input
        id="inputText"
        onChange={onChange}
        onSubmit={onSubmit}
        value={inputText}
        />
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
      sourceLang: 'es',
      targetLang: 'en',
      langs: null,
    };
  }

  onChange(event) {
    const id = event.target.id;
    switch (id) {
      case 'source-lang':
        return this.setState({sourceLang: event.target.value});
      case 'target-lang':
        return this.setState({targetLang: event.target.value});
      case 'inputText':
        return this.setState({inputText: event.target.value});
      default:
        return;
    }
  }

  async onSubmit(event) {
    event.preventDefault();
    const {inputText, sourceLang, targetLang} = this.state;
    const resp = await this.sendReq(sourceLang, targetLang, inputText);
    this.setState({translatedText: resp})
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

  // render() {
  //   const {inputText, translatedText, sourceLang, targetLang, langs} = this.state;
  // }
}