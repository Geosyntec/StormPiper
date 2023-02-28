import logging
from copy import deepcopy
from typing import Any

from nereid.api.api_v1.models import treatment_facility_models
from nereid.api.api_v1.models.treatment_facility_models import (
    STRUCTURAL_FACILITY_TYPE,
    TREATMENT_FACILITY_MODELS,
)
from pydantic import ValidationError
from sqlalchemy.ext.asyncio import AsyncSession

from stormpiper.apps import supersafe as ss
from stormpiper.core.config import settings
from stormpiper.src.npv import compute_bmp_npv, get_npv_settings

from .base import BASE, BaseModel
from .npv import NPVRequest
from .tmnt_attr import (
    InvalidModel,
    TMNTFacilityAttrPatch,
    TMNTFacilityAttrUpdate,
    TMNTFacilityCostUpdate,
    TMNTFacilityPatch,
    TMNTUpdate,
)

logging.basicConfig(level=settings.LOGLEVEL)
logger = logging.getLogger(__name__)


def validate_tmnt_modeling_params(
    unvalidated_data: dict, context: dict
) -> None | TMNTFacilityAttrUpdate:
    modeling_fields = {
        f
        for c in TREATMENT_FACILITY_MODELS
        for f in type("_", (BaseModel, c), {}).get_fields()
    }

    modifies_modeling_data = any(
        (k in modeling_fields for k in unvalidated_data.keys())
    )

    if not modifies_modeling_data:
        return None

    facility_type = unvalidated_data.get("facility_type", None)

    facility_type_context = context["api_recognize"]["treatment_facility"][
        "facility_type"
    ]
    model_str = facility_type_context.get(facility_type, {}).get(
        "validator", r"¯\_(ツ)_/¯"
    )
    model = getattr(treatment_facility_models, model_str, None)

    if model is None:
        e = (
            f"facility type '{facility_type}' is invalid. "
            f"Valid facility types are: {list(facility_type_context.keys())}"
        )
        raise InvalidModel(e)

    md = dict(node_id="", ref_data_key="", design_storm_depth_inches=1)
    md.update(
        TMNTFacilityAttrPatch(**unvalidated_data).dict(
            exclude_unset=True, exclude_none=True
        )
    )
    _ = model(**md)

    return TMNTFacilityAttrUpdate(**unvalidated_data)


def maybe_update_npv_params(
    unvalidated_data: dict, npv_global_settings: dict
) -> None | TMNTFacilityCostUpdate:
    # check if the patch changes an npv field. If not, pass. if so, validate it,
    # and if it doesn't validate then set npv calc to None so that it's not out of date.
    npv_fields = NPVRequest.get_fields()
    modifies_npv_fields = any((k in npv_fields for k in unvalidated_data.keys()))

    if not modifies_npv_fields:
        return None

    unvalidated_data["net_present_value"] = None

    try:
        npv_req = NPVRequest(**unvalidated_data, **npv_global_settings)

    except ValidationError as _:
        logger.info("Validation Error", _)
        return TMNTFacilityCostUpdate(**unvalidated_data)

    result, _ = compute_bmp_npv(**npv_req.dict())
    unvalidated_data["net_present_value"] = result

    return TMNTFacilityCostUpdate(**unvalidated_data)


async def tmnt_attr_validator(
    tmnt_patch: dict[str, Any] | TMNTFacilityPatch | STRUCTURAL_FACILITY_TYPE,
    context: dict,
    db: AsyncSession,
    user: ss.users.User,
) -> TMNTUpdate:
    unvalidated_data = deepcopy(tmnt_patch)

    if isinstance(unvalidated_data, BASE):
        unvalidated_data = unvalidated_data.dict()

    unvalidated_data["updated_by"] = user.email

    tmnt_attr = validate_tmnt_modeling_params(unvalidated_data, context)

    npv_global_settings = await get_npv_settings(db)
    tmnt_cost = maybe_update_npv_params(unvalidated_data, npv_global_settings)

    return TMNTUpdate(tmnt_attr=tmnt_attr, tmnt_cost=tmnt_cost)
