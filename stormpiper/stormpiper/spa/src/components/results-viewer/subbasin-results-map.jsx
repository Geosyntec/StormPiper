import { subbasins } from "../../assets/geojson/coreLayers";
import DeckGLMap from "../map";
import { Box, TextField, MenuItem } from "@mui/material";
import { GeoJsonLayer } from "@deck.gl/layers";
import { colorToList } from "../../utils/utils";
import { useState, useEffect } from "react";
import { interpolateViridis } from "d3-scale-chromatic";
import { api_fetch } from "../../utils/utils";
import ColorRampLegend from "../colorRampLegend";
import { findIndex } from "lodash";

export default function SubbasinResultsMap({ visParam }) {
  const [subbasinData, setSubbasinData] = useState(null);
  const [visFunction, setVisFunction] = useState(null);

  function addNormalizedField(param, data) {
    if (
      Object.keys(data.features[0]?.properties).includes(`${param}-normalized`)
    ) {
      return data;
    }
    let maxValue = -Infinity;
    let dataSorted = [];
    data.features.forEach((feature) => {
      dataSorted.push(feature.properties[param]);
      if (feature.properties[param] > maxValue) {
        maxValue = feature.properties[param];
      }
    });

    dataSorted.sort((a, b) => a - b);

    let normalizedFeatures = data.features.map((feature) => {
      let index = findIndex(dataSorted, (d) => {
        return (
          parseFloat(d).toPrecision(3) ===
          parseFloat(feature.properties[param]).toPrecision(3)
        );
      });
      feature.properties[`${param}-normalized`] = index / dataSorted.length;
      return feature;
    });
    data.features = normalizedFeatures;
    return data;
  }

  useEffect(async () => {
    const response = await api_fetch("/api/rest/subbasin/?f=geojson", {
      headers: {
        Accept: "application/json",
      },
    });
    const res = await response.json();
    console.log("subbasin request: ", res);
    setSubbasinData(res);
  }, []);

  useEffect(() => {
    if (visParam) {
      setSubbasinData(addNormalizedField(visParam, subbasinData));
      let f = (d) => {
        return [10, 10, 10, 120];
      };
      setVisFunction(() => (d) => {
        let score = subbasinData.features.filter(
          (feature) => feature.properties.subbasin === d.properties.subbasin
        )[0].properties[`${visParam}-normalized`];
        return colorToList(interpolateViridis(score));
      });
    } else {
      setVisFunction(() => colorToList("forestgreen", 0.2));
    }
  }, [visParam]);

  const subbasinLayer = [
    new GeoJsonLayer({
      ...subbasins.props,
      getLineColor: [189, 189, 189, 255],
      getFillColor: visFunction,
      updateTriggers: { getFillColor: [visFunction] },
    }),
  ];

  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        position: "relative",
        overflowY: "hidden",
      }}
    >
      <Box
        sx={{
          position: "relative",
          margin: 3,
          width: "20%",
          background: "white",
          zIndex: 9999,
        }}
      ></Box>
      <DeckGLMap
        id="inset-map"
        layers={subbasinLayer}
        tooltipObj={{ id: visParam, label: visParam }}
      ></DeckGLMap>
      {visParam && (
        <ColorRampLegend
          sx={{
            position: "absolute",
            bottom: "25px",
            right: "15px",
            width: "250px",
            height: "40px",
            padding: 2,
            background: "rgba(255, 255, 255, 0.8)",
            borderRadius: 1,
          }}
          label={`${visParam} Percentile`}
        ></ColorRampLegend>
      )}
    </Box>
  );
}
