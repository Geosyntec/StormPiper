from typing import Literal

from pydantic import Field

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


class PromRequest(BaseModel):
    wq_type: prom.WQType
    criteria: list[PromRequestCriteria]
