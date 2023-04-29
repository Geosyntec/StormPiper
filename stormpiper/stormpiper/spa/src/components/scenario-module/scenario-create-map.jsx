import DeckGLMap from "../map";
import {
  EditableGeoJsonLayer,
  DrawPolygonMode,
  DrawPointMode,
  ViewMode,
  ModifyMode,
} from "nebula.gl";
import { Box, Card } from "@mui/material";
import {
  activeLocalSWFacility as tmnt,
  delineations,
} from "../../assets/geojson/coreLayers";
import { useState } from "react";
import ScenarioFeatureEditTab from "./scenario-feature-edit-tab";
import { useEffect } from "react";

export default function ScenarioCreateMap({
  // facilityEditMode,
  // delineationEditMode,
  mapMode,
  setMapMode,
  facility,
  facilitySetter,
  // facilityEditToggler,
  delineation,
  delineationSetter,
  // delineationEditToggler,
  // delineationDrawToggler,
  showDelinEditTabs,
  showFacilityEditTabs,
  ...props
}) {
  console.log("Rendering facility layer: ", facility);
  console.log("Rendering delineation layer: ", delineation);
  const [delineationFeatureIndexes, setDelineationFeatureIndexes] = useState(
    []
  );
  const [facilityEditMode, setFacilityEditMode] = useState(() => ViewMode);
  const [delineationEditMode, setDelineationEditMode] = useState(
    () => ViewMode
  );

  const facilityLayer = new EditableGeoJsonLayer({
    ...tmnt.props,
    id: "userPoints",
    label: "User Points",
    data: facility,
    selectedFeatureIndexes: facility?.features?.length > 0 ? [0] : [],
    mode: facilityEditMode,
    onEdit: ({ updatedData, editType }) => {
      console.log("update: ", updatedData);
      if (editType === "addFeature" && updatedData.features.length > 1) {
        facilitySetter({
          type: "FeatureCollection",
          features: [
            {
              ...updatedData.features[0],
              geometry: updatedData.features[1].geometry,
            },
          ],
        });
      } else {
        facilitySetter(updatedData);
      }
    },
  });

  const delineationLayer = new EditableGeoJsonLayer({
    ...delineations.props,
    id: "userDelineations",
    label: "User Delineations",
    data: delineation,
    selectedFeatureIndexes: delineation?.features?.length > 0 ? [0] : [],
    mode: delineationEditMode,
    pickable: true,
    onEdit: ({ updatedData, editType, editContext }) => {
      console.log("Edit Context: ", editContext);
      if (editType === "addFeature") {
        //When there are no existing features, simply update
        //When there is an existing feature, that must mean that the user entered a delineation name,
        //  so we need to merge that with the new feature's geometry
        if (delineation?.features?.length === 0) {
          delineationSetter(updatedData);
        } else {
          delineationSetter({
            type: "FeatureCollection",
            features: [
              {
                geometry: { ...updatedData.features[1].geometry },
                properties: { ...updatedData.features[0].properties },
                type: "Polygon",
              },
            ],
          });
        }
        const { featureIndexes } = editContext; //extracting indexes of current features selected
        setDelineationFeatureIndexes([...featureIndexes]);
      } else {
        delineationSetter(updatedData);
      }
    },
  });

  useEffect(() => {
    console.log("Setting mapMode:", mapMode);
    switch (mapMode) {
      case "drawFacility":
        toggleFacilityDrawMode();
        break;
      case "editFacility":
        toggleFacilityEditMode();
        break;
      case "drawDelineation":
        toggleDelineationDrawMode();
        break;
      case "editDelineation":
        toggleDelineationEditMode();
        break;
      default:
        toggleViewMode();
        break;
    }
  }, [mapMode]);

  function toggleViewMode() {
    setFacilityEditMode(() => ViewMode);
    setDelineationEditMode(() => ViewMode);
  }
  function toggleFacilityDrawMode() {
    setFacilityEditMode(() => DrawPointMode);
    setDelineationEditMode(() => ViewMode);
  }
  function toggleDelineationDrawMode() {
    setFacilityEditMode(() => ViewMode);
    setDelineationEditMode(() => DrawPolygonMode);
  }
  function toggleDelineationEditMode() {
    setFacilityEditMode(() => ViewMode);
    setDelineationEditMode(() => ModifyMode);
  }
  function toggleFacilityEditMode() {
    setFacilityEditMode(() => ModifyMode);
    setDelineationEditMode(() => ViewMode);
  }

  useEffect(() => {
    console.log("Setting mapMode:", mapMode);
    switch (mapMode) {
      case "drawFacility":
        toggleFacilityDrawMode();
        break;
      case "editFacility":
        toggleFacilityEditMode();
        break;
      case "drawDelineation":
        toggleDelineationDrawMode();
        break;
      case "editDelineation":
        toggleDelineationEditMode();
        break;
      default:
        toggleViewMode();
        break;
    }
  }, [mapMode]);

  function toggleViewMode() {
    setFacilityEditMode(() => ViewMode);
    setDelineationEditMode(() => ViewMode);
  }
  function toggleFacilityDrawMode() {
    setFacilityEditMode(() => DrawPointMode);
    setDelineationEditMode(() => ViewMode);
  }
  function toggleDelineationDrawMode() {
    setFacilityEditMode(() => ViewMode);
    setDelineationEditMode(() => DrawPolygonMode);
  }
  function toggleDelineationEditMode() {
    setFacilityEditMode(() => ViewMode);
    setDelineationEditMode(() => ModifyMode);
  }
  function toggleFacilityEditMode() {
    setFacilityEditMode(() => ModifyMode);
    setDelineationEditMode(() => ViewMode);
  }

  useEffect(() => {
    console.log("Setting mapMode:", mapMode);
    switch (mapMode) {
      case "drawFacility":
        toggleFacilityDrawMode();
        break;
      case "editFacility":
        toggleFacilityEditMode();
        break;
      case "drawDelineation":
        toggleDelineationDrawMode();
        break;
      case "editDelineation":
        toggleDelineationEditMode();
        break;
      default:
        toggleViewMode();
        break;
    }
  }, [mapMode]);

  function toggleViewMode() {
    setFacilityEditMode(() => ViewMode);
    setDelineationEditMode(() => ViewMode);
  }
  function toggleFacilityDrawMode() {
    setFacilityEditMode(() => DrawPointMode);
    setDelineationEditMode(() => ViewMode);
  }
  function toggleDelineationDrawMode() {
    setFacilityEditMode(() => ViewMode);
    setDelineationEditMode(() => DrawPolygonMode);
  }
  function toggleDelineationEditMode() {
    setFacilityEditMode(() => ViewMode);
    setDelineationEditMode(() => ModifyMode);
  }
  function toggleFacilityEditMode() {
    setFacilityEditMode(() => ModifyMode);
    setDelineationEditMode(() => ViewMode);
  }

  useEffect(() => {
    console.log("Setting mapMode:", mapMode);
    switch (mapMode) {
      case "drawFacility":
        toggleFacilityDrawMode();
        break;
      case "editFacility":
        toggleFacilityEditMode();
        break;
      case "drawDelineation":
        toggleDelineationDrawMode();
        break;
      case "editDelineation":
        toggleDelineationEditMode();
        break;
      default:
        toggleViewMode();
        break;
    }
  }, [mapMode]);

  function toggleViewMode() {
    setFacilityEditMode(() => ViewMode);
    setDelineationEditMode(() => ViewMode);
  }
  function toggleFacilityDrawMode() {
    setFacilityEditMode(() => DrawPointMode);
    setDelineationEditMode(() => ViewMode);
  }
  function toggleDelineationDrawMode() {
    setFacilityEditMode(() => ViewMode);
    setDelineationEditMode(() => DrawPolygonMode);
  }
  function toggleDelineationEditMode() {
    setFacilityEditMode(() => ViewMode);
    setDelineationEditMode(() => ModifyMode);
  }
  function toggleFacilityEditMode() {
    setFacilityEditMode(() => ModifyMode);
    setDelineationEditMode(() => ViewMode);
  }

  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        position: "relative",
        overflowY: "hidden",
      }}
    >
      {(["DrawPolygonMode2", "ModifyMode2"].includes(
        delineationEditMode.name
      ) ||
        showDelinEditTabs) && (
        <Box
          sx={{
            position: "absolute",
            zIndex: 9,
            top: "1%",
            left: "1%",
            borderRadius: "2px",
            background: "rgba(255, 255, 255, 1)",
          }}
        >
          <ScenarioFeatureEditTab
            editModeToggler={() => setMapMode("editDelineation")}
            drawModeToggler={() => setMapMode("drawDelineation")}
            viewModeToggler={() => setMapMode("default")}
            featureSetter={delineationSetter}
            feature={delineation?.features[0]}
          />
        </Box>
      )}
      {(["DrawPolygonMode2", "ModifyMode2"].includes(facilityEditMode.name) ||
        showFacilityEditTabs) && (
        <Box
          sx={{
            position: "absolute",
            zIndex: 9,
            top: "1%",
            left: "1%",
            borderRadius: "2px",
            background: "rgba(255, 255, 255, 1)",
          }}
        >
          <ScenarioFeatureEditTab
            editModeToggler={() => setMapMode("editFacility")}
            drawModeToggler={() => setMapMode("drawFacility")}
            viewModeToggler={() => setMapMode("default")}
            featureSetter={facilitySetter}
            feature={facility?.features[0]}
          />
        </Box>
      )}
      <DeckGLMap
        id="scenario-map"
        layers={[delineationLayer, facilityLayer]}
        {...props}
      ></DeckGLMap>
    </Box>
  );
}
