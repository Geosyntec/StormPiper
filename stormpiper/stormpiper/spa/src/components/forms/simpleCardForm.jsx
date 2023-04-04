import { Box, Card, CardContent } from "@mui/material";

export default function SimpleCardForm({ children, ...props }) {
  return (
    <Box
      {...props}
      sx={{
        display: "flex",
        justifyContent: "center",
      }}
    >
      <Box
        sx={{
          margin: 3,
          width: {
            sm: 400,
            md: 600,
            lg: 600,
          },
        }}
      >
        <Card>
          <CardContent>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
              }}
            >
              {children}
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}
