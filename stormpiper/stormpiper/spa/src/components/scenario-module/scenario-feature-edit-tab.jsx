import {
  Card,
  CardActions,
  CardContent,
  Typography,
  Button,
  Box,
  Tabs,
  Tab,
  Tooltip,
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
      <Box
        sx={{
          background: "rgba(255, 255, 255, 1)",
          borderRadius: "4px",
          boxShadow:
            "0px 3px 1px -2px rgba(0,0,0,0.2), 0px 2px 2px 0px rgba(0,0,0,0.14), 0px 1px 5px 0px rgba(0,0,0,0.12)",
        }}
      >
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
                  <Tooltip title="Accept Edits">
                    <SaveAsIcon
                      onClick={() => {
                        drawModeToggler();
                        setActiveTab(false);
                        setDisplayEditReset(false);
                      }}
                    />
                  </Tooltip>
                  <Tooltip title="Cancel Edits">
                    <UndoIcon
                      onClick={() => {
                        featureSetter({
                          type: "FeatureCollection",
                          features: [resetFeature],
                        });
                        setDisplayEditReset(false);
                        drawModeToggler();
                        setActiveTab(false);
                      }}
                    />
                  </Tooltip>
                </Box>
              ) : (
                <Tooltip title="Edit">
                  <EditIcon />
                </Tooltip>
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
                  <Tooltip title="Confirm Delete">
                    <CheckIcon
                      onClick={() => {
                        deleteFeature();
                        setDisplayDeleteConfirm(false);
                        drawModeToggler();
                      }}
                    />
                  </Tooltip>
                  <Tooltip title="Cancel Delete">
                    <ClearIcon
                      onClick={() => {
                        setDisplayDeleteConfirm(false);
                      }}
                    />
                  </Tooltip>
                </Box>
              ) : (
                <Tooltip title="Delete">
                  <DeleteIcon
                    onClick={() => {
                      setDisplayDeleteConfirm(true);
                    }}
                  />
                </Tooltip>
              )
            }
            disabled={feature?.geometry?.coordinates ? false : true}
          />
          {showEditConfirm && [
            <Tab
              key="saveAs"
              icon={
                <Tooltip title="Save">
                  <SaveAsIcon
                    onClick={viewModeToggler}
                    disabled={feature?.geometry?.coordinates ? false : true}
                  />
                </Tooltip>
              }
            />,
            <Tab
              key="undoEdit"
              icon={
                <Tooltip title="Undo">
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
                </Tooltip>
              }
            />,
          ]}
        </Tabs>
      </Box>
    </Fragment>
  );
}
