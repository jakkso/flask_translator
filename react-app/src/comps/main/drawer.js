import React from 'react';

import { withStyles } from '@material-ui/core/styles';
import CloseIcon from '@material-ui/icons/Close';
import DeleteForever from '@material-ui/icons/DeleteForever';
import Drawer from '@material-ui/core/Drawer';
import HelpOutline from '@material-ui/icons/HelpOutline';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';

import TitleBar from "./appBar";


const styles = {
  list: {
    width: 250,
  },
};


class AppBar extends React.Component {
  state = {
    show: false,
  };

  toggleDrawer = () => {
    this.setState((prevState => {
      return {show: !prevState.show}
    }));
  };

  logout = () => {
    this.toggleDrawer();
    setTimeout(() => {this.props.logout()}, 300);
  };

  icons = {
    'About': {icon: HelpOutline, action: ()=>{console.log('About!')}},
    'Logout': {icon: CloseIcon, action: this.logout},
    'Delete Account': {icon: DeleteForever, action: ()=>{console.log('Delete Account')}},
  };

  render() {
    const { classes, loggedIn } = this.props;
    let listItems;
    if (loggedIn) listItems = ['About', 'Logout', 'Delete Account'];
    else listItems = ['About'];
    const sideList = (
      <div className={classes.list}>
        <List>
          {listItems.map((item) => {
            const Icon = this.icons[item].icon; // React renders based on whether or not the item is Capitalized
            return (
              <ListItem
                button
                key={item}
                onClick={this.icons[item].action}
              >
                <ListItemIcon><Icon /></ListItemIcon>
                <ListItemText>{item}</ListItemText>
              </ListItem>
            )
          })}
        </List>
      </div>
    );
    return (
      <div>
        <TitleBar toggleDrawer={this.toggleDrawer}/>
        <Drawer open={this.state.show} onClose={this.toggleDrawer}>
          {sideList}
        </Drawer>
      </div>
    );
  }
}

export default withStyles(styles)(AppBar);