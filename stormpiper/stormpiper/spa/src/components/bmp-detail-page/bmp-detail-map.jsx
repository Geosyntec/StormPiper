import DeckGLMap from "../map";
import { GeoJsonLayer } from "@deck.gl/layers";
import { Box } from "@mui/material";

import {
  activeLocalSWFacility as tmnt,
  delineations as tmnt_delineations,
} from "../../assets/geojson/coreLayers";
import { useState, useEffect } from "react";

export default function BMPDetailMap({
  facility,
  delineation,
  viewState,
  zoomFeature,
}) {
  const [layers, setLayers] = useState([]);

  const facilityLayer = new GeoJsonLayer({
    ...tmnt.props,
    data: {
      type: "FeatureCollection",
      features: [facility],
    },
  });

  const delineationLayer = new GeoJsonLayer({
    ...tmnt_delineations.props,
    data: {
      type: "FeatureCollection",
      features: [delineation],
    },
  });

  useEffect(() => {
    const _layers = [];
    delineation && _layers.push(delineationLayer);
    facility && _layers.push(facilityLayer);
    setLayers(_layers);
  }, [delineation, facility]);

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
        <DeckGLMap
          id="inset-map"
          layers={layers}
          viewState={viewState}
          showTooltip={true}
        ></DeckGLMap>
      )}
    </Box>
  );
}
