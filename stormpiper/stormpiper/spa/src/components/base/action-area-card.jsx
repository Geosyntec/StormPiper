import {
  Box,
  Typography,
  Card,
  CardActionArea,
  CardContent,
} from "@mui/material";

export default function ActionAreaCard({
  img,
  header,
  content,
  color,
  ...props
}) {
  const backgroundColor = (theme) => {
    if (color) {
      return color;
    } else {
      return theme.palette.background.default;
    }
  };
  return (
    <Card
      sx={{
        display: "flex",
        alignItems: "stretch",
        justifyContent: "center",
        height: { xs: "100%", md: 250 },
        maxWidth: { xs: "100%", md: 400 },
        background: backgroundColor,
      }}
      {...props}
    >
      <CardActionArea>
        <CardContent>
          <Box
            sx={{
              display: { xs: "flex", md: "block" },
              alignItems: { md: "center" },
              verticalAlign: "center",
            }}
          >
            <Box
              sx={{
                py: { xs: 0, md: 3 },
                pr: { xs: 2, md: 0 },
                display: { xs: "inline-block", md: "flex" },
                justifyContent: { xs: "left", md: "center" },
              }}
            >
              {img}
            </Box>
            <Box>
              <Typography
                gutterBottom
                variant="h5"
                component="div"
                color="primary"
              >
                {header}
              </Typography>
            </Box>
          </Box>

          <Typography variant="body2" color="text.secondary">
            {content}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
