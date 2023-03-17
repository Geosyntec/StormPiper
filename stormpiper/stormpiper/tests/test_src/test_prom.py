from pandas.testing import assert_index_equal

from stormpiper.src.decision_support import prom


def test_prom_equity():
    criteria = ["access"]
    weights = [1]

    df = prom.run_subbasins_promethee_prioritization(criteria, weights).set_index(
        "subbasin"
    )

    # sort to low access first - ascending
    subbasins_attr = df["access"].sort_values().index

    # sort to high scores first - descending
    subbasins_score = df["score"].sort_values(ascending=False).index

    assert_index_equal(subbasins_attr, subbasins_score)


def test_prom_restoration():
    criteria = ["TSS_load_lbs"]
    weights = [1]
    wq_type = "restoration"

    df = prom.run_subbasins_promethee_prioritization(
        criteria, weights, wq_type
    ).set_index("subbasin")

    # if we're seeking restoration projects, we prioritize low load first
    subbasins_attr = df["TSS_load_lbs"].sort_values().index

    # sort to high scores first - descending
    subbasins_score = df["score"].sort_values(ascending=False).index

    assert_index_equal(subbasins_attr, subbasins_score)


def test_prom_retrofit():
    criteria = ["TSS_load_lbs"]
    weights = [1]
    wq_type = None

    df = prom.run_subbasins_promethee_prioritization(
        criteria, weights, wq_type
    ).set_index("subbasin")

    # if we're seeking retrofit projects, we prioritize high load first
    subbasins_attr = df["TSS_load_lbs"].sort_values(ascending=False).index

    # sort to high scores first - descending
    subbasins_score = df["score"].sort_values(ascending=False).index

    assert_index_equal(subbasins_attr, subbasins_score)
