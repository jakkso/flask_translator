import React from 'react';

import Fade from '@material-ui/core/Fade'
import Snackbar from '@material-ui/core/Snackbar'

export default class Bubble extends React.Component {
  constructor(props) {
    super(props);
    this.handleClose = this.handleClose.bind(this);
    this.state = {
      open: true
    }
  }

  handleClose() {
    this.setState({open: false});
    setTimeout(() => {this.props.clearText()}, 500);
  }

  render() {
    return (
      <Snackbar
        open={this.state.open}
        onClose={this.handleClose}
        TransitionComponent={Fade}
        ContentProps={{'aria-describedby': 'message-id',}}
        message={<span id="message-id">{this.props.message}</span>}
      />
    )
  }
}
