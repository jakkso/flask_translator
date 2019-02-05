import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';

import {styles} from '../styles/styles'

function TitleBar(props) {
  const { classes } = props;
  return (
    <Paper className={classes.root} elevation={1}>
      <Typography variant="h5" component="h3">
      Transl8r
      </Typography>
    </Paper>
  )
}


export default withStyles(styles)(TitleBar);