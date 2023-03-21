import { GeoJsonLayer } from "@deck.gl/layers";

let baseURL
if(import.meta.env.MODE==='development'){
  baseURL=import.meta.env.VITE_API_FETCH_PREFIX ?? "http://localhost:8080"
  console.log("Dev mode recognized - setting baseURL to: ",baseURL)
}else{
  baseURL=''
}

const subbasins = {
  layer: GeoJsonLayer,
  props: {
    // data:"https://gis.cityoftacoma.org/arcgis/rest/services/ES/SurfacewaterNetwork/MapServer/21/query?where=1%3D1&outFields=*&returnGeometry=true&f=geojson&outSR=4326",
    data: baseURL+ "/api/rest/subbasin/?f=geojson&limit=100000&offset=0&epoch=1980s",
    loadOptions: {
      fetch: {
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_AUTH_TOKEN}`,
        }
      }
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
