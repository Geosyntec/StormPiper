import logging
from typing import Literal, Sequence

import geopandas
from pymcdm.methods import PROMETHEE_II
from pymcdm.normalizations import minmax_normalization

from stormpiper.core.config import settings
from stormpiper.database.connection import engine
from stormpiper.models.result_view import SubbasinResultView

logging.basicConfig(level=settings.LOGLEVEL)
logger = logging.getLogger(__name__)


PFunction = Literal["usual", "ushape", "vshape", "level", "vshape_2"]
WQType = Literal["retrofit", "restoration"]


# TODO: make this a config option, or derived from the subbasin results summary somehow.
EQUITY_COLS = [
    "access",
    "economic_value",
    "environmental_value",
    "livability_value",
    "opportunity_value",
]

POC_COLS = [
    c
    for c in SubbasinResultView.get_fields()
    if any((v in c.lower() for v in ["yield_lbs", "depth_inches"]))
]


CRITERIA = EQUITY_COLS + POC_COLS


def run_promethee_ii(
    df,
    criteria: Sequence[str],
    weights: Sequence[float],
    types: Sequence[int],
):

    promethee_ii = PROMETHEE_II("usual")
    matrix = df[criteria].to_numpy()

    logger.debug(f"types: {types}\nweights: {weights}")

    scores = promethee_ii(matrix, weights, types)
    scores = minmax_normalization(scores) * 100

    return scores


def run_subbasins_promethee_prioritization(
    criteria: Sequence[str],
    weights: Sequence[float],
    wq_type: WQType,
    engine=engine,
) -> geopandas.GeoDataFrame:

    direction = 1 if wq_type == "restoration" else -1
    types = [direction if c in POC_COLS else -1 for c in criteria]

    sub_results = geopandas.read_postgis(
        f"select * from subbasinresult_v where epoch = '1980s' order by subbasin ASC",
        con=engine,
    ).assign(  # type: ignore
        score=lambda df: run_promethee_ii(
            df, criteria=list(criteria), weights=list(weights), types=list(types)
        ).round(3)
    )

    return sub_results  # type: ignore
