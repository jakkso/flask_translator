import React from 'react';

import Button from '@material-ui/core/Button';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import withStyles from '@material-ui/core/styles/withStyles';

const styles = theme => ({
  main: {
    width: 'auto',
    display: 'block', // Fix IE 11 issue.
    marginLeft: theme.spacing.unit * 3,
    marginRight: theme.spacing.unit * 3,
    [theme.breakpoints.up(400 + theme.spacing.unit * 3 * 2)]: {
      width: 400,
      marginLeft: 'auto',
      marginRight: 'auto',
    },
  },
  paper: {
    marginTop: theme.spacing.unit * 8,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: `${theme.spacing.unit * 2}px ${theme.spacing.unit * 3}px ${theme.spacing.unit * 3}px`,
  },
  buttons: {
    marginTop: theme.spacing.unit * 3,
  }
});


function Unactivated(props) {
  const {sendReq, logout, classes} = props;
  return (
    <main className={classes.main}>
      <Paper className={classes.paper}>
        <Typography component="h1" variant="h5">
          Unactivated Account
        </Typography>
        <Typography component="p">
          Hey there, we noticed you haven't activated your account yet. To activate it, click on the link on the email we sent you.
        </Typography>
        <Button
          className={classes.buttons}
          fullWidth
          variant="contained"
          color="primary"
          onClick={()=>{sendReq()}}
        >
          Send another email
        </Button>
        <Typography component="p">
          Did the email get lost or expire?
        </Typography>
        <Button
          className={classes.buttons}
          fullWidth
          variant="contained"
          color="secondary"
          onClick={()=>{logout()}}
        >
          Back
        </Button>
      </Paper>
    </main>
  )
}

export default withStyles(styles)(Unactivated)