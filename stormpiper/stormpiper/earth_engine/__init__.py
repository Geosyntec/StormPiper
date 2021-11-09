import json
from typing import Any, Dict

import ee

from stormpiper.core.config import settings, stormpiper_path

EE_AUTHENTICATED = False
EE_LAYERS: Dict[str, Any] = {}


def login():

    global EE_AUTHENTICATED

    if EE_AUTHENTICATED:
        return

    try:
        private_key_path = str(stormpiper_path / ".private_keys" / "tncKey.json")
        credentials = ee.ServiceAccountCredentials(
            settings.EE_SERVICE_ACCOUNT, private_key_path
        )
        ee.Initialize(credentials)
        EE_AUTHENTICATED = True

    except Exception:  # pragma: no cover
        EE_AUTHENTICATED = False
        raise


def init_url(layer_spec):
    eeObject = layer_spec.get("layer", {}).get("eeObject")
    visParams = layer_spec.get("layer", {}).get("visParams")

    if not eeObject and visParams:  # pragma: no cover
        return layer_spec

    image = ee.Image(eeObject).selfMask()

    map_id_dict = image.getMapId(visParams)
    url = map_id_dict["tile_fetcher"].url_format
    layer_spec["layer"]["url"] = url

    return layer_spec


def init_layers():

    layer_json = stormpiper_path / "data" / "ee" / "layers.json"

    raw_layers = json.loads(layer_json.read_text())
    layer_dict = {}

    for name, layer_spec in raw_layers.items():
        try:
            layer_dict[name] = init_url(layer_spec)
        except ee.ee_exception.EEException as e:  # pragma: no cover
            print(f"ERROR loading layer {name}", e)
            continue

    return layer_dict


def layers():
    global EE_LAYERS

    if EE_LAYERS:
        return EE_LAYERS

    EE_LAYERS = init_layers()

    return EE_LAYERS


def assets():
    project_folder = settings.EE_PROJECT_DIRECTORY
    return ee.data.listAssets({"parent": project_folder})
