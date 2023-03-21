import { Box, Typography } from "@material-ui/core";

export default function ColorRampLegend(props) {
  return (
    <Box id='color-ramp-legend' sx={props.style}>
      <Box
        style={{
          top: "20%",
          left: "5%",
          width: "90%",
          height: "20%",
          border: "1 px solid black",
          background:"linear-gradient(to right, rgb(68,1,84) 0%, rgb(33,145,140) 50%, rgb(253, 231, 84) 100%)",
          overflow: "hidden",
          position:"absolute"
        }}
      ></Box>
      <Box
        style={{
            top: "55%",
            left: "15%",
            overflow: "hidden",
            position:"absolute"
        }}>
        <Typography align="center" variant="caption">Subbasin Priority Score</Typography>
      </Box>
      <Box style={{
            top: "45%",
            left: "5%",
            overflow: "hidden",
            position:"absolute"
        }}>
        <Typography align="center" variant="caption">0</Typography>
      </Box>
      <Box style={{
            top: "45%",
            left: "85%",
            overflow: "hidden",
            position:"absolute"
        }}>
      <Typography align="center" variant="caption">100</Typography>
      </Box>


    </Box>
  );
}
