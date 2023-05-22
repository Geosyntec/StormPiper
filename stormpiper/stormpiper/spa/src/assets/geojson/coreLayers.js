import { GeoJsonLayer, BitmapLayer } from "@deck.gl/layers";
import { TileLayer } from "@deck.gl/geo-layers";

import { locationIconUrl } from "../icons";
import { urlPrefix, Authorization, colorToList } from "../../utils/utils";

export const activeLocalSWFacility = {
  layer: GeoJsonLayer,
  props: {
    data: urlPrefix + "/api/rest/tmnt_facility/?f=geojson",
    loadOptions: {
      fetch: {
        headers: {
          Authorization: Authorization,
        },
      },
    },
    id: "activeSWFacility",
    featurePKField: "altid",
    label: "Active Surface Water Facilities",
    featureType: "points",

    // --- icon attrs
    pointType: "icon",
    iconAtlas: locationIconUrl,
    iconMapping: {
      marker: {
        x: 0,
        y: 0,
        width: 240,
        height: 240,
        anchorY: 200,
        anchorX: 120,
        mask: true,
      },
    },
    getIcon: (d) => "marker",
    iconSizeScale: 1,
    getIconSize: (d) => 30,
    defaultFillColor: colorToList("steelblue"),
    highlightColor: colorToList("orange"),
    getIconColor: colorToList("steelblue"),

    // --- point attrs -- keep for nebula.gl which cannot show icons apparently

    getFillColor: colorToList("steelblue"),
    getLineColor: [51, 51, 51, 200],
    getPointRadius: 6,
    pointRadiusMaxPixels: 20,
    pointRadiusMinPixels: 6,
    dashJustified: true,
    dashGapPickable: true,

    // --- shared attrs ---
    pickable: true,
    onByDefault: true,
  },
};

export const invisiblePoints = {
  props: {
    // --- point attrs -- keep for nebula.gl which cannot show icons apparently

    getFillColor: [0, 0, 0, 0],
    getLineColor: [0, 0, 0, 0],
    getLineWidth: 0,
    lineMinWidthPixels: 0,
    getPointRadius: 20,
    pointRadiusMinPixels: 20,
    pickable: true,
    onByDefault: true,
  },
};

export const delineations = {
  layer: GeoJsonLayer,
  props: {
    data: urlPrefix + "/api/rest/tmnt_delineation/?f=geojson",
    loadOptions: {
      fetch: {
        headers: {
          Authorization: Authorization,
        },
      },
    },
    id: "tmnt_delineations",
    featurePKField: "altid",
    label: "Active Treatment Facility Upstream Delineations",
    getFillColor: colorToList("steelblue", 0.2),
    defaultFillColor: colorToList("steelblue", 0.2),
    highlightColor: colorToList("orange", 0.4),
    getLineColor: colorToList("steelblue", 0.9),
    highlightLineColor: colorToList("orange", 0.9),
    defaultLineColor: colorToList("steelblue", 0.9),
    getDashArray: (f) => [20, 0],
    getLineWidth: (f) => 1,
    getElevation: (f) => 500,
    lineWidthScale: 2,
    lineWidthMinPixels: 1,
    pickable: true,
    dashJustified: true,
    dashGapPickable: true,
    onByDefault: false,
  },
};
export const subbasins = {
  layer: GeoJsonLayer,
  props: {
    data: urlPrefix + "/api/rest/subbasin/?f=geojson",
    loadOptions: {
      fetch: {
        headers: {
          Authorization: Authorization,
        },
      },
    },
    id: "subbasins",
    featurePKField: "subbasin",
    label: "Stormwater Subbasins",
    defaultFillColor: colorToList("forestgreen", 0.2),
    getLineColor: colorToList("forestgreen", 0.9),
    getDashArray: (f) => [20, 0],
    getLineWidth: (f) => 1,
    getElevation: (f) => 500,
    lineWidthScale: 2,
    lineWidthMinPixels: 1,
    pickable: true,
    highlightColor: [42, 213, 232],
    dashJustified: true,
    dashGapPickable: true,
    onByDefault: false,
  },
};

const activeSWMain = {
  layer: GeoJsonLayer,
  props: {
    data: "https://gis.cityoftacoma.org/arcgis/rest/services/ES/SurfacewaterNetwork/MapServer/31/query?where=1%3D1&outFields=*&returnGeometry=true&f=geojson&outSR=4326",
    id: "activeSWMain",
    label: "Active Surfacewater Main Lines",
    getPointRadius: 10,
    getFillColor: [160, 160, 180, 200],
    getLineColor: [160, 160, 180, 200],
    getDashArray: (f) => [20, 0],
    getLineWidth: (f) => {
      return parseInt(f.properties["DIAMETER"]) / 48;
    },
    getElevation: (f) => 500,
    lineWidthScale: 10,
    lineWidthMinPixels: 1,
    pickable: true,
    dashJustified: true,
    dashGapPickable: true,
  },
};

const tssRaster = {
  layer: TileLayer,
  props: {
    id: "tssRaster",
    label: "Total Suspended Solids (TSS)",
    data: "/api/rest/tileserver/tnc_tss_ug_L/{z}/{x}/{y}/{s}",
    minZoom: 10,
    maxZoom: 18,
    tileSize: 256,

    renderSubLayers: (props) => {
      const {
        bbox: { west, south, east, north },
      } = props.tile;

      return new BitmapLayer(props, {
        data: null,
        image: props.data,
        bounds: [west, south, east, north],
      });
    },
  },
};
const landCoverRaster = {
  layer: TileLayer,
  props: {
    id: "landCoverRaster",
    label: "Land Cover Category",
    data: "http://storage.googleapis.com/ogd_map_tiles/landCover/{z}/{x}/{y}.png",
    minZoom: 10,
    maxZoom: 18,
    tileSize: 256,
    renderSubLayers: (props) => {
      const {
        bbox: { west, south, east, north },
      } = props.tile;

      return new BitmapLayer(props, {
        data: null,
        image: props.data,
        bounds: [west, south, east, north],
      });
    },
  },
};
const clusteredPopRaster = {
  layer: TileLayer,
  props: {
    id: "clusteredPopRaster",
    label: "Clustered Population",
    data: "http://storage.googleapis.com/ogd_map_tiles/clustered_pop/{z}/{x}/{y}.png",
    minZoom: 10,
    maxZoom: 18,
    tileSize: 256,
    renderSubLayers: (props) => {
      const {
        bbox: { west, south, east, north },
      } = props.tile;

      return new BitmapLayer(props, {
        data: null,
        image: props.data,
        bounds: [west, south, east, north],
      });
    },
  },
};

/* eslint-disable quote-props */
export const layerDict = {
  "Base Imagery": {
    Raster: [tssRaster],
  },
  "Surface Water Infrastructure": {
    "Active Network": [delineations, subbasins, activeLocalSWFacility],
  },
};
