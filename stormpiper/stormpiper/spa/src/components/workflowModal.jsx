import React from 'react';
import { makeStyles, styled } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import FormControl from '@material-ui/core/FormControl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import Switch from '@material-ui/core/Switch';
import Typography from '@material-ui/core/Typography'
import HomeRoundedIcon from "@material-ui/icons/HomeRounded"


const useStyles = makeStyles((theme) => ({
  form: {
    display: 'block',
    // flexDirection: 'row',
    margin: 'auto',
    width: 'fit-content',
    // alignContent:'start'
  },
  formControl: {
    marginTop: theme.spacing(2),
    minWidth: 120,
  },
  formControlLabel: {
    marginTop: theme.spacing(1),
  },
}));

export default function WorkflowModal(props) {
  const [open, setOpen] = React.useState(false);
  const classes = useStyles()

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const CustomButton = styled(Button, {
    shouldForwardProp: (prop) => prop !== "selected",
  })(({ theme, selected }) => ({
    ...(selected === props.workflowTitle && {
      color: "blue",
    }),
    ...(selected != props.workflowTitle && {
      color: "inherit",
    }),
  }));


  return (
    <React.Fragment>
      <CustomButton  selected={props.selected} onClick={props.clickHandler}>
        {props.iconComponent}
        {props.displayTitle
          ? <Typography variant = "body2">{props.workflowTitle}</Typography>
          : <p></p>}
      </CustomButton>
      {/* <Dialog
        maxWidth="lg"
        open={open}
        onClose={handleClose}
        aria-labelledby="max-width-dialog-title"
      >
        <DialogTitle id="max-width-dialog-title">{props.workflowTitle}</DialogTitle>
        <DialogContent>
          {props.workflowComponent}
          
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog> */}
    </React.Fragment>
  );
}
