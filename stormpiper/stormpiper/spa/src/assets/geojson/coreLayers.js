import { GeoJsonLayer, BitmapLayer, PathLayer } from "@deck.gl/layers";
import { TileLayer } from "@deck.gl/geo-layers";
import { locationIconUrl, inletIconUrl } from "../icons";
import { urlPrefix, Authorization, colorToList } from "../../utils/utils";

async function collatePaginatedQuery({ url, fields }) {
  let res = {
    type: "FeatureCollection",
    features: [],
  };

  const featureCount = await fetch(
    `${url}/query?where=1%3D1&outFields=*&f=pjson&returnCountOnly=True`
  )
    .then((r) => r.json())
    .then((r) => r.count);
  const totalPages = Math.ceil(featureCount / 1000);
  let page = 1;
  let requestArr = [];
  let _url = "";
  while (page <= totalPages) {
    let offset = (page - 1) * 1000;
    _url = `${url}/query?where=1%3D1&outFields=${fields.join(
      ","
    )}&returnGeometry=true&f=geojson&outSR=4326&resultOffset=${offset}&resultRecordCount=1000`;
    requestArr.push(_url);
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

export class StrokedPathLayer extends PathLayer {
  initializeState(opts) {
    super.initializeState(opts);

    const { gl } = this.context;
    const attributeManager = this.getAttributeManager();
    attributeManager.addInstanced({
      instanceOutlineWidths: {
        size: 1,
        accessor: "getOutlineWidth",
        defaultValue: 1,
      },
      instanceOutlineColors: {
        size: 4,
        type: gl.UNSIGNED_BYTE,
        accessor: "getOutlineColor",
        normalized: true,
        defaultValue: [0, 0, 0, 255],
      },
    });
  }

  draw(opts) {
    const { attributes } = this.getAttributeManager();
    const { model } = this.state;

    model.setAttributes({
      instanceStrokeWidths: attributes.instanceOutlineWidths,
      instanceColors: attributes.instanceOutlineColors,
    });
    super.draw(opts);

    model.setAttributes({
      instanceStrokeWidths: attributes.instanceStrokeWidths,
      instanceColors: attributes.instanceColors,
    });
    super.draw(opts);
  }
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
    label: "Stormwater Facilities",
    featureType: "points",
    minZoom: 8,
    zorder: 100,

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
        mask: false,
      },
      marker_selected: {
        x: 240,
        y: 0,
        width: 240,
        height: 240,
        anchorY: 200,
        anchorX: 120,
        mask: false,
      },
      marker_found: {
        x: 480,
        y: 0,
        width: 240,
        height: 240,
        anchorY: 200,
        anchorX: 120,
        mask: false,
      },
    },
    getIcon: (d) => "marker",
    iconAlphaCutoff: 0.0,
    iconSizeScale: 1,
    getIconSize: (d) => 30,

    // --- point attrs -- keep for nebula.gl which cannot show icons apparently
    // --- icon attrs
    // pointType: "circle",
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
    data: collatePaginatedQuery({
      url: "https://gis.cityoftacoma.org/arcgis/rest/services/ES/SurfacewaterNetwork/MapServer/25",
      fields: ["ALTID"],
    }),
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
    zorder: 10,

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
    iconSizeUnits: "meters",
    iconAlphaCutoff: 0.0,
    getIconSize: (d) => 6,
    defaultFillColor: colorToList("grey"),
    getIconColor: colorToList("grey"),
    pickable: true,
    onByDefault: false,
  },
};

export const swManHole = {
  layer: GeoJsonLayer,
  props: {
    data: collatePaginatedQuery({
      url: "https://services3.arcgis.com/SCwJH1pD8WSn5T5y/arcgis/rest/services/RegionalFacilityModel/FeatureServer/0",
      fields: [
        "OBJECTID",
        "MH_DrainageArea_ALTID",
        "MH_DrainageArea_UPST_IMPVS",
      ],
    }),
    loadOptions: {
      fetch: {
        headers: {
          Authorization: Authorization,
        },
      },
    },
    id: "swManHole",
    featurePKField: "OBJECTID",
    label: "Regional Facility Model: Manholes",
    featureType: "points",
    minZoom: 14,
    zorder: 10,

    pointType: "circle",
    pointRadiusUnits: "pixels",
    defaultFillColor: colorToList("grey"),
    getFillColor: (d) => {
      const imp = d.properties["MH_DrainageArea_UPST_IMPVS"];
      if (imp >= 100) return colorToList("firebrick");
      else if (imp >= 50) return colorToList("darkorange");
      return colorToList("mediumturquoise");
    },
    getPointRadius: 6,
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
    zorder: 10,
    label: "Stormwater Facility Delineations",
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
    onByDefault: true,
    _subLayerProps: {
      "polygons-stroke": {
        type: StrokedPathLayer,
        getPath: (d) => d,
        getWidth: 1,
        getColor: colorToList("steelblue", 1),
        getOutlineWidth: 4,
        getOutlineColor: colorToList("white", 1),
      },
    },
  },
};

