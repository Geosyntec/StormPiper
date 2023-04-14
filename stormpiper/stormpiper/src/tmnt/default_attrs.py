import logging

import geopandas
import numpy
import pandas
import sqlalchemy as sa

from stormpiper.core.config import settings
from stormpiper.database.changelog import sync_log
from stormpiper.database.connection import get_session

logging.basicConfig(level=settings.LOGLEVEL)
logger = logging.getLogger(__name__)


def set_default_tmnt_attributes(tmnt_facility_df: pandas.DataFrame):
    df = tmnt_facility_df

    df = df.assign(facility_type="no_treatment")

    pinf = (df["facilitytype"] == "Bioretention") & (
        df["infiltrated"].str.lower() == "partial"
    )
    df.loc[pinf, "facility_type"] = "bioretention_with_partial_infiltration"

    finf = (df["facilitytype"] == "Bioretention") & (
        df["infiltrated"].str.lower() == "full"
    )
    df.loc[finf, "facility_type"] = "bioretention_with_full_infiltration"

    ninf = (df["facilitytype"] == "Bioretention") & (df["infiltrated"].isna())
    df.loc[ninf, "facility_type"] = "bioretention_with_no_infiltration"

    ded = (df["facilitytype"] == "Tank") & (df["flowcontrol"].isna())
    df.loc[ded, "facility_type"] = "dry_extended_detention"

    fdc = (df["facilitytype"] == "Tank") & (~df["flowcontrol"].isna())
    df.loc[fdc, "facility_type"] = "flow_duration_control_tank"

    df.loc[(df["facilitytype"] == "Trench"), "facility_type"] = "infiltration"

    pp = df["facilitytype"] == "Pervious Pavement"
    df.loc[pp, "facility_type"] = "pervious_pavement"
    df.loc[(df["facilitytype"] == "Sand Filter"), "facility_type"] = "sand_filter"
    df.loc[(df["facilitytype"] == "Vegetated Box"), "facility_type"] = "vegetated_box"
    df.loc[(df["facilitytype"] == "Media Filter"), "facility_type"] = "media_filter"

    ows = df["facilitytype"] == "Oil Water Separator"
    df.loc[ows, "facility_type"] = "oil_water_separator"

    hds = df["facilitytype"] == "Swirl Separator"
    df.loc[hds, "facility_type"] = "hydrodynamic_separator"
    df.loc[(df["facilitytype"] == "Swale"), "facility_type"] = "vegetated_swale"
    df.loc[(df["facilitytype"] == "Pond"), "facility_type"] = "wet_pond"
    df.loc[(df["facilitytype"] == "Vault"), "facility_type"] = "vault"

    retains_full = [
        "bioretention_with_full_infiltration",
        "infiltration",
        "pervious_pavement",
    ]

    retains_partial = [
        "bioretention_with_partial_infiltration",
        "dry_extended_detention",
        "flow_duration_control_tank",
        "vegetated_swale",
    ]

    df = (
        df.assign(captured_pct=91.0)
        .assign(
            retained_pct=lambda df: numpy.where(
                df["facility_type"].isin(retains_partial),
                20.0,
                numpy.where(
                    df["facility_type"].isin(retains_full), df["captured_pct"], 0.0
                ),
            )
        )
        .assign(
            facility_type=lambda df: numpy.where(
                df["facility_type"] != "no_treatment",
                df["facility_type"].astype(str) + "_simple",
                df["facility_type"],
            )
        )
    )

    return df


def update_tmnt_attributes(engine, overwrite=False):
    df = geopandas.read_postgis("tmnt_facility", con=engine).pipe(  # type: ignore
        set_default_tmnt_attributes
    )

    existing_altids = pandas.read_sql(
        "select altid from tmnt_facility_attribute", con=engine
    )["altid"].unique()

    with engine.begin() as conn:
        if overwrite:
            existing_altids = []
            conn.execute(sa.text("delete from tmnt_facility_attribute"))

        df = df.query("altid not in @existing_altids")

        if not df.empty:
            subs = geopandas.read_postgis("subbasin", con=engine)
            df = (
                df.sjoin(subs, how="left")  # type: ignore
                .reindex(
                    columns=[
                        "altid",
                        "node_id",
                        "basinname",
                        "subbasin",
                        "facility_type",
                        "captured_pct",
                        "retained_pct",
                    ]
                )
                .assign(subbasin=lambda df: df["subbasin"].fillna("None").astype(str))
                .assign(basinname=lambda df: df["basinname"].fillna("None").astype(str))
            )

            df.to_sql(
                "tmnt_facility_attribute", con=conn, if_exists="append", index=False
            )

            Session = get_session(engine=engine)
            # same transaction scope to update the change log
            with Session.begin() as session:  # type: ignore
                logger.info("recording table change...")
                sync_log(tablename="tmnt_facility_attribute", db=session)

        return df
