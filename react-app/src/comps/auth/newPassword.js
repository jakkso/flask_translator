import React from "react";

import Button from "@material-ui/core/Button";
import Paper from "@material-ui/core/Paper";
import Typography from "@material-ui/core/Typography";
import withStyles from "@material-ui/core/styles/withStyles";
import FormControl from "@material-ui/core/FormControl/FormControl";
import InputLabel from "@material-ui/core/InputLabel/InputLabel";
import Input from "@material-ui/core/Input/Input";

import { styles } from "../styles/styles";

const NewPassword = props => {
    const { password, password2, onChange, onSubmit, logout, classes } = props;
    return (
        <main className={classes.main}>
            <Paper className={classes.paper}>
                <Typography component="h1" variant="h5">
                    Reset Password
                </Typography>
                <Typography component="p">Enter new passwords</Typography>
                <form className={classes.form}>
                    <FormControl margin="normal" required fullWidth>
                        <InputLabel htmlFor="password">Password</InputLabel>
                        <Input
                            id="password"
                            name="password"
                            value={password}
                            onChange={onChange}
                            type="password"
                        />
                    </FormControl>
                    <FormControl margin="normal" required fullWidth>
                        <InputLabel htmlFor="password2">
                            Repeat Password
                        </InputLabel>
                        <Input
                            id="password2"
                            name="password2"
                            value={password2}
                            onChange={onChange}
                            type="password"
                        />
                    </FormControl>
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        color="primary"
                        className={classes.submit}
                        onClick={onSubmit}
                    >
                        Reset Password
                    </Button>
                    <Button
                        type="button"
                        fullWidth
                        variant="contained"
                        color="secondary"
                        className={classes.submit}
                        onClick={logout}
                    >
                        Cancel
                    </Button>
                </form>
            </Paper>
        </main>
    );
};

export default withStyles(styles)(NewPassword);
