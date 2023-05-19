import { Grid, Paper } from "@mui/material";
import { styled } from "@mui/material/styles";

export function FullSpan({ children, ...props }) {
  return (
    <Grid item xs={12} {...props}>
      {children}
    </Grid>
  );
}

export function HalfSpan({ children, ...props }) {
  return (
    <FullSpan md={6} {...props}>
      {children}
    </FullSpan>
  );
}

export const DrawerAwareGrid = styled(Grid)(({ theme }) => {
  return {
    [theme.breakpoints.up("sm")]: {
      width: "600px",
    },
    [theme.breakpoints.up("md")]: {
      width: `calc(900px - 56px)`,
    },
    [theme.breakpoints.up("lg")]: {
      width: `calc(1200px - 56px)`,
    },
    [theme.breakpoints.up("xl")]: {
      width: `calc(1536px - 56px)`,
    },
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  };
});

export function TwoColGrid({ children, ...props }) {
  return (
    <DrawerAwareGrid
      container
      justifyContent="flex-start"
      alignItems="flex-start"
      sx={{
        px: { sm: 3 },
        py: 3,
      }}
    >
      <Grid container item spacing={2} {...props}>
        {/*Create items with different breakpoints */}
        {/*For example,This item will be 12 units wide on extra small screens */}
        {children}
      </Grid>
    </DrawerAwareGrid>
  );
}

function Items() {
  const classes = {
    paper: {
      padding: 20,
      textAlign: "center",
    },
  };
  return (
    <>
      <FullSpan>
        <Paper style={classes.paper}>1. xs=12</Paper>
      </FullSpan>
      {/*This item will be 12 units on extra small screens */}
      {/*But will be 6 units on small screens */}
      <HalfSpan sm={8}>
        <Paper style={classes.paper}>2. xs=12 sm=6</Paper>
      </HalfSpan>
      <FullSpan>
        <Paper style={classes.paper}>3. xs=12</Paper>
      </FullSpan>
      <HalfSpan>
        <Paper style={classes.paper}>4. xs=12 sm=6</Paper>
      </HalfSpan>
      <HalfSpan>
        <Paper style={classes.paper}>5. xs=12 sm=6</Paper>
      </HalfSpan>
      <HalfSpan>
        <Paper style={classes.paper}>6. xs=12 sm=6</Paper>
      </HalfSpan>
    </>
  );
}

export function TwoColGridDemo() {
  return (
    <TwoColGrid>
      <Items />
    </TwoColGrid>
  );
}
