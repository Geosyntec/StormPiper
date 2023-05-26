import logging
from typing import Sequence

import geopandas
from pymcdm.methods import PROMETHEE_II
from pymcdm.normalizations import minmax_normalization

from stormpiper.core.config import settings
from stormpiper.database.connection import engine

logging.basicConfig(level=settings.LOGLEVEL)
logger = logging.getLogger(__name__)


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
    directions: Sequence[int],
    engine=engine,
) -> geopandas.GeoDataFrame:
    sub_results = geopandas.read_postgis(
        f"select * from subbasininfo_v order by subbasin",
        con=engine,
    ).assign(  # type: ignore
        score=lambda df: run_promethee_ii(
            df, criteria=list(criteria), weights=list(weights), types=list(directions)
        ).round(3)
    )

    return sub_results  # type: ignore
