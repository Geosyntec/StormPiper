from typing import Literal

from pydantic import Field, validator

from stormpiper.database.schemas import views
from stormpiper.src.decision_support import prom

from .base import BaseModel

VALID_CRITERIA = [
    c
    for c in views.COLS
    if c not in ["id", "subbasin", "basinname", "node_id", "epoch", "geom"]
]


class PromRequestCriteria(BaseModel):
    weight: float = Field(0, ge=0)
    criteria: Literal[tuple(VALID_CRITERIA)]  # type: ignore
    direction: int = Field(1, ge=-1, le=1)

    @validator("direction", pre=True, always=True)
    def set_direction(cls, v):
        assert v in [-1, 1], "direction must be either -1 or 1"
        return v


class PromRequest(BaseModel):
    criteria: list[PromRequestCriteria]
