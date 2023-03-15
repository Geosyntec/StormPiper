import { GeoJsonLayer } from "@deck.gl/layers";

const subbasins = {
  layer: GeoJsonLayer,
  props: {
    // data:"https://gis.cityoftacoma.org/arcgis/rest/services/ES/SurfacewaterNetwork/MapServer/21/query?where=1%3D1&outFields=*&returnGeometry=true&f=geojson&outSR=4326",
    data: "/api/rest/subbasin/?f=geojson&limit=100000&offset=0&epoch=1980s",
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
    // onClick:(info,event)=>console.log(info,event),
    highlightColor: [42, 213, 232],
    dashJustified: true,
    dashGapPickable: true,
    onByDefault: true,
  },
};

/* eslint-disable quote-props */
export const layerDict = {
  "Subbasins": {
    Subbasins: [
      subbasins,
      // landCoverRaster,
      // clusteredPopRaster
    ],
  }
};
