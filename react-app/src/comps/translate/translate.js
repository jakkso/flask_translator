import React from "react";

import Grid from "@material-ui/core/Grid";
import Paper from "@material-ui/core/Paper";
import { connect } from "react-redux";

import Button from "./submitButton";
import LanguageSelector from "./languageSelector";
import sendRequest from "../../scripts/sendRequest";
import TextInput from "./textInput";
import TextDisplay from "./textDisplay";
import { setInfoText } from "../../actions";

class Translate extends React.Component {
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
     * @param sourceLang abbreviation of a language's name.  e.g., `en` for English
     * @param targetLang abbreviation of a language's name.  e.g., `en` for English
     * @param text Text to translate
     * @return {Promise<*>}
     */
    sendTranslateRequest = async (sourceLang, targetLang, text) => {
        const accessToken = this.props.tokens.accessToken;
        const headers = { Authorization: `Bearer ${accessToken}` };
        const body = { text: text, to: targetLang, from: sourceLang };
        const resp = await sendRequest(body, "translate", headers);
        // resp.msg indicates that something went wrong, i.e., the access token is missing, invalid or expired
        if (resp.msg) {
            const refreshSuccessful = await this.props.refreshAccessToken();
            if (refreshSuccessful) {
                return this.sendTranslateRequest(sourceLang, targetLang, text);
            }
            // resp.error means there something went wrong with the request to Azure's translate API
        } else if (resp.error) {
            this.props.setInfoText(
                "Something went wrong, please try again later."
            );
        } else if (resp[0]) {
            return resp[0];
        }
    };

    /**
     * @param event
     * @return {Promise<void>}
     */
    onSubmit = async event => {
        event.preventDefault();
        const { inputText, sourceLang, targetLang } = this.state;
        const resp = await this.sendTranslateRequest(
            sourceLang,
            targetLang,
            inputText
        );
        if (!resp) return;
        const trans = resp.translations;
        const text = trans[0].text;
        this.setState({ translatedText: text, inputText: "" });
    };

    /**
     * Populate state with array of languages fetched from the azure api
     * @return {Promise<void>}
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
                            <Button
                                onClick={this.onSubmit}
                                buttonText="Translate"
                            />
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
