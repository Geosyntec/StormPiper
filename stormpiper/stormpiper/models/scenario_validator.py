import json
from copy import deepcopy
from hashlib import sha256

import geopandas
from shapely import wkt
from sqlalchemy.ext.asyncio import AsyncSession

from stormpiper.apps import supersafe as ss
from stormpiper.core.utils import get_data_hash

from .scenario import ScenarioPost, ScenarioUpdate
from .tmnt_attr_validator import tmnt_attr_validator


def scenario_delin_uid(ix: int, geom: str, name: None | str, relid: None | str) -> str:
    inp = f"{ix}_{geom}_{name}_{relid}".encode()
    hash = sha256(inp).hexdigest()[:8]
    return hash


def validate_delineation_collection(delineation_collection_geojson: str) -> str:
    delin = (
        geopandas.read_file(delineation_collection_geojson)
        .assign(
            altid=lambda df: df.apply(
                lambda r: scenario_delin_uid(
                    # r.name is the index, r['name'] is value stored in 'name' column.
                    r.name,
                    wkt.dumps(r.geometry),
                    r["name"],
                    r.relid,
                ),
                axis=1,
            )
        )
        .assign(node_id=lambda df: "ls_" + df["name"].astype(str) + "_" + df["altid"])
    )

    delin_json = delin.to_json()

    return delin_json


async def scenario_validator(
    scenario: ScenarioPost,
    user: ss.users.User,
    context: dict,
    db: AsyncSession,
) -> ScenarioUpdate:
    """TODO: make this validate tmnt attrs."""
    data = scenario.dict(exclude_unset=True)
    loading_hash = "null"
    input_hash = "null"

    if scenario.input is not None:
        input_hash = get_data_hash(scenario.input.dict())
        if scenario.input.delineation_collection is not None:
            delin_col_valid = validate_delineation_collection(
                scenario.input.delineation_collection.json()
            )

            delineation_collection = json.loads(delin_col_valid)
            loading_hash = get_data_hash(delineation_collection)

            data["input"]["delineation_collection"] = delineation_collection

    structural_tmnt = None

    if (
        scenario.input is not None
        and scenario.input.tmnt_facility_collection is not None
    ):
        collection = data["input"]["tmnt_facility_collection"]
        structural_tmnt = []
        for f in collection.get("features", [{}]):
            props = f.get("properties")
            if props:
                tmnt_update = await tmnt_attr_validator(
                    tmnt_patch=props, context=context, db=db, user=user
                )
                new_props = deepcopy(props)
                if tmnt_update.tmnt_attr:
                    new_props.update(**tmnt_update.tmnt_attr.dict())
                if tmnt_update.tmnt_cost:
                    new_props.update(**tmnt_update.tmnt_cost.dict())

                structural_tmnt.append(new_props)

    new_obj = ScenarioUpdate(
        **data,
        updated_by=user.email,
        loading_hash=loading_hash,
        input_hash=input_hash,
        structural_tmnt=structural_tmnt,
    )

    return new_obj
