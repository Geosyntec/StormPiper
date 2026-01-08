import geopandas
import numpy
from pandas.testing import assert_index_equal
from pymcdm.methods import PROMETHEE_II

from stormpiper.database.connection import engine
from stormpiper.src.decision_support import prom


def test_prom_equity():
    criteria = ["access"]
    weights = [1]
    directions = [-1]

    df = prom.run_subbasins_promethee_prioritization(
        criteria, weights, directions
    ).set_index("subbasin")

    # sort to low access first - ascending
    subbasins_attr = df["access"].sort_values().index  # type: ignore

    # sort to high scores first - descending
    subbasins_score = df["score"].sort_values(ascending=False).index  # type: ignore

    assert_index_equal(subbasins_attr, subbasins_score)


def test_prom_preservation():
    criteria = ["TSS_load_lbs"]
    weights = [1]
    directions = [-1]

    df = prom.run_subbasins_promethee_prioritization(
        criteria, weights, directions
    ).set_index("subbasin")

    # if we're seeking preservation projects, we prioritize low load first
    subbasins_attr = df["TSS_load_lbs"].sort_values().index  # type: ignore

    # sort to high scores first - descending
    subbasins_score = df["score"].sort_values(ascending=False).index  # type: ignore

    assert_index_equal(subbasins_attr, subbasins_score)


def test_prom_retrofit():
    criteria = ["TSS_load_lbs"]
    weights = [1]
    directions = [1]

    df = prom.run_subbasins_promethee_prioritization(
        criteria, weights, directions
    ).set_index("subbasin")

    # if we're seeking retrofit projects, we prioritize high load first
    subbasins_attr = df["TSS_load_lbs"].sort_values(ascending=False).index  # type: ignore

    # sort to high scores first - descending
    subbasins_score = df["score"].sort_values(ascending=False).index  # type: ignore

    assert_index_equal(subbasins_attr, subbasins_score)


def test_prom_reference_impl():
    criteria = ["TSS_load_lbs", "access"]
    weights = [1, 2]
    directions = [1, -1]

    sub_results = geopandas.read_postgis(
        "select * from subbasininfo_v order by subbasin",
        con=engine,
    )

    score_new = prom.run_promethee_ii(
        sub_results, criteria=criteria, weights=weights, types=directions
    ).round(3)

    matrix = sub_results[criteria].to_numpy()
    promethee_ii = PROMETHEE_II("usual")
    _score = promethee_ii(matrix, numpy.array(weights), numpy.array(directions))
    score_old = (prom.minmax_normalization(_score) * 100).round(3)  # type: ignore

    diff = score_new - score_old

    assert numpy.abs(diff).sum() < 1e-9, diff
