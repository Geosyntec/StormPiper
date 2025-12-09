import { useState, useRef } from "react";
import DeckGLMap from "../map";
import { GeoJsonLayer } from "@deck.gl/layers";
import { Box, Button, Card, CardContent, Tooltip } from "@mui/material";
import LayersRoundedIcon from "@mui/icons-material/LayersRounded";
import {
  activeLocalSWFacility as tmnt,
  delineations as tmnt_delineations,
  layerDict as _layerDict,
} from "../../assets/geojson/coreLayers";
import LayerSelector from "../layerSelector";

export default function BMPDetailMap({
  facility,
  delineation,
  viewState,
  zoomFeature,
}) {
  let firstRender = useRef(true);
  let layerDict = { "Base Layers": _layerDict["Base Layers"] };
  const [lyrSelectDisplayState, setlyrSelectDisplayState] = useState(false); // when true, control panel is displayed
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

            res[layerID] = layerGroup[layer].props?.onByDefault || false;
          }
          return false;
        });
      } else {
        for (const layer in layerGroup) {
          const layerID = layerGroup[layer].props?.id;
          res[layerID] = layerGroup[layer].props?.onByDefault || false;
        }
      }
      return false;
    });
    return res;
  });

  function togglelyrSelectDisplayState() {
    setlyrSelectDisplayState(!lyrSelectDisplayState);
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

  const facilityLayer = new GeoJsonLayer({
    ...tmnt.props,
    data: {
      type: "FeatureCollection",
      features: [facility],
    },
    getIcon: (d) => "marker",
  });

  const delineationLayer = new GeoJsonLayer({
    ...tmnt_delineations.props,
    data: {
      type: "FeatureCollection",
      features: [delineation],
    },
  });

  return (
    <Box
      sx={{
        width: "100%",
        height: "500px",
        position: "relative",
        overflowY: "hidden",
      }}
    >
      {(viewState || zoomFeature) && (
        <>
          <DeckGLMap
            id="inset-map"
            layers={[
              ..._renderLayers(layerDict, activeLayers),
              delineationLayer,
              facilityLayer,
            ]}
            viewState={viewState}
            showTooltip={true}
          ></DeckGLMap>
          <Box
            sx={{
              position: "relative",
              display: "flex",
              flexDirection: "column",
              pointerEvents: "none",
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
                  pointerEvents: "all",
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
                  pointerEvents: "all",
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
        </>
      )}
    </Box>
  );
}
