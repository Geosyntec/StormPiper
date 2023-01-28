from typing import List, Literal

from pydantic import Field

from stormpiper.src.decision_support import prom

from .base import BaseModel


class PromRequestCriteria(BaseModel):
    weight: float = Field(0, ge=0)
    criteria: Literal[tuple(prom.CRITERIA)]  # type: ignore


class PromRequest(BaseModel):
    wq_type: prom.WQType
    criteria: List[PromRequestCriteria]
