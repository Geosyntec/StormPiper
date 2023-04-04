import { Box, Typography } from "@mui/material";

export default function ColorRampLegend(props) {
  return (
    <Box id="color-ramp-legend" {...props}>
      <Box
        sx={{
          width: "100%",
          height: "100%",
          position: "relative",
        }}
      >
        <Box
          sx={{
            borderRadius: 0.5,
            width: "100%",
            height: "40%",
            position: "absolute",
            background: "#4a7d70",
            backgroundImage:
              "linear-gradient(90deg, #440154, #482475, #414487, #355f8d, #2a788e, #21908d, #22a884, #42be71, #7ad151, #bddf26,  rgb(253, 231, 84))",
          }}
        ></Box>
        <Box sx={{ position: "absolute", top: "52%", width: "100%" }}>
          <Box
            sx={{
              position: "absolute",
              width: "100%",
              display: "flex",
              justifyContent: "center",
              textAlign: "center",
            }}
          >
            <Typography variant="caption">Subbasin Priority Score</Typography>
          </Box>
          <Box
            sx={{
              position: "absolute",
              width: "10%",
              left: "-5%",
              display: "flex",
              justifyContent: "center",
              textAlign: "center",
            }}
          >
            <Typography variant="caption">0</Typography>
          </Box>
          <Box
            sx={{
              position: "absolute",
              width: "10%",
              right: "-5%",
              display: "flex",
              justifyContent: "center",
              textAlign: "center",
            }}
          >
            <Typography variant="caption">100</Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
