import DeckGLMap from "../map";
import { GeoJsonLayer } from "@deck.gl/layers";
import {
  EditableGeoJsonLayer,
  DrawPolygonMode,
  DrawPointMode,
  ViewMode,
  ModifyMode,
} from "nebula.gl";
import { Box, Card, CardContent, Button, Tooltip } from "@mui/material";
import {
  activeLocalSWFacility as tmnt,
  delineations,
  invisiblePoints,
} from "../../assets/geojson/coreLayers";
import LayersRoundedIcon from "@mui/icons-material/LayersRounded";
import { useState, useRef, useEffect } from "react";
import LayerSelector from "../layerSelector";
import { layerDict, StrokedPathLayer } from "../../assets/geojson/coreLayers";
import { colorToList } from "../../utils/utils";
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
  let firstRender = useRef(true);
  const [lyrSelectDisplayState, setlyrSelectDisplayState] = useState(false); // when true, control panel is displayed

  const [delineationFeatureIndexes, setDelineationFeatureIndexes] = useState(
    []
  );
  const [facilityEditMode, setFacilityEditMode] = useState(() => ViewMode);
  const [delineationEditMode, setDelineationEditMode] = useState(
    () => ViewMode
  );

  function togglelyrSelectDisplayState() {
    setlyrSelectDisplayState(!lyrSelectDisplayState);
  }

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
      } else {
        facilitySetter(updatedData);
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
    getFillColor: colorToList("steelblue", 0.2),
    _subLayerProps: {
      geojson: {
        _subLayerProps: {
          "polygons-stroke": {
            type: StrokedPathLayer,
            getPath: (d) => d,
            getWidth: 1,
            getColor: colorToList("steelblue", 1),
            getOutlineWidth: 4,
            getOutlineColor: colorToList("white", 1),
          },
        },
      },
    },
  });

  const isEventListenerAdded = useRef(false);

  const [activeLayers, setActiveLayers] = useState(() => {
    var res = {};
    Object.keys(layerDict).map((category) => {
      const layerGroup = layerDict[category];
      if (!layerGroup.length) {
        const nestedLayerGroup = layerDict[category];
        Object.keys(nestedLayerGroup).map((nestedCategory) => {
          const layerGroup = nestedLayerGroup[nestedCategory];
          for (const layer in layerGroup) {
            const layerID = layerGroup[layer].props?.id;

            res[layerID] = false; //keep everything off by default
          }
          return false;
        });
      } else {
        for (const layer in layerGroup) {
          const layerID = layerGroup[layer].props?.id;
          res[layerID] = false; //keep everything off by default
        }
      }
      return false;
    });
    return res;
  });

  useEffect(() => {
    mapModeHandlers[mapMode]();
  }, [mapMode]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && mapMode !== "default") {
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
      setMapMode("default");
    },
    drawFacility: () => {
      mapModeHandlers.toggleViewMode();
      setFacilityEditMode(() => DrawPointMode);
      setMapMode("drawFacility");
    },
    drawDelineation: () => {
      mapModeHandlers.toggleViewMode();
      setDelineationEditMode(() => DrawPolygonMode);
      setMapMode("drawDelineation");
    },
    editFacility: () => {
      mapModeHandlers.toggleViewMode();
      setFacilityEditMode(() => ModifyMode);
      setMapMode("editFacility");
    },
    editDelineation: () => {
      mapModeHandlers.toggleViewMode();
      setDelineationEditMode(() => ModifyMode);
      setMapMode("editDelineation");
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

  function _renderLayers(layerDict, visState, layersToRender = []) {
    Object.keys(layerDict).map((category) => {
      const layerGroup = layerDict[category];
      if (layerGroup.length) {
        Object.keys(layerGroup).map((id) => {
          let { layer: Layer, props, getData } = layerGroup[id];
          if (getData && !props.data) {
            props.data = getData();
          }
          if (visState[props.id]) {
            // props = _injectLayerAccessors(props, focusFeatureID);
            layersToRender.push(new Layer(props));
          }
          return false;
        });
      } else {
        layersToRender = _renderLayers(layerGroup, visState, layersToRender);
      }
      return false;
    });
    firstRender.current = false;
    layersToRender.sort(
      (a, b) => (a.props?.zorder || 0) - (b.props?.zorder || 0)
    );
    return layersToRender;
  }

  function _toggleLayer(layerName, updateFunction = setActiveLayers) {
    var currentActiveLayers = { ...activeLayers };

    //Ensure that only one raster layer is displayed at time to avoid z-index issues
    if (layerName.toLowerCase().match("raster")) {
      Object.keys(currentActiveLayers).map((k) => {
        if (k.toLowerCase().match("raster") && k != layerName) {
          currentActiveLayers[k] = false;
        }
      });
    }
    currentActiveLayers[layerName] = !currentActiveLayers[layerName];
    updateFunction(currentActiveLayers);
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
      {["editDelineation", "drawDelineation"].includes(mapMode) && (
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
      {["drawFacility", "editFacility"].includes(mapMode) && (
        <Box
          sx={{
            position: "absolute",
            zIndex: 9,
            m: 1,
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
        layers={[
          ..._renderLayers(layerDict, activeLayers),
          delineationLayer,
          facilityLayerEdit,
          facilityLayerView,
        ]}
        showTooltip={false}
        {...props}
      ></DeckGLMap>
      <Box
        sx={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Box
          sx={{
            display: "flex",
            position: "relative",
            justifyContent: "flex-end",
          }}
        >
          <Button
            onClick={togglelyrSelectDisplayState}
            selected={lyrSelectDisplayState}
            variant="contained"
            color={lyrSelectDisplayState ? "primary" : "inherit"}
            sx={{
              m: 1,
              p: 0,
              minWidth: 0,
              backgroundColor: lyrSelectDisplayState ? "primary" : "white",
            }}
          >
            <Tooltip title="Show/Hide Layers">
              <Box
                sx={{
                  p: 1,
                  color: lyrSelectDisplayState ? "white" : "dimgrey",
                }}
              >
                <LayersRoundedIcon />
              </Box>
            </Tooltip>
          </Button>
        </Box>

        {lyrSelectDisplayState && (
          <Box
            sx={{
              display: "flex",
              position: "relative",
              justifyContent: "flex-end",
              height: "400px",
              width: "100%",
              p: 2,
            }}
          >
            <Card
              sx={{
                zIndex: 9,
                overflowY: "scroll",
              }}
            >
              <CardContent sx={{ p: 2 }}>
                <LayerSelector
                  layerDict={layerDict}
                  activeLayers={activeLayers}
                  _onToggleLayer={_toggleLayer}
                  displayStatus={lyrSelectDisplayState}
                  displayController={togglelyrSelectDisplayState}
                ></LayerSelector>
              </CardContent>
            </Card>
          </Box>
        )}
      </Box>
    </Box>
  );
}
