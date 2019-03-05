import React from "react";

import withStyles from "@material-ui/core/styles/withStyles";

import { styles } from "../styles/styles";
import Modal from "@material-ui/core/Modal/Modal";
import Typography from "@material-ui/core/Typography/Typography";
import Button from "@material-ui/core/Button/Button";

export const AboutModal = props => {
  const { classes, onClick } = props;
  return (
    <Modal
      aria-labelledby="simple-modal-title"
      aria-describedby="simple-modal-description"
      open={true}
      onClose={onClick}
    >
      <div className={classes.modal}>
        <Typography variant="h6" id="modal-title">
          About
        </Typography>
        <Typography variant="body1">
          This is a basic CRUD app that I wrote in order to put a front end on a
          RESTful API. It's been a fun, rewarding experience that's taught me
          quite a bit about how to use React, as well as the material-ui
          library. Shoutout to Stackoverflow and the material-ui docs (Which are
          pretty great, by the way).
        </Typography>
        <Button
          variant="contained"
          color="primary"
          className={classes.submit}
          onSubmit={onClick}
          onClick={onClick}
        >
          Close
        </Button>
      </div>
    </Modal>
  );
};

export default withStyles(styles)(AboutModal);
