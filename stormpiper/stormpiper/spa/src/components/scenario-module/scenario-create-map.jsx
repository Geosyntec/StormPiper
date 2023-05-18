import DeckGLMap from "../map";
import { GeoJsonLayer } from "@deck.gl/layers";
import {
  EditableGeoJsonLayer,
  DrawPolygonMode,
  DrawPointMode,
  ViewMode,
  ModifyMode,
} from "nebula.gl";
import { Box } from "@mui/material";
import {
  activeLocalSWFacility as tmnt,
  delineations,
  invisiblePoints,
} from "../../assets/geojson/coreLayers";
import { useState, useRef, useEffect } from "react";
import ScenarioFeatureEditTab from "./scenario-feature-edit-tab";

export default function ScenarioCreateMap({
  mapMode,
  setMapMode,
  facility,
  facilitySetter,
  delineation,
  delineationSetter,
  showDelinEditTabs,
  showFacilityEditTabs,
  editorMode,
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

  const facilityLayerEdit = new EditableGeoJsonLayer({
    ...invisiblePoints.props,
    id: "userPoints",
    label: "User Points",
    data: facility || {
      type: "FeatureCollection",
      features: [],
    },
    selectedFeatureIndexes: facility?.features?.length > 0 ? [0] : [],
    mode: facilityEditMode,
    onEdit: ({ updatedData, editType }) => {
      console.log("update: ", updatedData);
      if (editType === "addFeature") {
        if (updatedData.features.length > 1) {
          facilitySetter({
            type: "FeatureCollection",
            features: [
              {
                ...updatedData.features[0],
                geometry: updatedData.features[1].geometry,
                type: "Feature",
              },
            ],
          });
        } else {
          facilitySetter(updatedData);
        }
      }
    },
  });

  const facilityLayerView = new GeoJsonLayer({
    ...tmnt.props,
    id: "userPointsView",
    label: "User Points View",
    data: facility,
  });

  const delineationLayer = new EditableGeoJsonLayer({
    ...delineations.props,
    id: "userDelineations",
    label: "User Delineations",
    data: delineation || {
      type: "FeatureCollection",
      features: [],
    },
    selectedFeatureIndexes: delineation?.features?.length > 0 ? [0] : [],
    mode: delineationEditMode,
    pickable: true,
    onEdit: ({ updatedData, editType, editContext }) => {
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
                type: "Feature",
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

  const isEventListenerAdded = useRef(false);

  useEffect(() => {
    console.log("Setting mapMode:", mapMode);
    mapModeHandlers[mapMode]();
  }, [mapMode]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      console.log("Key pressed: ", e);
      console.log("Map Mode: ", mapMode);
      if (e.key === "Escape" && mapMode !== "default") {
        console.log("Trying to escape!");
        escPressHandlers[mapMode]();
      }
    };

    if (!isEventListenerAdded.current) {
      window.addEventListener("keydown", handleKeyDown);
      isEventListenerAdded.current = true;
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      isEventListenerAdded.current = false;
    };
  }, [mapMode]);

  const mapModeHandlers = {
    toggleViewMode: () => {
      setFacilityEditMode(() => ViewMode);
      setDelineationEditMode(() => ViewMode);
    },
    drawFacility: () => {
      mapModeHandlers.toggleViewMode();
      setFacilityEditMode(() => DrawPointMode);
    },
    drawDelineation: () => {
      mapModeHandlers.toggleViewMode();
      setDelineationEditMode(() => DrawPolygonMode);
    },
    editFacility: () => {
      mapModeHandlers.toggleViewMode();
      setFacilityEditMode(() => ModifyMode);
    },
    editDelineation: () => {
      mapModeHandlers.toggleViewMode();
      setDelineationEditMode(() => ModifyMode);
    },
    default: () => {
      mapModeHandlers.toggleViewMode();
    },
  };

  const escPressHandlers = {
    drawFacility: () => {
      mapModeHandlers.toggleViewMode();
      setTimeout(mapModeHandlers.drawFacility, 100);
    },
    drawDelineation: () => {
      mapModeHandlers.toggleViewMode();
      setTimeout(mapModeHandlers.drawDelineation, 100);
    },
    editFacility: () => {
      mapModeHandlers.toggleViewMode();
      setTimeout(mapModeHandlers.editFacility, 100);
    },
    editDelineation: () => {
      mapModeHandlers.toggleViewMode();
      setTimeout(mapModeHandlers.editDelineation, 100);
    },
  };

  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        position: "relative",
        overflowY: "hidden",
      }}
    >
      {["DrawPolygonMode2", "ModifyMode2"].includes(
        delineationEditMode.name
      ) && (
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
            startMode={mapMode}
            showEditConfirm={editorMode}
          />
        </Box>
      )}
      {["DrawPointMode2", "ModifyMode2"].includes(facilityEditMode.name) && (
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
            startMode={mapMode}
            showEditConfirm={editorMode}
          />
        </Box>
      )}
      <DeckGLMap
        id="scenario-map"
        layers={[delineationLayer, facilityLayerView, facilityLayerEdit]}
        {...props}
      ></DeckGLMap>
    </Box>
  );
}
