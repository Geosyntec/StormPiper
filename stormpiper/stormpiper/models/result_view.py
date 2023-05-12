from typing import Optional

from pydantic import create_model

from stormpiper.database.schemas import results, subbasin_result_view
from stormpiper.database.utils import orm_fields

from .base import BaseORM, StrEnum

strings = [
    "node_id",
    "epoch",
    "node_type",
    "ntype",
    "facility_type",
    "valid_model",
    "subbasin",
    "basinname",
]

ResultView = create_model(
    "ResultView",
    __base__=BaseORM,
    **{
        str(c): (Optional[str] if c in strings else Optional[float], ...)
        for c in set(["node_id", "epoch"] + results.COLS)
        if not c.startswith("_")
    },
)

SubbasinWQResultView = create_model(
    "SubbasinWQResultView",
    __base__=BaseORM,
    **{
        str(c): (Optional[str] if c in strings else Optional[float], ...)
        for c in orm_fields(subbasin_result_view.SubbasinWQResult_View)
        if not any([c.startswith("_"), c == "geom"])
    },
)

SubbasinInfoView = create_model(
    "SubbasinWQResultView",
    __base__=BaseORM,
    **{
        str(c): (Optional[str] if c in strings else Optional[float], ...)
        for c in orm_fields(subbasin_result_view.SubbasinInfo_View)
        if not any([c.startswith("_"), c == "geom"])
    },
)


Epoch = StrEnum(
    "Epoch",
    {
        "all": "all",
        "1980s": "1980s",
        "2030s": "2030s",
        "2050s": "2050s",
        "2080s": "2080s",
    },
)

NType = StrEnum(
    "NType",
    {"land_surface": "land_surface", "tmnt_facility": "tmnt_facility"},
)
