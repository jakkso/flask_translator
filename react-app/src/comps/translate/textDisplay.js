import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';

const styles = theme => ({
  root: {
    ...theme.mixins.gutters(),
    paddingTop: theme.spacing.unit * 2,
    paddingBottom: theme.spacing.unit * 2,
    width: 500,
    height: 100,
  },
  paper: {
    margin: `${theme.spacing.unit}px auto`,
    padding: theme.spacing.unit * 2,
  }
});

function TextDisplay(props) {
  const { classes, text } = props;
  return (
    <Paper className={classes.root} elevation={1}>
      <Typography variant="subtitle2">
        {`Translation`}
      </Typography>
      <Typography variant="body1">
        {text}
      </Typography>
    </Paper>
  );
}

export default withStyles(styles)(TextDisplay);
