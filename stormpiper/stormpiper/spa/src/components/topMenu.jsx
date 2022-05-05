import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import IconButton from "@material-ui/core/IconButton";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/core/styles";
import MenuIcon from "@material-ui/icons/Menu";
import SearchIcon from "@material-ui/icons/Search";
import MoreIcon from "@material-ui/icons/MoreVert";
import Grid from "@material-ui/core/Grid";
import WorkflowModal from "./workflowModal";
import EvaluateProjects from "./evaluateProject";
import EvaluateWatersheds from "./evaluateWatersheds";
import UserAdminMenu from "./userAdminMenu";
import Reports from "./reports";
import About from "./about";
import Help from "./help";
import logo from "../assets/img/TacomaLogoSM.jpeg";

const useStyles = makeStyles((theme) => ({
  root: {
    position: "fixed",
    zIndex: 10,
    top: 0,
    bottom: 0,
    right: 0,
    overflowX: "hidden",
    overflowY: "hidden",
    height: "15%",
    width: "100%",
    // background: "rgb(36, 21, 170)",
  },

  gridRoot: {
    zIndex: 10,
    height: "100%",
  },

  menuButton: {
    marginRight: theme.spacing(2),
  },
  gridRow: {
    height: "100%",
  },
  toolbar: {
    zIndex: 10,
    alignItems: "flex-start",
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(2),
    height: "100%",
  },
  title: {
    flexGrow: 1,
    textAlign:"left",
    alignSelf: "flex-start",
  },
  menuItem: {
    flexGrow: 1,
    alignSelf: "flex-start",
  },
}));

export default function ProminentAppBar(props) {
  const classes = useStyles();

  return (
    <div className ={classes.root}>
      <AppBar className={classes.gridRoot} position="static">
        {/* <Toolbar className={classes.toolbar}> */}
          <Grid container spacing={1} className={classes.gridRow}  alignItems = "flex-end">
            <Grid item xs={1}>
              <img alt = '' src = {logo} height = "80px" width = "auto"/>
            </Grid>

            <Grid item xs={2}>
              <WorkflowModal
                workflowTitle="Evaluate Watersheds"
                workflowComponent={<EvaluateWatersheds></EvaluateWatersheds>}
              ></WorkflowModal>
            </Grid>
            <Grid item xs={2}>
              <WorkflowModal
                workflowTitle="Evaluate Project"
                workflowComponent={<EvaluateProjects></EvaluateProjects>}
              ></WorkflowModal>
            </Grid>
            <Grid item xs={2}>
              <WorkflowModal
                workflowTitle="Reports"
                workflowComponent={<Reports></Reports>}
              ></WorkflowModal>
            </Grid>
            <Grid item xs={2}>
              <WorkflowModal
                workflowTitle="Help"
                workflowComponent={<Help></Help>}
              ></WorkflowModal>
            </Grid>
            <Grid item xs={2}>
              <WorkflowModal
                workflowTitle="About"
                workflowComponent={<About></About>}
              ></WorkflowModal>
            </Grid>
            <Grid item xs={1}>
              <UserAdminMenu></UserAdminMenu>
            </Grid>
          </Grid>
        {/* </Toolbar> */}
      </AppBar>
    </div>
  );
}
