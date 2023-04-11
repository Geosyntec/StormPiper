import Card from "@mui/material/Card";
import { Box, Typography } from "@mui/material";

import { FullSpan, TwoColGrid } from "../base/two-col-grid";
import CostSettingsDataGrid from "./cost-settings";

// https://mui.com/x/react-data-grid/editing/#FullFeaturedCrudGrid.js

export default function EditSettings() {
  return (
    <Box py={3} display="flex" justifyContent="center">
      <TwoColGrid
        sx={{
          "& .actions": {
            color: "text.secondary",
          },
          "& .textPrimary": {
            color: "text.primary",
          },
        }}
      >
        <FullSpan
          sx={{
            minHeight: "400px",
          }}
        >
          <Card>
            <Box p={3}>
              <Box>
                <Typography variant="h5" fontWeight={"bold"}>
                  Cost Settings
                </Typography>
              </Box>
              <Box>
                <CostSettingsDataGrid />
              </Box>
            </Box>
          </Card>
        </FullSpan>
      </TwoColGrid>
    </Box>
  );
}
