import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';

const styles = theme => ({
  root: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  formControl: {
    margin: theme.spacing.unit,
    minWidth: 150,
  },
  selectEmpty: {
    marginTop: theme.spacing.unit * 2,
  },
});

function MaterialLangSelect(props) {
  const { classes, langs, excluded, onChange, id, selected, label } = props;
  const availableLanguages = langs.filter(lang => {
    return lang[0] !== excluded;
    })
    .map(lang => {
      const [shortName, langObj] = lang;
      return (
        <MenuItem value={shortName} key={shortName}>
          {langObj.name}
        </MenuItem>
      )
    });
  return (
    <form className={classes.root}>
      <FormControl className={classes.formControl}>
        <InputLabel htmlFor={id}>{label}</InputLabel>
        <Select
          value={selected}
          onChange={onChange}
          id={id}
          name={id}
        >
          {availableLanguages}
        </Select>
      </FormControl>
    </form>
  )
}

// MaterialLangSelect.propTypes = {
//   classes: PropTypes.object.isRequired,
// };

export default withStyles(styles)(MaterialLangSelect);