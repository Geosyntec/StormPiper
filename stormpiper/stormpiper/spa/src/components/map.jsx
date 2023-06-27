import DeckGL from "@deck.gl/react";
import StaticMap from "react-map-gl";
import { useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import "mapbox-gl/dist/mapbox-gl.css";
import { getLayerData, zoomToFeature } from "../utils/map_utils.js";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import { Box, Button } from "@mui/material";
import debounce from "lodash.debounce";
import { FlyToInterpolator } from "@deck.gl/core";

const MAPBOX_ACCESS_TOKEN =
  "pk.eyJ1IjoiYWNhbmctZ3MiLCJhIjoiY2w0NGl1YWwyMDE0YzNpb2hhbzN3dzcxdiJ9.3V1BdATyCSerixms7Er3Rw";

const tooltipFieldDict = {
  activeSWFacility: [
    {
      id: "altid",
      label: "Facility ID",
    },
    { id: "facilitytype", label: "Facility Type" },
    { id: "subbasin", label: "Basin ID" },
  ],
  tmnt_delineations: [
    {
      id: "altid",
      label: "ID",
    },
    { id: "relid", label: "Downstream Facility" },
  ],
  scenarioDelineations: [
    { id: "scenarioName", label: "Scenario" },
    { id: "name", label: "Delineation Name" },
  ],
  scenarioFacilities: [
    { id: "scenarioName", label: "Scenario" },
    { id: "node_id", label: "Facility Name" },
  ],
  subbasins: [{ id: "subbasin", label: "Subbasin" }],
  swCBLead: [{ id: "ALTID", label: "Lead ID" }],
  swInlet: [{ id: "ALTID", label: "Inlet ID" }],
  swManHole: [
    { id: "MH_DrainageArea_ALTID", label: "Manhole ID" },
    { id: "MH_DrainageArea_UPST_IMPVS", label: "Upstream Impervious Acres" },
  ],
  swMain: [
    { id: "ALTID", label: "Pipe ID" },
    { id: "DIAMETER", label: "Diameter" },
  ],
  swTrunk: [
    { id: "ALTID", label: "Pipe ID" },
    { id: "DIAMETER", label: "Diameter" },
  ],
  default: [{ id: "altid", label: "ID" }],
};

function getTooltipContents(object, layerLabel, fields) {
  const feat = object;
  if (feat) {
    let content = `<h4> Layer: ${layerLabel}</h4>
          ${fields.reduce((acc, field, i) => {
            let formattedValue;
            if (typeof feat.properties[field.id] === "string") {
              formattedValue = feat.properties[field.id];
            } else {
              formattedValue = parseFloat(
                feat.properties[field.id]
              ).toLocaleString(undefined, { maximumFractionDigits: 2 });
            }
            return acc + `<p>${field.label}: ${formattedValue}</p>`;
          }, "")}`;
    return content;
  }
}
// DeckGL react component
function DeckGLMap({
  initialViewState,
  currentFeatureID,
  zoomID,
  zoomFeature,
  tooltipObj,
  ...props
}) {
  // Viewport settings
  let INITIAL_VIEW_STATE = {
    longitude: -122.44,
    latitude: 47.25,
    zoom: 11,
    pitch: 0,
    bearing: 0,
  };

  if (initialViewState != null) {
    INITIAL_VIEW_STATE = { ...INITIAL_VIEW_STATE, ...initialViewState };
  }
  const loc = useLocation();
  const [viewState, setViewState] = useState(INITIAL_VIEW_STATE); //use this to actively change the map view
  const [cachedViewState, setCachedViewState] = useState(INITIAL_VIEW_STATE); //use this to track the view state for the zoom buttons to be aware of the last known view state

  const baseLayerStyles = [
    {
      styleURL: "mapbox://styles/mapbox/streets-v12",
    },
    {
      styleURL: "mapbox://styles/mapbox/satellite-streets-v12",
    },
  ];

  function doZoomID({ zoomLayerData, featureID, featureIDField }) {
    let feature = zoomLayerData.features.find(
      (obj) => obj.properties?.[featureIDField] === featureID
    );

    const view = zoomToFeature({ feature });
    setViewState({ ...view });
  }

  function doZoomFeature({ feature, ...props }) {
    const view = zoomToFeature({ feature, ...props });
    setViewState({ ...view });
  }

  function incrementZoomLevel(direction, step = 0.5) {
    const transitionConfig = {
      transitionInterpolator: new FlyToInterpolator(),
      transitionDuration: 100,
    };

    setTimeout(() => {
      if (direction === "in") {
        setViewState({
          ...cachedViewState,
          zoom: cachedViewState.zoom + step,
          ...transitionConfig,
        });
      } else {
        setViewState({
          ...cachedViewState,
          zoom: cachedViewState.zoom - step,
          ...transitionConfig,
        });
      }
    }, 25);
  }

  useEffect(() => {
    zoomID?.featureID && zoomID?.zoomLayerData && doZoomID(zoomID);
    zoomFeature?.feature && doZoomFeature(zoomFeature);
  }, [loc, zoomID?.featureID, zoomID?.zoomLayerData, zoomFeature?.feature]);

  useEffect(() => {
    props?.viewState && setViewState(props.viewState);
  }, [props?.viewState]);

  let isHovering = false;

  return (
    <>
      <DeckGL
        initialViewState={viewState}
        controller={{ doubleClickZoom: false }}
        layers={props.layers}
        onHover={({ object }) => (isHovering = Boolean(object))}
        getCursor={({ isDragging }) =>
          isDragging ? "grabbing" : isHovering ? "pointer" : "grab"
        }
        onClick={props.onClick}
        getTooltip={(object) => {
          if (!props.showTooltip) {
            return;
          }

          let tt = window.document
            .getElementById("deckgl-wrapper")
            .getElementsByClassName("deck-tooltip")[0];
          let width = 0;
          let height = 0;
          if (object.viewport) {
            ({ width, height } = object.viewport);
          }
          const maxx = tt.clientWidth,
            maxy = tt.clientHeight;
          if (object.y > height - maxy || object.x > width - maxx) {
            object.y -= maxy;
            object.x -= maxx;
          }
          let tooltipFields = tooltipFieldDict[object.layer?.id]
            ? [...tooltipFieldDict[object.layer?.id]]
            : [...tooltipFieldDict.default];
          if (tooltipObj) {
            tooltipFields.push(tooltipObj);
          }
          return (
            object.object && {
              html: getTooltipContents(
                object.object,
                object?.layer?.props?.label,
                tooltipFields
              ),
              style: {
                position: "absolute",
                overflow: "hidden",
                borderRadius: "6px",
                maxWidth: `250px`,
                maxHeight: `300px`,
                lineHeight: "1.2rem",
              },
            }
          );
        }}
        onViewStateChange={debounce((newViewState) => {
          setCachedViewState(newViewState.viewState);
        }, 100)}
        style={{ ...props.style, overflow: "hidden" }}
      >
        <StaticMap
          reuseMaps
          mapboxApiAccessToken={MAPBOX_ACCESS_TOKEN}
          mapStyle={
            baseLayerStyles[props.baseLayer]?.styleURL ||
            baseLayerStyles[0].styleURL
          }
        />
      </DeckGL>
      <Box
        sx={{
          display: "flex",
          position: "absolute",
          justifyContent: "flex-end",
          alignItems: "flex-start",
          flexDirection: "column",
          bottom: 30,
        }}
      >
        <Button
          onClick={debounce(() => {
            incrementZoomLevel("in");
          }, 100)}
          variant="contained"
          color="inherit"
          sx={{
            mx: 1,
            mt: 1,
            mb: 0.25,
            p: 0,
            minWidth: 0,
            maxWidth: "40px",
            backgroundColor: "white",
          }}
        >
          <Box
            sx={{
              p: 1,
            }}
          >
            <AddIcon />
          </Box>
        </Button>
        <Button
          onClick={() => {
            incrementZoomLevel("out");
          }}
          variant="contained"
          color="inherit"
          sx={{
            mx: 1,
            my: 0.25,
            p: 0,
            minWidth: 0,
            maxWidth: "40px",

            backgroundColor: "white",
          }}
        >
          <Box
            sx={{
              p: 1,
            }}
          >
            <RemoveIcon />
          </Box>
        </Button>
      </Box>
    </>
  );
}

export default DeckGLMap;