export const swMain = {
  layer: GeoJsonLayer,
  props: {
    data: collatePaginatedQuery({
      url: "https://gis.cityoftacoma.org/arcgis/rest/services/ES/SurfacewaterNetwork/MapServer/31",
      fields: ["ALTID", "DIAMETER"],
    }),
    id: "swMain",
    featurePKField: "altid",
    label: "Surfacewater Main",
    minZoom: 8,
    zorder: 10,
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
    data: collatePaginatedQuery({
      url: "https://gis.cityoftacoma.org/arcgis/rest/services/ES/SurfacewaterNetwork/MapServer/32",
      fields: ["ALTID", "DIAMETER"],
    }),
    id: "swTrunk",
    featurePKField: "altid",
    label: "Surfacewater Trunk",
    minZoom: 8,
    zorder: 10,
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
    data: collatePaginatedQuery({
      url: "https://gis.cityoftacoma.org/arcgis/rest/services/ES/SurfacewaterNetwork/MapServer/30",
      fields: ["ALTID"],
    }),
    id: "swCBLead",
    featurePKField: "altid",
    label: "Catchbasin Leads",
    minZoom: 14,
    zorder: 10,
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
    zorder: 5,
    defaultFillColor: colorToList("transparent", 0),
    getFillColor: colorToList("transparent", 0),
    getLineColor: colorToList("black", 1),
    getDashArray: (f) => [4, 1],
    getLineWidth: (f) => 6,
    getElevation: (f) => 500,
    getOutlineWidth: 10,
    getOutlineColor: [255, 200, 200],
    lineWidthScale: 2,
    onByDefault: true,
    pickable: true,
    _subLayerProps: {
      "polygons-stroke": {
        type: StrokedPathLayer,
        getPath: (d) => d,
        getWidth: 1,
        widthUnits: "pixels",
        getColor: colorToList("black", 1),
        getOutlineWidth: 3,
        getOutlineColor: colorToList("orange", 1),
      },
    },
  },
};

const totalCopperRaster = {
  layer: TileLayer,
  props: {
    id: "totalCopperRaster",
    label: "Total Copper",
    data: "https://storage.googleapis.com/live_data_layers/tiles/Total_Copper/{z}/{x}/{y}",
    loadOptions: { nothrow: true },
    minZoom: 10,
    maxZoom: 18,
    tileSize: 256,
    legendImg: {
      src: "copper_legend",
    },

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
    loadOptions: { nothrow: true },
    minZoom: 10,
    maxZoom: 18,
    tileSize: 256,
    legendImg: {
      src: "tkn_legend",
    },

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
    loadOptions: { nothrow: true },
    minZoom: 10,
    maxZoom: 18,
    tileSize: 256,
    legendImg: {
      src: "zinc_legend",
    },

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
    loadOptions: { nothrow: true },
    minZoom: 10,
    maxZoom: 18,
    tileSize: 256,
    legendImg: {
      src: "tss_legend",
    },

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
    loadOptions: { nothrow: true },
    minZoom: 10,
    maxZoom: 18,
    tileSize: 256,
    legendImg: {
      src: "landcover_legend",
      height: "300px",
      aspectRatio: "1/1",
    },
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
    loadOptions: { nothrow: true },
    minZoom: 10,
    maxZoom: 18,
    tileSize: 256,
    legendImg: {
      src: "imp_legend",
    },
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
    loadOptions: { nothrow: true },
    minZoom: 10,
    maxZoom: 18,
    tileSize: 256,
    legendImg: {
      src: "runoff_legend",
    },
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
    loadOptions: { nothrow: true },
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
    loadOptions: { nothrow: true },
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
  "Surface Water Infrastructure": {
    Structures: [activeLocalSWFacility],
    Delineations: [delineations, subbasins],
  },
  "Base Layers": {
    Conveyance: [swTrunk, swMain, swCBLead, swInlet, swManHole],
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
};
