import { GeoJsonLayer } from "@deck.gl/layers";
import { urlPrefix, Authorization } from "../../utils/utils";

const subbasins = {
  layer: GeoJsonLayer,
  props: {
    data:
      urlPrefix +
      "/api/rest/subbasin/?f=geojson&limit=100000&offset=0&epoch=1980s",
    loadOptions: {
      fetch: {
        headers: {
          Authorization: Authorization,
        },
      },
    },
    id: "subbasins",
    label: "Subbasins for Prioritization",
    getFillColor: [1, 1, 28, 1],
    defaultFillColor: [1, 1, 28, 1],
    getLineColor: [189, 189, 189, 255],
    getDashArray: (f) => [20, 0],
    getLineWidth: (f) => 1,
    getElevation: (f) => 500,
    lineWidthScale: 2,
    lineWidthMinPixels: 1,
    pickable: true,
    highlightColor: [42, 213, 232],
    dashJustified: true,
    dashGapPickable: true,
    onByDefault: true,
  },
};

/* eslint-disable quote-props */
export const layerDict = {
  Subbasins: {
    Subbasins: [subbasins],
  },
};
