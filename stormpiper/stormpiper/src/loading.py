import logging
from textwrap import dedent
from typing import Optional

import geopandas
import pandas

from stormpiper.core.config import settings
from stormpiper.database.connection import engine
from stormpiper.earth_engine import loading, login

logging.basicConfig(level=settings.LOGLEVEL)
logger = logging.getLogger(__name__)


POC_REMAPPER = {
    "DEHP": "DEHP",
    "Phenanthrene": "PHE",
    "Pyrene": "PYR",
    "TotalCopper": "TCu",
    "TotalNitrogen": "TN",
    "TotalPhosphorus": "TP",
    "TotalSuspendedSolids": "TSS",
    "TotalZinc": "TZn",
}


def compute_loading_zonal_stats(
    *,
    lgu_boundary: geopandas.GeoDataFrame,
    runoff_path: Optional[str] = None,
    coc_path: Optional[str] = None,
) -> pandas.DataFrame:

    runoff_path = runoff_path or settings.EE_RUNOFF_PATH
    coc_path = coc_path or settings.EE_COC_PATH

    if login():

        zones = lgu_boundary.to_crs(4326).to_json()  # type: ignore  # type: ignore

        df_wide = loading.zonal_stats(
            runoff_path=runoff_path,
            concentration_path=coc_path,
            zones=zones,
            join_id="node_id",
        )
    else:
        logger.error("cannot log in to Earth Engine. Aborting loading calculation.")
        return pandas.DataFrame([])

    return df_wide


def wide_load_to_tidy_load(wide_load: pandas.DataFrame, poc_remapper=POC_REMAPPER):

    df_tidy = (
        wide_load.melt(id_vars=["node_id", "epoch"])
        .reset_index(drop=True)
        .assign(id=lambda df: df.index.values + 1)
        .set_index("id")
        .assign(
            _variable=lambda df: df["variable"]
            .str.split("_")
            .str[:-1]  # pop off unit and rejoin
            .str.join("_")
        )
        .assign(
            units=lambda df: df["variable"].str.split("_").str[-1]
        )  # pop off unit into new column
        .assign(
            variable=lambda df: df["_variable"].replace(poc_remapper)
        )  # normalize poc names
        .drop(columns=["_variable"])
    )

    return df_tidy


def compute_loading(*, lgu_boundary, runoff_path=None, coc_path=None):
    try:
        wide_load = compute_loading_zonal_stats(
            lgu_boundary=lgu_boundary, runoff_path=runoff_path, coc_path=coc_path
        )
        if len(wide_load) > 0:
            tidy_load = wide_load_to_tidy_load(wide_load)
            return tidy_load
        return
    except Exception:
        logger.error("Could not create loading zonal stats from ee.")
        raise


def compute_loading_db(engine=engine, runoff_path=None, coc_path=None):

    with engine.begin() as conn:
        zones = geopandas.read_postgis("lgu_boundary", con=conn)

    df = compute_loading(lgu_boundary=zones, runoff_path=runoff_path, coc_path=coc_path)
    return df


### prep loading data for input into nereid


def _prep_00_loading_tidy_to_wide(df_tidy):
    """
    df tidy has node_id, and epoch fields
    """

    _df = df_tidy.pivot(
        index=["node_id", "epoch"], columns=["variable", "units"], values=["value"]
    )
    _df.columns = _df.columns.to_flat_index()
    _df = _df.rename(columns=lambda c: "_".join(c[1:])).reset_index()

    return _df


def _prep_01_loading_joins(prepped_wide, lgu_boundary, met):
    assert lgu_boundary.crs == settings.TACOMA_EPSG

    _df = prepped_wide.merge(
        lgu_boundary.assign(area_acres=lambda df: df.geometry.area / 43560)[
            ["node_id", "area_acres"]
        ],
        on="node_id",
        how="left",
    )

    _df = _df.merge(met, on="epoch", how="left")

    return _df


def _prep_02_loading_units(prepped_wide):

    _df = (
        prepped_wide.assign(
            **{
                c.replace("_mcg", "_lbs"): lambda df, c=c: df[c]
                / 453592370  # mcg -> lbs
                for c in prepped_wide.columns
                if "_mcg" in c
            }
        )
        .assign(runoff_volume_cuft=lambda df: df["runoff_L"] * 0.0353147)  # L -> cuft
        .assign(__area_sqft=lambda df: df["area_acres"] * 43560)  # sqft -> acres
        .assign(
            __runoff_depth_feet=lambda df: df["runoff_volume_cuft"]
            / (df["__area_sqft"])
        )
        .assign(
            runoff_depth_inches=lambda df: df["__runoff_depth_feet"] * 12
        )  # feet -> inches
        .assign(
            ro_coeff=lambda df: df["runoff_depth_inches"]
            / df["mean_annual_precip_depth_inches"]
        )
        .assign(eff_area_acres=lambda df: df["area_acres"] * df["ro_coeff"])
        .rename(columns=lambda c: c.replace("_lbs", "_load_lbs"))
    )
    _cols = [
        c for c in _df.columns if all(["__" != c[:2], "_mcg" not in c, "_L" not in c])
    ]
    prepped_loading = _df.reindex(columns=_cols)

    return prepped_loading


def land_surface_load_nereid(df_tidy, zones, met):
    df = (
        df_tidy.pipe(_prep_00_loading_tidy_to_wide)
        .pipe(_prep_01_loading_joins, zones, met)
        .pipe(_prep_02_loading_units)
    )
    return df


def get_land_surface_loading_df_from_db(epoch=None, engine=engine):

    if epoch is None:
        epoch_str, user_epoch = "1=%(epoch)s", "1"
    else:
        user_epoch = epoch
        epoch_str = "epoch = %(epoch)s "

    qry = dedent(
        f"""\
        select
            *
        from lgu_load
        where
            ({epoch_str})
        """
    )

    df_tidy = pandas.read_sql(qry, params={"epoch": user_epoch}, con=engine)

    return df_tidy


def land_surface_load_nereid_from_db(epoch=None, connectable=engine):

    df_tidy = get_land_surface_loading_df_from_db(epoch=epoch, engine=connectable)
    zones = geopandas.read_postgis("lgu_boundary", con=connectable)
    met = pandas.read_sql("met", con=connectable)

    df = (
        df_tidy.pipe(_prep_00_loading_tidy_to_wide)
        .pipe(_prep_01_loading_joins, zones, met)
        .pipe(_prep_02_loading_units)
    )
    return df
