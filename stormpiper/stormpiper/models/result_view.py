from typing import Optional

from pydantic import BaseConfig, create_model

from stormpiper.database.schemas.results import COLS

strings = ["id", "node_id", "epoch_id", "node_type", "facility_type", "valid_model"]


class Config(BaseConfig):
    orm_mode = True


ResultView = create_model(
    "ResultView",
    __config__=Config,
    **{
        c: (Optional[str] if c in strings else Optional[float], ...)
        for c in ["epoch_id"] + COLS
        if not c.startswith("_")
    },
)
