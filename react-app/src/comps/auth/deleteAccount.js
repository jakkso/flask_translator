import React from "react";

import Button from "@material-ui/core/Button";
import Paper from "@material-ui/core/Paper";
import Typography from "@material-ui/core/Typography";
import withStyles from "@material-ui/core/styles/withStyles";
import FormControl from "@material-ui/core/FormControl/FormControl";
import InputLabel from "@material-ui/core/InputLabel/InputLabel";
import Input from "@material-ui/core/Input/Input";
import Modal from "@material-ui/core/Modal/Modal";
import { connect } from "react-redux";

import { styles } from "../styles/styles";
import { setInfoText } from "../../actions";
import Request from "../../scripts/sendRequest";

export class DeleteAccount extends React.Component {
  state = {
    password: ""
  };

  onChange = event => {
    this.setState({ [event.target.id]: event.target.value });
  };

  onSubmit = async event => {
    if (event) event.preventDefault();
    const {
      refreshAccessToken,
      setInfoText,
      toggleDeleteAccount,
      logout
    } = this.props;
    const { password } = this.state;
    if (!password) return;
    const success = await refreshAccessToken();
    if (!success) return;
    const headers = {
      Authorization: `Bearer ${this.props.tokens.accessToken}`
    };
    const resp = await Request.sendRequest(
      { password: password },
      "user/delete",
      headers,
      "DELETE"
    );
    if (resp.error) {
      setInfoText(resp.error);
      toggleDeleteAccount();
    } else if (resp.message) {
      setInfoText(resp.message);
      if (resp.message.includes("deleted")) {
        toggleDeleteAccount();
        logout();
      }
    }
  };

  render() {
    const { password } = this.state;
    const { classes, toggleDeleteAccount } = this.props;
    return (
      <Modal
        aria-labelledby="simple-modal-title"
        aria-describedby="simple-modal-description"
        open={true}
        onClose={toggleDeleteAccount}
      >
        <main className={classes.modal}>
          <Paper className={classes.paper}>
            <Typography component="h1" variant="h5">
              Delete Account
            </Typography>
            <Typography component="p">
              This will DELETE your account FOREVER.
            </Typography>
            <form className={classes.form}>
              <FormControl margin="normal" required fullWidth>
                <InputLabel htmlFor="password">Password</InputLabel>
                <Input
                  id="password"
                  name="password"
                  value={password}
                  onChange={this.onChange}
                  type="password"
                />
              </FormControl>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                className={classes.submit}
                onClick={this.onSubmit}
              >
                Delete Account
              </Button>
              <Button
                type="button"
                fullWidth
                variant="contained"
                color="secondary"
                className={classes.submit}
                onClick={toggleDeleteAccount}
              >
                Cancel
              </Button>
            </form>
          </Paper>
        </main>
      </Modal>
    );
  }
}
const mapStateToProps = state => ({ tokens: state.tokens });

const ConnectedDeleteAccount = connect(
  mapStateToProps,
  { setInfoText }
)(withStyles(styles)(DeleteAccount));

export default ConnectedDeleteAccount;
