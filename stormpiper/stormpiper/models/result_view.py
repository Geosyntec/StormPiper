from typing import Optional

from pydantic import create_model

from stormpiper.database.schemas import results, views

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
    "rankcriteria",
]

ResultView = create_model(  # type: ignore
    "ResultView",
    __base__=BaseORM,
    **{  # type: ignore
        str(c): (Optional[str] if c in strings else Optional[float], ...)
        for c in set(["node_id", "epoch"] + results.COLS)
        if not c.startswith("_")
    },
)

SubbasinWQResultView = create_model(  # type: ignore
    "SubbasinWQResultView",
    __base__=BaseORM,
    **{  # type: ignore
        str(c): (Optional[str] if c in strings else Optional[float], ...)
        for c in set(["subbasin", "basinname", "epoch"] + views.WQ_COLS)
        if not any([c.startswith("_"), c == "geom"])
    },
)

SubbasinInfoView = create_model(  # type: ignore
    "SubbasinInfoView",
    __base__=BaseORM,
    **{  # type: ignore
        str(c): (Optional[str] if c in strings else Optional[float], ...)
        for c in set(["subbasin", "basinname", "epoch"] + views.INFO_COLS)
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
