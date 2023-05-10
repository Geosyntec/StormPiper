import { FlyToInterpolator, WebMercatorViewport } from "@deck.gl/core";
import bbox from "@turf/bbox";

export function getLayerData({ layer, value, field, featureType }) {
  const _featureType = featureType || layer?.props?.featureType;

  if (_featureType != null) {
    let found = layer.state.layerProps[_featureType].data.find(
      (obj) => obj.__source.object.properties[field] === value
    );
    return found?.__source.object;
  }

  for (let fType of ["lines", "points", "polygons", "polygonsOutline"]) {
    let found = layer.state.layerProps[fType].data.find(
      (obj) => obj.__source.object.properties?.[field] === value
    );
    if (found != null) return found;
  }
  return undefined;
}

export function zoomToBBox({
  boundingBox,
  transitionInterpolator,
  transitionDuration,
  viewport,
}) {
  const [minLng, minLat, maxLng, maxLat] = boundingBox;
  const _viewport = { width: 200, height: 200, ...viewport };
  const viewportWebMercator = new WebMercatorViewport(_viewport);
  const { longitude, latitude, zoom } = viewportWebMercator.fitBounds(
    [
      [minLng, minLat],
      [maxLng, maxLat],
    ],
    {
      maxZoom: 16,
    }
  );

  return {
    ...viewport,
    longitude,
    latitude,
    zoom,
    transitionInterpolator: transitionInterpolator ?? new FlyToInterpolator(),
    transitionDuration: transitionDuration ?? 1000,
  };
}

export function getBBox(feature) {
  return feature?.bbox || bbox(feature);
}

export function zoomToFeature({ feature, ...args }) {
  return zoomToBBox({ boundingBox: getBBox(feature), ...args });
}
