import { styled } from "@mui/material/styles";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";

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
    <CustomButton selected={props.selected} onClick={props.clickHandler}>
      {props.iconComponent}
      {props.displayTitle ? (
        <Typography variant="body2" sx={{ padding: 1 }}>
          {props.workflowTitle}
        </Typography>
      ) : (
        <></>
      )}
    </CustomButton>
  );
}
