import React from 'react';

import Button from '@material-ui/core/Button';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import withStyles from '@material-ui/core/styles/withStyles';
import FormControl from "@material-ui/core/FormControl/FormControl";
import InputLabel from "@material-ui/core/InputLabel/InputLabel";
import Input from "@material-ui/core/Input/Input";

import {styles} from '../styles/styles'
import Modal from "@material-ui/core/Modal/Modal";


class DeleteAccount extends  React.Component {
  state = {
    password: '',
  };

  onChange = (event) => {
    this.setState({ [event.target.id]: event.target.value })
  };

  onSubmit = (event) => {
    event.preventDefault();
    const {password} = this.state;
    if (!password) return;
    this.props.onClick(password);
  };

  render() {
    const {password} = this.state;
    const {classes} = this.props;
    return (
      <Modal
        aria-labelledby="simple-modal-title"
        aria-describedby="simple-modal-description"
        open={true}
        onClose={this.props.onCancel}
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
              <FormControl
                margin="normal"
                required
                fullWidth
              >
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
                onClick={this.props.onCancel}
              >
                Cancel
            </Button>
          </form>
          </Paper>
        </main>
      </Modal>
    )
  }
}

export default withStyles(styles)(DeleteAccount);
