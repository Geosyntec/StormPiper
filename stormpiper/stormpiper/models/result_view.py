from enum import Enum
from typing import Optional

from pydantic import create_model

from stormpiper.database.schemas import results, views

from .base import BaseORM

strings = [
    "node_id",
    "epoch",
    "node_type",
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

SubbasinResultView = create_model(
    "SubbasinResultView",
    __base__=BaseORM,
    **{
        str(c): (Optional[str] if c in strings else Optional[float], ...)
        for c in set(["node_id", "epoch", "subbasin", "basinname"] + views.COLS)
        if not any([c.startswith("_"), c == "geom"])
    },
)


class StrEnum(str, Enum):
    ...


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
