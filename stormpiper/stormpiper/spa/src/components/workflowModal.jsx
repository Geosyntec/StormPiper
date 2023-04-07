import { styled } from "@mui/material/styles";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Tooltip from "@mui/material/Tooltip";

export default function WorkflowModal(props) {
  const CustomButton = styled(Button, {
    shouldForwardProp: (prop) => prop !== "selected",
  })(({ theme, selected }) => ({
    ...(selected === props.workflowTitle && {
      color: theme.palette.primary.main,
    }),
    ...(selected != props.workflowTitle && {
      color: "inherit",
    }),
  }));

  return (
    <CustomButton
      selected={props.selected}
      onClick={props.clickHandler}
      sx={{
        minWidth: 0,
        justifyContent: "flex-start",
      }}
    >
      <Tooltip title={props.workflowTitle}>
        <Box px={1}>{props.iconComponent}</Box>
      </Tooltip>
      <Box
        sx={{
          display: "block",
          px: 1,
          minWidth: "200px",
        }}
      >
        <Typography variant="body2" align="left">
          {props.workflowTitle}
        </Typography>
      </Box>
    </CustomButton>
  );
}
