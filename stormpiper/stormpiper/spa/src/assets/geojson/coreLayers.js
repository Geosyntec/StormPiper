import { GeoJsonLayer, BitmapLayer } from "@deck.gl/layers";
import { TileLayer } from "@deck.gl/geo-layers";

import { locationIconUrl, inletIconUrl } from "../icons";
import { urlPrefix, Authorization, colorToList } from "../../utils/utils";

async function collatePaginatedQuery(url) {
  let res = {
    type: "FeatureCollection",
    features: [],
  };

  const featureCount = await fetch(
    `${url}/query?where=1%3D1&outFields=*&f=geojson&returnCountOnly=True`
  )
    .then((r) => r.json())
    .then((r) => r.count);
  const totalPages = Math.ceil(featureCount / 1000);
  let page = 1;
  let requestArr = [];

  while (page <= totalPages) {
    let offset = (page - 1) * 1000;
    requestArr.push(
      `${url}/query?where=1%3D1&outFields=*&returnGeometry=true&f=geojson&outSR=4326&resultOffset=${offset}&resultRecordCount=1000&orderByFields=ALTID`
    );
    page += 1;
  }

  Promise.all(
    requestArr.map((request) =>
      fetch(request)
        .then((r) => r.json())
        .then((r) => r.features)
    )
  ).then((resArray) => {
    resArray.map((features) => {
      res.features = [...res.features, ...features];
    });
  });

  return res;
}

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
    minZoom: 8,

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

export const swInlet = {
  layer: GeoJsonLayer,
  props: {
    data: collatePaginatedQuery(
      "https://gis.cityoftacoma.org/arcgis/rest/services/ES/SurfacewaterNetwork/MapServer/25"
    ),
    loadOptions: {
      fetch: {
        headers: {
          Authorization: Authorization,
        },
      },
    },
    id: "swInlet",
    featurePKField: "altid",
    label: "Surfacewater Inlet",
    featureType: "points",
    minZoom: 14,
    // --- icon attrs
    pointType: "icon",
    iconAtlas: inletIconUrl,
    iconMapping: {
      marker: {
        x: 0,
        y: 0,
        width: 240,
        height: 240,
        mask: true,
      },
    },
    getIcon: (d) => "marker",
    iconSizeScale: 1,
    getIconSize: (d) => 15,
    defaultFillColor: colorToList("grey"),
    getIconColor: colorToList("grey"),
    pickable: true,
    onByDefault: false,
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
    label: "Facility Upstream Delineations",
    minZoom: 8,
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
export const swMain = {
  layer: GeoJsonLayer,
  props: {
    data: collatePaginatedQuery(
      "https://gis.cityoftacoma.org/arcgis/rest/services/ES/SurfacewaterNetwork/MapServer/31"
    ),
    id: "swMain",
    featurePKField: "altid",
    label: "Surfacewater Main",
    minZoom: 8,
    getFillColor: colorToList("steelblue", 0.2),
    defaultFillColor: colorToList("steelblue", 0.2),
    getLineColor: colorToList("steelblue", 0.9),
    defaultLineColor: colorToList("steelblue", 0.9),
    getDashArray: (f) => [20, 0],
    getLineWidth: (f) => 2,
    lineWidthScale: 2,
    lineWidthMinPixels: 1,
    pickable: true,
    dashJustified: true,
    dashGapPickable: true,
    onByDefault: false,
  },
};
export const swTrunk = {
  layer: GeoJsonLayer,
  props: {
    data: collatePaginatedQuery(
      "https://gis.cityoftacoma.org/arcgis/rest/services/ES/SurfacewaterNetwork/MapServer/32"
    ),
    id: "swTrunk",
    featurePKField: "altid",
    label: "Surfacewater Trunk",
    minZoom: 8,
    getLineColor: colorToList("purple", 0.9),
    defaultLineColor: colorToList("purple", 0.9),
    getDashArray: (f) => [20, 0],
    getLineWidth: (f) => 6,
    lineWidthScale: 2,
    lineWidthMinPixels: 1,
    pickable: true,
    dashJustified: true,
    dashGapPickable: true,
    onByDefault: false,
  },
};
export const swCBLead = {
  layer: GeoJsonLayer,
  props: {
    data: collatePaginatedQuery(
      "https://gis.cityoftacoma.org/arcgis/rest/services/ES/SurfacewaterNetwork/MapServer/30"
    ),
    id: "swCBLead",
    featurePKField: "altid",
    label: "Catchbasin Leads",
    minZoom: 14,
    getFillColor: colorToList("grey", 0.2),
    defaultFillColor: colorToList("grey", 0.2),
    getLineColor: colorToList("grey", 0.9),
    defaultLineColor: colorToList("grey", 0.9),
    getDashArray: (f) => [20, 0],
    getLineWidth: (f) => 1,
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
    minZoom: 8,
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

const totalCopperRaster = {
  layer: TileLayer,
  props: {
    id: "totalCopperRaster",
    label: "Total Copper",
    data: "https://storage.googleapis.com/live_data_layers/tiles/Total_Copper/{z}/{x}/{y}",
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
const totalNitrogenRaster = {
  layer: TileLayer,
  props: {
    id: "totalNitrogenRaster",
    label: "Total Nitrogen",
    data: "https://storage.googleapis.com/live_data_layers/tiles/Total_Kjeldahl_Nitrogen/{z}/{x}/{y}",
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
const totalZincRaster = {
  layer: TileLayer,
  props: {
    id: "totalZincRaster",
    label: "Total Zinc",
    data: "https://storage.googleapis.com/live_data_layers/tiles/Total_Zinc/{z}/{x}/{y}",
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
const tssRaster = {
  layer: TileLayer,
  props: {
    id: "tssRaster",
    label: "Total Suspended Solids (TSS)",
    data: "https://storage.googleapis.com/live_data_layers/tiles/Total_Suspended_Solids/{z}/{x}/{y}",
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
    data: "https://storage.googleapis.com/live_data_layers/tiles/Land_Cover/{z}/{x}/{y}",
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
const imperviousnessRaster = {
  layer: TileLayer,
  props: {
    id: "imperviousnessRaster",
    label: "Imperviousness",
    data: "https://storage.googleapis.com/live_data_layers/tiles/Imperviousness/{z}/{x}/{y}",
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
const runoffRaster = {
  layer: TileLayer,
  props: {
    id: "runoffRaster",
    label: "Runoff",
    data: "https://storage.googleapis.com/live_data_layers/tiles/Runoff_mm/{z}/{x}/{y}",
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
const terrainRaster = {
  layer: TileLayer,
  props: {
    id: "terrainRaster",
    label: "Terrain",
    data: "https://storage.googleapis.com/live_data_layers/tiles/topo_shade_with_roofs/{z}/{x}/{y}",
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
const contourRaster = {
  layer: TileLayer,
  props: {
    id: "contourRaster",
    label: "Contours",
    data: "https://storage.googleapis.com/live_data_layers/tiles/usgs_contours/{z}/{x}/{y}",
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
  "Base Layers": {
    Landuse: [
      landCoverRaster,
      imperviousnessRaster,
      runoffRaster,
      terrainRaster,
      contourRaster,
    ],
    Pollutants: [
      totalCopperRaster,
      totalNitrogenRaster,
      totalZincRaster,
      tssRaster,
    ],
  },
  "Surface Water Infrastructure": {
    Delineations: [delineations, subbasins],
    Structures: [activeLocalSWFacility, swInlet],
    Conveyance: [swMain, swTrunk, swCBLead],
  },
};
