import json
import logging
from functools import lru_cache

import ee

from stormpiper.core.config import settings, stormpiper_path

from stormpiper.core.config import stormpiper_path, settings

logging.basicConfig(level=settings.LOGLEVEL)
logger = logging.getLogger(__name__)


def _init_url(layer_spec):
    return __init_url(layer_spec_json=json.dumps(layer_spec, sort_keys=True))


@lru_cache
def __init_url(layer_spec_json):
    layer_spec = json.loads(layer_spec_json)
    eeObject = layer_spec.get("layer", {}).get("eeObject")
    visParams = layer_spec.get("layer", {}).get("visParams")

    if not eeObject and visParams:  # pragma: no cover
        return layer_spec

    image = ee.Image(eeObject).selfMask()

    map_id_dict = image.getMapId(visParams)
    url = map_id_dict["tile_fetcher"].url_format
    layer_spec["layer"]["url"] = url
    layer_spec["layer"]["image"] = image

    return layer_spec


@lru_cache
def _init_layers():

    layer_json = stormpiper_path / "data" / "ee" / "layers.json"

    raw_layers = json.loads(layer_json.read_text())
    raw_layers.update(
        {
            "tnc_runoff_mm": {
                "sourceName": "City of Tacoma",
                # "units": "°C",
                # "description": "Evening temperature measurements",
                "safe_name": "tnc_runoff_mm",
                "layer": {
                    "eeObject": "projects/ee-tacoma-watershed/assets/raster/tnc_runoff_mm",
                    "visParams": {
                        "min": 0,
                        "max": 600,
                        "palette": [
                            "#4575b4",
                            "#91bfdb",
                            "#e0f3f8",
                            "#ffffbf",
                            "#fee090",
                            "#fc8d59",
                            "#d73027",
                        ],
                        "opacity": 0.8,
                        "name": "tnc_runoff_mm",
                    },
                },
            },
            "TNC_80s_runoff_mm": {
                "sourceName": "City of Tacoma",
                # "units": "°C",
                # "description": "Evening temperature measurements",
                "safe_name": "TNC_80s_runoff_mm",
                "layer": {
                    "eeObject": "projects/ee-stormwaterheatmap/assets/production/Mean_Annual_Q_4_epochs",
                    "visParams": {
                        "bands": "runoff_1980s",
                        "min": 0,
                        "max": 600,
                        "palette": [
                            "#4575b4",
                            "#91bfdb",
                            "#e0f3f8",
                            "#ffffbf",
                            "#fee090",
                            "#fc8d59",
                            "#d73027",
                        ],
                        "opacity": 0.8,
                        "name": "TNC_80s_runoff_mm",
                    },
                },
            },
            "tnc_tss_ug_L": {
                "sourceName": "City of Tacoma",
                # "units": "°C",
                # "description": "Evening temperature measurements",
                "safe_name": "tnc_tss_ug_L",
                "layer": {
                    "eeObject": "projects/ee-tacoma-watershed/assets/raster/tnc_tss_ug_L",
                    "visParams": {
                        "min": 0,
                        "max": 1e5,
                        "palette": [
                            "#4575b4",
                            "#91bfdb",
                            "#e0f3f8",
                            "#ffffbf",
                            "#fee090",
                            "#fc8d59",
                            "#d73027",
                        ],
                        "opacity": 0.8,
                        "name": "tnc_tss_ug_L",
                    },
                },
            },
        }
    )
    layer_dict = {}

    for name, layer_spec in raw_layers.items():
        try:
            layer_dict[name] = _init_url(layer_spec)
        except Exception as e:  # pragma: no cover
            logger.exception(f"ERROR loading layer {name}")
            continue

    TSS = layer_dict["tnc_tss_ug_L"]["layer"]["image"]
    Q = layer_dict["tnc_runoff_mm"]["layer"]["image"]
    load = (
        TSS.divide(1000)  # convert => mg/l
        .multiply(Q)  # convert => mg/sqm
        .rename("TSS_mg_sqm")
        .selfMask()
    )

    url = load.getMapId(
        {
            "min": 0,
            "max": 1e5,
            "palette": [
                "#4575b4",
                "#91bfdb",
                "#e0f3f8",
                "#ffffbf",
                "#fee090",
                "#fc8d59",
                "#d73027",
            ],
            "opacity": 0.8,
            "name": "TSS_mg_sqm",
        },
    )["tile_fetcher"].url_format
    layer_dict["TSS_mg_sqm"] = {
        "safe_name": "TSS_mg_sqm",
        "layer": {"url": url, "image": load},
    }

    return layer_dict


@lru_cache
def _init_tile_registry():

    tile_registry = {}

    tile_registry[
        "esri"
    ] = "https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}"
    tile_registry[
        "carto-db"
    ] = "https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png"

    layers = _init_layers()

    for spec in layers.values():

        name = spec.get("safe_name")
        url = spec.get("layer", {}).get("url")
        if name and url:  # pragma: no branch
            tile_registry[name] = url

    return tile_registry


def get_layers():
    return _init_layers()


def get_tile_registry():
    return _init_tile_registry()
