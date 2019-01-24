import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';


const styles = theme => ({
  container: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  textField: {
    marginLeft: theme.spacing.unit,
    marginRight: theme.spacing.unit,
    width: 400,
  },
  dense: {
    marginTop: 19,
  },
  menu: {
    width: 200,
  },
});

function TextInput(props) {
  const { classes, inputText, onChange, onSubmit } = props;
  return (
    <TextField
      name="inputText"
      onChange={onChange}
      onSubmit={onSubmit}
      value={inputText}
      label="Text to translate"
      multiline
      rows="1"
      rowsMax="3"
      className={classes.textField}
      margin="normal"
      autoFocus={"autofocus"}
    />
  )
}

export default withStyles(styles)(TextInput);
