import React from "react";

import { withStyles } from "@material-ui/core/styles";
import CloseIcon from "@material-ui/icons/Close";
import DeleteForever from "@material-ui/icons/DeleteForever";
import Drawer from "@material-ui/core/Drawer";
import HelpOutline from "@material-ui/icons/HelpOutline";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import { connect } from "react-redux";

import AboutModal from "./about";
import DeleteAccount from "../auth/deleteAccount";
import sendRequest from "../../scripts/sendRequest";
import TitleBar from "./titleBar";
import { setInfoText } from "../../actions";

const styles = {
    list: {
        width: 250
    }
};

class MainMenu extends React.Component {
    state = {
        showDrawer: false,
        showDelete: false,
        showAbout: false
    };

    toggleDrawer = () => {
        this.setState(prevState => {
            return { showDrawer: !prevState.showDrawer };
        });
    };

    toggleDeleteAccount = () => {
        this.setState(prevState => {
            return { showDelete: !prevState.showDelete, showDrawer: false };
        });
    };

    toggleAbout = () => {
        this.setState(prevState => {
            return { showAbout: !prevState.showAbout, showDrawer: false };
        });
    };

    /**
     * Give the drawer animation time to work, then call logout
     */
    logout = () => {
        this.setState({ showDrawer: false });
        setTimeout(() => {
            this.props.logout();
        }, 300);
    };

    deleteAccount = async password => {
        const { refreshAccessToken } = this.props;
        const success = await refreshAccessToken();
        if (!success) return;
        const headers = {
            Authorization: `Bearer ${this.props.tokens.accessToken}`
        };
        const resp = await sendRequest(
            { password: password },
            "user/delete",
            headers,
            "DELETE"
        );
        if (resp.error) {
            this.props.setInfoText(resp.error);
            this.toggleDeleteAccount();
        } else if (resp.message) {
            this.props.setInfoText(resp.message);
            if (resp.message.includes("deleted")) {
                this.toggleDeleteAccount();
                this.logout();
            }
        }
    };

    icons = {
        About: { icon: HelpOutline, action: this.toggleAbout },
        Logout: { icon: CloseIcon, action: this.logout },
        "Delete Account": {
            icon: DeleteForever,
            action: this.toggleDeleteAccount
        }
    };

    render() {
        const { showDelete, showAbout } = this.state;
        const { classes, loggedIn } = this.props;
        let listItems;
        if (loggedIn) listItems = ["About", "Logout", "Delete Account"];
        else listItems = ["About"];
        const menuItems = (
            <div className={classes.list}>
                <List>
                    {listItems.map(item => {
                        // React renders based on whether or not the item is Capitalized, so a simple lookup won't work
                        const Icon = this.icons[item].icon;
                        return (
                            <ListItem
                                button
                                key={item}
                                onClick={this.icons[item].action}
                            >
                                <ListItemIcon>
                                    <Icon />
                                </ListItemIcon>
                                <ListItemText>{item}</ListItemText>
                            </ListItem>
                        );
                    })}
                </List>
            </div>
        );
        const deletion = showDelete ? (
            <DeleteAccount
                onClick={this.deleteAccount}
                onCancel={this.toggleDeleteAccount}
            />
        ) : null;
        const about = showAbout ? (
            <AboutModal onClick={this.toggleAbout} />
        ) : null;
        return (
            <div>
                <TitleBar toggleDrawer={this.toggleDrawer} />
                <Drawer
                    open={this.state.showDrawer}
                    onClose={this.toggleDrawer}
                >
                    {menuItems}
                </Drawer>
                {deletion}
                {about}
            </div>
        );
    }
}

const mapStateToProps = state => ({ tokens: state.tokens });

const ConnectedMainMenu = connect(
    mapStateToProps,
    { setInfoText }
)(withStyles(styles)(MainMenu));
export default ConnectedMainMenu;
