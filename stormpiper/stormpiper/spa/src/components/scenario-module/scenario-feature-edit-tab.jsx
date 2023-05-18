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
import { Fragment, useState } from "react";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import ClearIcon from "@mui/icons-material/Clear";
import CheckIcon from "@mui/icons-material/Check";
import SaveAsIcon from "@mui/icons-material/SaveAs";
import UndoIcon from "@mui/icons-material/Undo";
import { useEffect } from "react";

export default function ScenarioFeatureEditTab({
  editModeToggler,
  drawModeToggler,
  viewModeToggler,
  featureSetter,
  feature,
  startMode,
  showEditConfirm,
}) {
  const [activeTab, setActiveTab] = useState(false);
  const [displayEditReset, setDisplayEditReset] = useState(false);
  const [displayDeleteConfirm, setDisplayDeleteConfirm] = useState(false);
  const [resetFeature, setResetFeature] = useState(feature);

  const defaultModeHandlers = {
    default: () => viewModeToggler(),
    editFacility: () => {
      setActiveTab(0);
    },
    drawFacility: () => drawModeToggler(),
    editDelineation: () => {
      setActiveTab(0);
    },
    drawDelineation: () => drawModeToggler(),
  };

  useEffect(() => {
    if (defaultModeHandlers[startMode]) {
      defaultModeHandlers[startMode]();
    } else {
      defaultModeHandlers.default();
    }
  }, []);

  useEffect(() => {
    console.log("feature within edit tab: ", feature);
  }, [feature]);

  function deleteFeature() {
    const deletedFeature = {
      type: "FeatureCollection",
      features: [],
    };
    featureSetter(deletedFeature);
    viewModeToggler();
    setActiveTab(false);
  }
  return (
    <Fragment>
      <Box>
        <Tabs value={activeTab} indicatorColor="primary" textColor="primary">
          <Tab
            key="edit"
            icon={
              displayEditReset ? (
                <Box
                  sx={{
                    width: 70,
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <CheckIcon
                    onClick={() => {
                      viewModeToggler();
                      setActiveTab(false);
                      setDisplayEditReset(false);
                    }}
                  />
                  <ClearIcon
                    onClick={() => {
                      featureSetter({
                        type: "FeatureCollection",
                        features: [resetFeature],
                      });
                      setDisplayEditReset(false);
                      viewModeToggler();
                      setActiveTab(false);
                    }}
                  />
                </Box>
              ) : (
                <EditIcon />
              )
            }
            onClick={() => {
              if (!displayEditReset && !showEditConfirm) {
                editModeToggler();
                setResetFeature(feature);
                setDisplayEditReset(true);
                setActiveTab(0);
              }
            }}
            disabled={feature?.geometry?.coordinates ? false : true}
          />
          <Tab
            key="delete"
            icon={
              displayDeleteConfirm ? (
                <Box
                  sx={{
                    width: 70,
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <CheckIcon
                    onClick={() => {
                      deleteFeature();
                      setDisplayDeleteConfirm(false);
                      viewModeToggler();
                    }}
                  />
                  <ClearIcon
                    onClick={() => {
                      setDisplayDeleteConfirm(false);
                    }}
                  />
                </Box>
              ) : (
                <DeleteIcon
                  onClick={() => {
                    setDisplayDeleteConfirm(true);
                  }}
                />
              )
            }
            disabled={feature?.geometry?.coordinates ? false : true}
          />
          {showEditConfirm && [
            <Tab
              key="saveAs"
              icon={
                <SaveAsIcon
                  onClick={viewModeToggler}
                  disabled={feature?.geometry?.coordinates ? false : true}
                />
              }
            />,
            <Tab
              key="undoEdit"
              icon={
                <UndoIcon
                  onClick={() => {
                    if (resetFeature) {
                      featureSetter({
                        type: "FeatureCollection",
                        features: [resetFeature],
                      });
                    } else {
                      featureSetter(null);
                    }
                    viewModeToggler();
                  }}
                  disabled={feature?.geometry?.coordinates ? false : true}
                />
              }
            />,
          ]}
        </Tabs>
      </Box>
    </Fragment>
  );
}
