import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardActionArea,
  CardContent,
} from "@mui/material";

import CompareArrowsIcon from "@mui/icons-material/CompareArrows";
import MapIcon from "@mui/icons-material/Map";
import TuneIcon from "@mui/icons-material/Tune";

import { FullSpan } from "./base/two-col-grid";

function ActionAreaCard({ img, header, content, ...props }) {
  return (
    <Card sx={{ maxWidth: 345 }} {...props}>
      <CardActionArea>
        <Box
          sx={{
            pt: 3,
            width: "100%",
            display: "flex",
            justifyContent: "center",
          }}
        >
          {img}
        </Box>

        <CardContent sx={{ height: 250 }}>
          <Typography gutterBottom variant="h5" component="div">
            {header}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {content}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}

export default function Landing() {
  const navigate = useNavigate();

  return (
    <FullSpan>
      <Box>
        <Box
          position={"relative"}
          sx={{
            backgroundColor: (theme) => theme.palette.grey[900],
            backgroundImage: "url('./assets/img/hero-stormdrain.jpg')",

            backgroundPosition: "center",
            backgroundPositionY: "-100px",
            alignSelf: "center",
            backgroundRepeat: "no-repeat",
            backgroundSize: "cover",
            backgroundAttachment: "fixed",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Box py={15}>
            <Typography
              variant="h2"
              color="white"
              textAlign="center"
              fontWeight="bold"
            >
              Tacoma Watershed Insights
            </Typography>
            <Typography variant="h4" color="white" textAlign="center" mt={5}>
              Plan stormwater solutions for a cleaner, healthier Tacoma
            </Typography>
          </Box>

          <Box
            position={"absolute"}
            sx={{
              width: "100%",
              height: "100%",
              top: "85%",
            }}
          >
            <Grid
              container
              direction={{ xs: "column", lg: "row" }}
              rowSpacing={6}
              columnSpacing={6}
              alignItems={"center"}
              justifyContent={"center"}
            >
              <Grid item>
                <ActionAreaCard
                  onClick={() => navigate("/app/map")}
                  img={<MapIcon fontSize="large" />}
                  header={"Map Explorer"}
                  content={`
                    Evaluate BMP performance, pinpoint potential retrofit
                    sites and, identify viable approaches to treat stormwater
                    and improve Tacoma’s receiving waters.
                    `}
                />
              </Grid>
              <Grid item>
                <ActionAreaCard
                  onClick={() => navigate("/app/prioritization")}
                  img={
                    <CompareArrowsIcon
                      fontSize="large"
                      sx={{ transform: "rotate(90deg)" }}
                    />
                  }
                  header={"Cost-Effective Decision Making"}
                  content={`
                  Prioritize investments and allocate resources more effectively
                  through an understanding of life-cycle costs and project benefits.

                    `}
                />
              </Grid>
              <Grid item>
                <ActionAreaCard
                  onClick={() => navigate("/app/scenario")}
                  img={<TuneIcon fontSize="large" />}
                  header={"Incorporating Community Needs"}
                  content={`
                  Ensure decisions help improve watershed conditions for all
                  community members. Help promote equitable and sustainable
                  outcomes in stormwater project and enhance neighborhoods for everybody.

                    `}
                />
              </Grid>
            </Grid>
          </Box>
        </Box>
      </Box>
    </FullSpan>
  );
}
