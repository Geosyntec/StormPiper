import { useParams } from "react-router-dom";
import DeckGLMap from "../map";
import { api_fetch } from "../../utils/utils";
import { GeoJsonLayer, BitmapLayer } from "@deck.gl/layers";
import { Box } from "@mui/material";
import { activeLocalSWFacility as tmnt } from "../../assets/geojson/coreLayers";
import { useState } from "react";
import { useEffect } from "react";

export default function BMPDetailMap() {
  const params = useParams();
  const [facility, setFacility] = useState({
    id: "0",
    type: "Feature",
    properties: {},
    geometry: {
      type: "Point",
      coordinates: [0, 47.273916473175134],
    },
  });
  const [viewState, setViewState] = useState({
    longitude: facility.geometry.coordinates[0],
    latitude: facility.geometry.coordinates[1],
    zoom: 12,
    pitch: 0,
    bearing: 0,
  });

  const facilityLayer = new GeoJsonLayer({
    ...tmnt.props,
    data: {
      type: "FeatureCollection",
      features: [facility],
    },
  });

  useEffect(() => {
    getFacility(params.id).then((res) => {
      setFacility(res);
      setViewState({
        ...viewState,
        zoom: 13.5,
        longitude: res.geometry.coordinates[0],
        latitude: res.geometry.coordinates[1],
      });
    });
  }, [params]);

  async function getFacility(id) {
    console.log("Looking for: ", id);
    const response = await api_fetch(`/api/rest/tmnt_facility/?f=geojson`);
    const data = await response.json();
    const facility = data.features.filter((feature) => {
      return feature.properties.altid === id;
    });
    return facility[0];
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
      <DeckGLMap
        id="inset-map"
        context="inset-map"
        layers={facilityLayer}
        viewState={viewState}
      ></DeckGLMap>
    </Box>
  );
}
