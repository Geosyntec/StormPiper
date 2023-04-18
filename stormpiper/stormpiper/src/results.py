import warnings
from typing import Any

import pandas
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from stormpiper.database.connection import engine
from stormpiper.database.schemas import changelog
from stormpiper.database.utils import orm_to_dict, scalars_to_records


async def is_dirty_dep(db: AsyncSession) -> dict[str, Any]:  # pragma: no cover
    warnings.warn("this is deprecated.", DeprecationWarning, stacklevel=2)

    response = {"is_dirty": True, "last_updated": "0"}
    result = (
        (
            await db.execute(
                select(changelog.TableChangeLog).where(
                    changelog.TableChangeLog.tablename == "result_blob"
                )
            )
        )
        .scalars()
        .first()
    )
    if not result:  # pragma: no cover
        return response  # it's dirty if there are no results

    result_record = orm_to_dict(result)
    res_updated = result_record["last_updated"]

    others = (
        (
            await db.execute(
                select(changelog.TableChangeLog).where(
                    changelog.TableChangeLog.tablename != "result_blob"
                )
            )
        )
        .scalars()
        .all()
    )
    other_records = scalars_to_records(others)
    response["is_dirty"] = any(i["last_updated"] > res_updated for i in other_records)
    response["last_updated"] = res_updated

    return response


async def is_dirty(
    *, db: AsyncSession, tablename: str, dependents: list[str] | None = None
) -> dict[str, Any]:  # pragma: no cover
    warnings.warn("this is deprecated.", DeprecationWarning, stacklevel=2)
    response = {"is_dirty": True, "last_updated": "0"}

    changelog_results = (
        (await db.execute(select(changelog.TableChangeLog))).scalars().all()
    )
    if not changelog_results:  # pragma: no cover
        return response  # it's dirty if there are no results

    records = scalars_to_records(changelog_results)

    if dependents is None:
        dependents = [x["tablename"] for x in records]

    result_record = next(filter(lambda x: x["tablename"] == tablename, records))
    res_updated = result_record["last_updated"]

    if len(dependents) == 0:
        response["is_dirty"] = False

    else:
        dependent_records = filter(
            lambda x: x["tablename"] != tablename and x["tablename"] in dependents,
            records,
        )

        response["is_dirty"] = any(
            i["last_updated"] > res_updated for i in dependent_records
        )

    response["last_updated"] = res_updated

    return response


def calculate_src_ctrl_percent_reduction(
    *,
    load: pandas.DataFrame,
    src_ctrls: pandas.DataFrame,
    direction: str | None = "upstream"
):
    """
    load must have the subbasins and basinname attributes pre-joined in and runoff removed (pocs only)


    """

    src_ctrl_directional = (
        src_ctrls.query("direction==@direction")
        .loc[
            :,
            [
                "subbasin",
                "variable",
                "order",
                "activity",
                "direction",
                "percent_reduction",
            ],
        ]
        .sort_values(["subbasin", "variable", "order"])
    )

    df1 = load.merge(src_ctrl_directional, on=["subbasin", "variable"]).sort_values(
        ["node_id", "epoch", "variable", "order"]
    )

    df1_ck = df1.groupby(["node_id", "epoch", "variable", "order"]).count()

    assert all(df1_ck.max(axis=1) <= 1), df1.sort_values(
        ["node_id", "epoch", "variable", "order"]
    ).to_json(orient="records", indent=2)

    df2 = []
    orders = sorted(df1["order"].unique())
    for i, order in enumerate(orders):
        _df = df1.query("order == @order")

        col = "value"
        if i > 0:
            prev_order = orders[i - 1]
            col = "value_remaining"
            columns = ["node_id", "epoch", "variable"]

            _df = _df.merge(
                df2[prev_order].reindex(columns=columns + [col]), on=columns, how="left"
            )

        _df = _df.assign(
            value_remaining_prev=lambda df: df[col].fillna(df["value"])
        ).assign(
            value_remaining=lambda df: df["value_remaining_prev"]
            * (1 - (df["percent_reduction"] / 100))
        )

        df2.append(_df)

    if not len(df2):  # pragma: no cover
        return pandas.DataFrame([])

    df = (
        pandas.concat(df2)
        .sort_values(["node_id", "epoch", "variable", "order"])
        .assign(
            load_reduced=lambda df: df["value_remaining_prev"] - df["value_remaining"]
        )
        .reset_index(drop=True)
        .assign(id=lambda df: df.index.values)
    )
    return df


def source_controls_upstream_load_reduction_db(*, engine=engine):
    lgu_load = pandas.read_sql("lgu_load", con=engine)
    lgu_boundary = pandas.read_sql("lgu_boundary", con=engine)
    src_ctrls = pandas.read_sql(
        "select * from tmnt_source_control where direction = 'upstream'",
        con=engine,
    )

    lgu_to_us_src_ctrl = lgu_load.query('variable != "runoff"').merge(
        lgu_boundary[["node_id", "subbasin", "basinname"]], on="node_id", how="left"
    )

    df = calculate_src_ctrl_percent_reduction(
        load=lgu_to_us_src_ctrl, src_ctrls=src_ctrls, direction="upstream"
    )

    return df


def source_controls_downstream_load_reduction_db(*, engine=engine):
    lgu_load = pandas.read_sql("load_to_ds_src_ctrl", con=engine)
    lgu_boundary = pandas.read_sql("lgu_boundary", con=engine)
    src_ctrls = pandas.read_sql(
        "select * from tmnt_source_control where direction = 'downstream'",
        con=engine,
    )

    lgu_to_ds_src_ctrl = lgu_load.query('variable != "runoff"').merge(
        lgu_boundary[["node_id", "subbasin", "basinname"]], on="node_id", how="left"
    )

    df = calculate_src_ctrl_percent_reduction(
        load=lgu_to_ds_src_ctrl, src_ctrls=src_ctrls, direction="downstream"
    )

    return df
