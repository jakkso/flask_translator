import React from 'react';

import Button from '@material-ui/core/Button';
import Modal from "@material-ui/core/Modal/Modal";
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';

export default function Unverified(props) {
  const {username, sendReq, onClose} = props;
  return (
    <Modal
    open={true}
    onClose={onClose}
    >
      <Paper>
        <Typography component="h1" variant="h5">
          Unactivated Account
        </Typography>
        <Typography component="p">
          Hey, there we noticed you haven't activated your account yet!.  Click on the link on the email you were sent.
        </Typography>
        <Typography component="p">
          Did the email get lost or expire?  Click below!
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={()=>{sendReq(username)}}
        >
          Re-send Email
        </Button>
      </Paper>
    </Modal>
  )
}
