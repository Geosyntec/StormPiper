import logging
from typing import Literal, Sequence

import geopandas
import pandas
from pymcdm.methods import PROMETHEE_II
from pymcdm.normalizations import minmax_normalization

from stormpiper.core.config import settings
from stormpiper.database.connection import engine

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
    "TSS_conc_mg/l_effluent",
    "TN_conc_mg/l_effluent",
]


CRITERIA = EQUITY_COLS + POC_COLS


def run_promethee_ii(
    df,
    criteria: Sequence[str],
    weights: Sequence[int],
    wq_type: WQType,
    # p_function: PFunction = "usual",
):

    direction = 1 if wq_type == "restoration" else -1
    types = [direction if c in POC_COLS else -1 for c in criteria]

    promethee_ii = PROMETHEE_II("usual")
    matrix = df[criteria].to_numpy()

    logger.debug(f"types: {types}\nweights: {weights}")

    scores = promethee_ii(matrix, weights, types)
    scores = minmax_normalization(scores) * 100

    df["score"] = scores

    return df


def run_subbasins_promethee_prioritization(
    criteria: Sequence[str], weights: Sequence[int], wq_type: WQType
):
    res_cols = ", ".join(["id"] + [f'"{c}"' for c in POC_COLS])

    subbasins = geopandas.read_postgis("subbasin", con=engine)

    sub_results = pandas.read_sql(
        f"select {res_cols} from result_v where epoch_id = '1980s' and id like 'SB_%%'",
        con=engine,
    ).assign(subbasin=lambda df: df.id.str.replace("SB_", ""))

    df = subbasins.merge(  # type: ignore
        sub_results[["subbasin", *POC_COLS]], on="subbasin", how="left"
    ).sort_values("subbasin")

    scored_df = run_promethee_ii(
        df,
        criteria=list(criteria),
        weights=list(weights),
        wq_type=wq_type,
    )

    return scored_df
