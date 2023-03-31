import React from "react";
import { Box, Card, CardContent } from "@mui/material";

export default function SimpleCardForm(props) {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
      }}
    >
      <Box
        sx={{
          margin: "5em",
          width: {
            sm: 400,
            md: 600,
            lg: 600,
          },
        }}
      >
        <Card sx={{ backgroundColor: (theme) => theme.palette.grey[100] }}>
          <CardContent>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
              }}
            >
              {props.children}
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}
