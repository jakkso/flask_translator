import React from "react";
import { connect } from "react-redux";

import Fade from "@material-ui/core/Fade";
import Snackbar from "@material-ui/core/Snackbar";
import { setInfoText } from "../../actions";

export class Bubble extends React.Component {
    constructor(props) {
        super(props);
        this.handleClose = this.handleClose.bind(this);
        this.state = { open: false };
    }

    handleClose() {
        this.setState({ open: false });
        setTimeout(() => {
            this.props.setInfoText("");
        }, 500);
    }

    componentDidUpdate(prevProps) {
        if (
            prevProps.infoText !== this.props.infoText &&
            this.props.infoText !== ""
        ) {
            this.setState({ open: true });
        }
    }

    render() {
        return (
            <Snackbar
                open={this.state.open}
                onClose={this.handleClose}
                TransitionComponent={Fade}
                ContentProps={{ "aria-describedby": "message-id" }}
                message={<span id="message-id">{this.props.infoText}</span>}
            />
        );
    }
}

const mapStateToProps = state => ({ infoText: state.infoText });
export default connect(
    mapStateToProps,
    { setInfoText }
)(Bubble);
