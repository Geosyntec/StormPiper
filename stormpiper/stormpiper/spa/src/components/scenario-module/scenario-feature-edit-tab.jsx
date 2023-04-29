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
import { useEffect } from "react";

export default function ScenarioFeatureEditTab({
  editModeToggler,
  drawModeToggler,
  viewModeToggler,
  featureSetter,
  feature,
}) {
  const [activeTab, setActiveTab] = useState(false);
  const [displayEditReset, setDisplayEditReset] = useState(false);
  const [displayDrawReset, setDisplayDrawReset] = useState(false);
  const [resetFeature, setResetFeature] = useState(feature);

  useEffect(() => {
    // setDisplayDrawReset(false); //when an addFeature event is triggered during drawMode, hide the draw reset button
    // setActiveTab(false);
    console.log("feature within edit tab: ", feature);
  }, [feature]);
  return (
    <Fragment>
      <Box>
        <Tabs value={activeTab} indicatorColor="primary" textColor="primary">
          <Tab
            icon={
              displayEditReset ? (
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <CheckIcon
                    onClick={() => {
                      drawModeToggler();
                      setActiveTab(2);
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
                      drawModeToggler();
                      setActiveTab(2);
                    }}
                  />
                </Box>
              ) : (
                <EditIcon />
              )
            }
            onClick={() => {
              if (!displayEditReset) {
                editModeToggler();
                setResetFeature(feature);
                setDisplayEditReset(true);
                setActiveTab(0);
              }
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
              setActiveTab(2);
            }}
            disabled={feature?.geometry?.coordinates ? false : true}
          />
          <Tab
            icon={
              // displayDrawReset ? (
              //   <Box>
              //     <ClearIcon
              //       onClick={() => {
              //         featureSetter({
              //           type: "FeatureCollection",
              //           features: [resetFeature],
              //         });
              //         setDisplayDrawReset(false);
              //         viewModeToggler();
              //         setActiveTab(2);
              //       }}
              //     />
              //   </Box>
              // ) : (
              <AddIcon />
              // )
            }
            onClick={() => {
              // if (!displayDrawReset) {
              drawModeToggler();
              setActiveTab(2);
              setResetFeature(
                feature || {
                  type: "FeatureCollection",
                  features: [],
                }
              );
              setDisplayDrawReset(true);
              // }
            }}
            disabled={feature ? true : false}
          />
        </Tabs>
      </Box>
    </Fragment>
  );
}
