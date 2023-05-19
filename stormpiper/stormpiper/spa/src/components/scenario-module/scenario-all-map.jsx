import DeckGLMap from "../map";
import { GeoJsonLayer } from "@deck.gl/layers";
import { Box } from "@mui/material";

import {
  activeLocalSWFacility as tmnt,
  delineations as tmnt_delineations,
} from "../../assets/geojson/coreLayers";
import { useState, useEffect } from "react";
import { api_fetch } from "../../utils/utils";

export default function AllScenariosMap({ scenarios, viewState }) {
  const [layers, setLayers] = useState([]);

  useEffect(async () => {
    const layers = [];
    layers.push(buildDelineationLayer(scenarios));
    layers.push(buildFacilityLayer(scenarios));
    setLayers(layers);
  }, [scenarios]);

  function appendScenarioName(feature, scenarioName) {
    feature.properties["scenarioName"] = scenarioName;
    return feature;
  }

  function buildDelineationLayer(allScenarios) {
    let allDelineations = [];
    allScenarios.map((scenario) => {
      if (scenario.input) {
        if (scenario.input["delineation_collection"]?.features?.length > 0) {
          allDelineations.push(
            appendScenarioName(
              scenario.input["delineation_collection"].features[0],
              scenario.name
            )
          );
        }
      }
    });
    return new GeoJsonLayer({
      ...tmnt_delineations.props,
      id: "scenarioDelineations",
      label: "Scenario Delineations",
      data: {
        type: "FeatureCollection",
        features: allDelineations,
      },
    });
  }
  function buildFacilityLayer(allScenarios) {
    let allFacilities = [];
    allScenarios.map((scenario) => {
      if (scenario.input) {
        if (scenario.input["tmnt_facility_collection"]?.features?.length > 0) {
          allFacilities.push(
            appendScenarioName(
              scenario.input["tmnt_facility_collection"].features[0],
              scenario.name
            )
          );
        }
      }
    });
    return new GeoJsonLayer({
      ...tmnt.props,
      id: "scenarioFacilities",
      label: "Scenario Facilities",
      data: {
        type: "FeatureCollection",
        features: allFacilities,
      },
    });
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
      {
        <DeckGLMap
          id="inset-map"
          layers={layers}
          viewState={viewState}
        ></DeckGLMap>
      }
    </Box>
  );
}
