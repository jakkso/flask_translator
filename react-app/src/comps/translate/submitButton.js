import React from 'react';

import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';


const styles = theme => ({
  button: {
    margin: theme.spacing.unit,
  },
  input: {
    display: 'none',
  },
});

function UtilityButton(props) {
  const { classes, onClick, buttonText, id } = props;
  return (
    <Button
      variant="contained"
      className={classes.button}
      onClick={onClick}
      id={id}
    >
      {buttonText}
    </Button>
  )
}

export default withStyles(styles)(UtilityButton);
