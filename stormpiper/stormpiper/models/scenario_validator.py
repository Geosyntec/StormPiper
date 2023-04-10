import json
from copy import deepcopy
from hashlib import sha256
from typing import Any

import geopandas
from shapely import wkt

from stormpiper.core.config import settings
from stormpiper.core.utils import get_data_hash

from .scenario import ScenarioUpdate
from .tmnt_attr_validator import tmnt_attr_validator


def scenario_delin_uid(ix: int, geom: str, name: None | str, relid: None | str) -> str:
    inp = f"{ix}_{geom}_{name}_{relid}".encode()
    hash = sha256(inp).hexdigest()[:8]
    return hash


def validate_delineation_collection(delineation_collection_geojson: str) -> str:
    delin = (
        geopandas.read_file(delineation_collection_geojson)
        .to_crs(epsg=settings.TACOMA_EPSG)
        .assign(
            altid=lambda df: df.apply(
                lambda r: scenario_delin_uid(
                    r.name,  # r.name is the index
                    wkt.dumps(r.geometry),
                    r["name"],  # r['name'] is value stored in 'name' column.
                    getattr(r, "relid", None),
                ),
                axis=1,
            )
        )
        .assign(node_id=lambda df: "ls_" + df["name"].astype(str) + "_" + df["altid"])
        .assign(area_acres=lambda df: df.geometry.area / 43_560)
        .to_crs(epsg=4326)
    )

    delin_json = delin.to_json()

    return delin_json


def scenario_validator(
    scenario: dict[str, Any],
    context: dict[str, Any] | None = None,
    pv_global_settings: dict[str, Any] | None = None,
) -> ScenarioUpdate:
    input_ = scenario.get("input", None)

    if input_ is not None:
        scenario["input_hash"] = get_data_hash(input_)
        delineation_collection = input_.get("delineation_collection", None)
        if delineation_collection is not None:
            delin_col_valid = validate_delineation_collection(
                json.dumps(delineation_collection)
            )

            delineation_collection = json.loads(delin_col_valid)
            scenario["loading_hash"] = get_data_hash(delineation_collection)
            scenario["input"]["delineation_collection"] = delineation_collection

        tmnt_facility_collection = input_.get("tmnt_facility_collection", None)
        if tmnt_facility_collection is not None:
            collection = scenario["input"]["tmnt_facility_collection"]
            structural_tmnt = []
            for f in collection.get("features", []):
                props = f.get("properties", None)
                if props:
                    tmnt_update = tmnt_attr_validator(
                        tmnt_patch=props,
                        context=context,
                        pv_global_settings=pv_global_settings,
                    )
                    new_props = deepcopy(props)
                    if tmnt_update.tmnt_attr:
                        new_props.update(**tmnt_update.tmnt_attr.dict())
                    if tmnt_update.tmnt_cost:
                        new_props.update(**tmnt_update.tmnt_cost.dict())

                    structural_tmnt.append(new_props)

            scenario["structural_tmnt"] = structural_tmnt

    new_obj = ScenarioUpdate(**scenario)

    return new_obj
