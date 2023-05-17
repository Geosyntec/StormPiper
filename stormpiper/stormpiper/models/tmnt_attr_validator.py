import logging
from copy import deepcopy
from typing import Any

from nereid.api.api_v1.models import treatment_facility_models
from nereid.api.api_v1.models.treatment_facility_models import (
    STRUCTURAL_FACILITY_TYPE,
    TREATMENT_FACILITY_MODELS,
)
from pydantic import ValidationError

from stormpiper.core.config import settings
from stormpiper.core.context import get_context
from stormpiper.src.npv import compute_bmp_pv, get_pv_settings

from .base import BASE, BaseModel
from .npv import PVRequest
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
    unvalidated_data: dict, context: dict[str, Any] | None = None
) -> None | TMNTFacilityAttrUpdate:
    if context is None:
        context = get_context()
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


def maybe_update_pv_params(
    unvalidated_data: dict, pv_global_settings: dict
) -> None | TMNTFacilityCostUpdate:
    # check if the patch changes an npv field. If not, pass. if so, validate it,
    # and if it doesn't validate then set npv calc to None so that it's not out of date.
    pv_fields = PVRequest.get_fields()
    modifies_pv_fields = any((k in pv_fields for k in unvalidated_data.keys()))

    if not modifies_pv_fields:
        return None

    cost_results = {
        "present_value_capital_cost": None,
        "present_value_om_cost": None,
        "present_value_total_cost": None,
        "present_value_cost_table": None,
        "present_value_chart_table": None,
    }

    unvalidated_data.update(**cost_results)

    try:
        pv_req = PVRequest(**{**unvalidated_data, **pv_global_settings})

    except ValidationError as _:
        logger.info("Validation Error", _)
        return TMNTFacilityCostUpdate(**unvalidated_data)
    cost_results = compute_bmp_pv(**pv_req.dict())
    unvalidated_data.update(**cost_results)

    return TMNTFacilityCostUpdate(**unvalidated_data)


def tmnt_attr_validator(
    tmnt_patch: dict[str, Any] | TMNTFacilityPatch | STRUCTURAL_FACILITY_TYPE,
    context: dict[str, Any] | None = None,
    pv_global_settings: dict[str, Any] | None = None,
) -> TMNTUpdate:
    unvalidated_data = deepcopy(tmnt_patch)

    if isinstance(unvalidated_data, BASE):
        unvalidated_data = unvalidated_data.dict()

    tmnt_attr = validate_tmnt_modeling_params(unvalidated_data, context=context)

    if pv_global_settings is None:
        pv_global_settings = get_pv_settings()
    tmnt_cost = maybe_update_pv_params(unvalidated_data, pv_global_settings)

    return TMNTUpdate(tmnt_attr=tmnt_attr, tmnt_cost=tmnt_cost)
