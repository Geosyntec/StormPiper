import DeckGL from "@deck.gl/react";
import StaticMap from "react-map-gl";
import { useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import "mapbox-gl/dist/mapbox-gl.css";
import { getLayerData, zoomToFeature } from "../utils/map_utils.js";
import getTooltipContents from "./tooltip.jsx";

const MAPBOX_ACCESS_TOKEN =
  "pk.eyJ1IjoiYWNhbmctZ3MiLCJhIjoiY2w0NGl1YWwyMDE0YzNpb2hhbzN3dzcxdiJ9.3V1BdATyCSerixms7Er3Rw";

// DeckGL react component
function DeckGLMap({
  initialViewState,
  currentFeatureID,
  zoomID,
  zoomFeature,
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
  const layers = props?.layers || [];
  const loc = useLocation();
  const [viewState, setViewState] = useState(INITIAL_VIEW_STATE);
  const [zoomDataIsLoaded, setZoomDataIsLoaded] = useState(false);

  const baseLayerStyles = [
    {
      styleURL: "mapbox://styles/mapbox/streets-v12",
    },
    {
      styleURL: "mapbox://styles/mapbox/satellite-streets-v12",
    },
  ];

  function doZoomID({ layerID, featureID, featureIDField }) {
    const layer = layers.find((layer) => layer.props.id === layerID);
    layer?.state ??
      setTimeout(() => {
        layer?.state && setZoomDataIsLoaded(true);
      }, 1200);

    zoomDataIsLoaded &&
      layer?.state &&
      featureID &&
      setTimeout(() => {
        const feature = getLayerData({
          layer,
          value: featureID,
          field: featureIDField,
        });
        const view = zoomToFeature({ feature });
        setViewState({ ...view });
      }, 5);
  }

  function doZoomFeature({ feature, ...props }) {
    const view = zoomToFeature({ feature, ...props });
    setViewState({ ...view });
  }

  useEffect(() => {
    zoomID?.featureID && doZoomID(zoomID);
    zoomFeature?.feature && doZoomFeature(zoomFeature);
  }, [loc, zoomID?.featureID, zoomDataIsLoaded, zoomFeature?.feature]);

  useEffect(() => {
    props?.viewState && setViewState(props.viewState);
  }, [props?.viewState]);

  return (
    <DeckGL
      initialViewState={viewState}
      controller={{ doubleClickZoom: false }}
      layers={props.layers}
      onClick={props.onClick}
      getTooltip={(object) => {
        let width = 0;
        let height = 0;
        if (object.viewport) {
          ({ width, height } = object.viewport);
        }
        const maxx = 175,
          maxy = 175;
        if (object.y > height - maxy || object.x > width - maxx) {
          object.y -= maxy;
          object.x -= maxx;
        }
        return (
          object.object && {
            html: getTooltipContents(
              object.object,
              object?.layer?.id,
              object?.layer?.props?.label
            ),
            style: {
              position: "absolute",
              overflow: "hidden",
              borderRadius: "6px",
              maxWidth: `${maxx}px`,
              maxHeight: `${maxy}px`,
            },
          }
        );
      }}
      style={props.style}
    >
      <StaticMap
        reuseMaps
        mapboxApiAccessToken={MAPBOX_ACCESS_TOKEN}
        // mapStyle={baseLayerStyles[0].styleURL}
        mapStyle={
          baseLayerStyles[props.baseLayer]?.styleURL ||
          baseLayerStyles[0].styleURL
        }
      />
    </DeckGL>
  );
}

export default DeckGLMap;
