import {
  Card,
  CardActions,
  CardContent,
  Typography,
  Button,
  Box,
  Tabs,
  Tab,
} from "@mui/material";
import { useState } from "react";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";

export default function ScenarioFeatureEditTab({
  editModeToggler,
  drawModeToggler,
  featureSetter,
  feature,
}) {
  const [activeTab, setActiveTab] = useState(2);
  return (
    <Box>
      <Tabs value={activeTab} indicatorColor="primary" textColor="primary">
        <Tab
          icon={<EditIcon />}
          onClick={() => {
            setActiveTab(0);
            editModeToggler();
          }}
          disabled={feature?.geometry?.coordinates ? false : true}
        />
        <Tab
          icon={<DeleteIcon />}
          onClick={() => {
            const deletedFeature = {
              type: "FeatureCollection",
              features: [],
            };
            featureSetter(deletedFeature);
            drawModeToggler();
          }}
          disabled={feature?.geometry?.coordinates ? false : true}
        />
        <Tab
          icon={<AddIcon />}
          onClick={() => {
            drawModeToggler();
            setActiveTab(2);
          }}
        />
      </Tabs>
    </Box>
  );
}
