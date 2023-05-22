import DeckGLMap from "../map";
import { GeoJsonLayer } from "@deck.gl/layers";
import { Box } from "@mui/material";

import {
  activeLocalSWFacility as tmnt,
  delineations as tmnt_delineations,
} from "../../assets/geojson/coreLayers";
import { useState, useEffect } from "react";
import { api_fetch } from "../../utils/utils";

export default function AllScenariosMap({
  scenarios,
  viewState,
  focusScenario,
}) {
  const [layers, setLayers] = useState([]);

  useEffect(async () => {
    const layers = [];
    layers.push(buildDelineationLayer(scenarios));
    layers.push(buildFacilityLayer(scenarios));
    setLayers(layers);
  }, [scenarios, focusScenario]);

  function appendScenarioName(feature, scenarioName, scenarioID) {
    feature.properties["scenarioName"] = scenarioName;
    feature.properties["scenarioID"] = scenarioID;
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
              scenario.name,
              scenario.id
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
      getFillColor: (d) => {
        return d.properties.scenarioID &&
          focusScenario === d.properties.scenarioID
          ? tmnt_delineations.props.highlightColor || [52, 222, 235]
          : tmnt_delineations.props.defaultFillColor || [70, 170, 21, 200];
      },
      getLineColor: (d) => {
        return d.properties.scenarioID &&
          focusScenario === d.properties.scenarioID
          ? tmnt_delineations.props.highlightLineColor || [52, 222, 235]
          : tmnt_delineations.props.defaultLineColor || [70, 170, 21, 200];
      },
      updateTriggers: {
        getFillColor: [focusScenario],
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
              scenario.name,
              scenario.id
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
      getIconColor: (d) => {
        return d.properties.scenarioID &&
          focusScenario === d.properties.scenarioID
          ? tmnt.props.highlightColor || [52, 222, 235]
          : tmnt.props.defaultFillColor || [70, 170, 21, 200];
      },
      updateTriggers: {
        getIconColor: [focusScenario],
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
