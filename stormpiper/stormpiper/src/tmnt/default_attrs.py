import logging

import geopandas
import numpy
import pandas
import sqlalchemy as sa

from stormpiper.core.config import settings
from stormpiper.core.context import get_context
from stormpiper.database.changelog import sync_log
from stormpiper.database.connection import get_session

logging.basicConfig(level=settings.LOGLEVEL)
logger = logging.getLogger(__name__)


def set_default_tmnt_attributes(
    tmnt_facility_df: pandas.DataFrame,
):
    ctx_tf = get_context()
    ctx_df = pandas.DataFrame(
        [
            {**dct, "treatment_facility": k}
            for k, dct in ctx_tf["api_recognize"]["treatment_facility"][
                "facility_type"
            ].items()
        ]
    )

    df = tmnt_facility_df

    df = df.assign(facility_type="no_treatment")

    # bioret

    q = df["facilitytype"] == "Bioretention"
    df.loc[q, "facility_type"] = "bioretention_with_no_infiltration"

    q = (df["facilitytype"] == "Bioretention") & (
        df["infiltrated"].str.lower() == "partial"
    )
    df.loc[q, "facility_type"] = "bioretention_with_partial_infiltration"

    q = (df["facilitytype"] == "Bioretention") & (
        df["infiltrated"].str.lower() == "full"
    )
    df.loc[q, "facility_type"] = "bioretention_with_full_infiltration"

    # media filters

    df.loc[(df["facilitytype"] == "Media Filter"), "facility_type"] = "media_filter"
    q = (df["facilitytype"] == "Media Filter") & (
        df["facilitydetail"]
        .str.lower()
        .isin(["bayfilter", "flogard perk filter", "stormfilter"])
    )
    df.loc[q, "facility_type"] = "cartridge_media_filter"

    # Tanks

    q = (df["facilitytype"] == "Tank") & (df["flowcontroltype"].isna())
    df.loc[q, "facility_type"] = "dry_extended_detention"

    q = (df["facilitytype"] == "Tank") & (~df["flowcontroltype"].isna())
    df.loc[q, "facility_type"] = "flow_duration_control_tank"

    # Perv Pavement
    q = df["facilitytype"] == "Pervious Pavement"
    df.loc[q, "facility_type"] = "pervious_pavement_with_partial_infiltration"

    q = (df["facilitytype"] == "Pervious Pavement") & (
        df["infiltrated"].str.lower() == "full"
    )
    df.loc[q, "facility_type"] = "pervious_pavement_with_full_infiltration"

    q = (df["facilitytype"] == "Pervious Pavement") & (
        df["infiltrated"].str.lower() == "full"
    )
    df.loc[q, "facility_type"] = "pervious_pavement_with_full_infiltration"

    # Pond
    df.loc[(df["facilitytype"] == "Pond"), "facility_type"] = "wet_pond"

    q = (df["facilitytype"] == "Pond") & (
        (df["infiltrated"].str.lower() == "full")
        | (df["facilitydetail"].str.lower() == "infiltration")
    )
    df.loc[q, "facility_type"] = "infiltration_pond"

    q = (
        (df["facilitytype"] == "Pond")
        & (df["infiltrated"].str.lower() != "full")
        & (df["facilitydetail"].str.lower().isin(["combined", "detention"]))
    )
    df.loc[q, "facility_type"] = "detention_pond"

    q = (df["facilitytype"] == "Pond") & (
        df["facilitydetail"].str.lower().str.contains("wetland")
    )
    df.loc[q, "facility_type"] = "wetland_pond"

    # Vault
    df.loc[(df["facilitytype"] == "Vault"), "facility_type"] = "wet_vault"
    q = (df["facilitytype"] == "Vault") & (
        df["facilitydetail"]
        .str.lower()
        .str.strip()
        .isin(["null", "", "detention", "conveyance"])
    )
    df.loc[q, "facility_type"] = (
        "dry_extended_detention"  # <- yes, these vaults map to edd
    )
    q = (df["facilitytype"] == "Vault") & (
        df["facilitydetail"].str.lower().str.strip().isin(["silva cell"])
    )
    df.loc[q, "facility_type"] = "bioretention_with_full_infiltration"

    # filterra/veg box
    df.loc[(df["facilitytype"] == "Vegetated Box"), "facility_type"] = "vegetated_box"
    q = (df["facilitytype"] == "Vegetated Box") & (
        df["facilitydetail"].str.lower().isin(["mws", "filterra"])
    )
    df.loc[q, "facility_type"] = "vegetated_box_hrbf"

    # Simple mappings
    q = df["facilitytype"] == "Oil Water Separator"
    df.loc[q, "facility_type"] = "oil_water_separator"
    q = df["facilitytype"] == "Swirl Separator"
    df.loc[q, "facility_type"] = "hydrodynamic_separator"
    df.loc[(df["facilitytype"] == "Swale"), "facility_type"] = "vegetated_swale"
    df.loc[(df["facilitytype"] == "Sand Filter"), "facility_type"] = "sand_filter"
    df.loc[(df["facilitytype"] == "Trench"), "facility_type"] = "infiltration"

    retains_full = ["RetentionFacility"]

    retains_partial = [
        "BioInfFacility",
        "RetAndTmntFacility",  # eg detention pond, fdc tank
        "FlowAndRetFacility",  # e.g., swale
    ]

    df = df.merge(
        ctx_df,
        left_on="facility_type",
        right_on="treatment_facility",
        how="left",
    ).assign(
        captured_pct=91.0,
        retained_pct=lambda df: numpy.where(
            df["validator"].isin(retains_partial),
            20.0,
            numpy.where(
                df["validator"].isin(retains_full),
                df["captured_pct"],
                0.0,
            ),
        ),
        facility_type=lambda df: numpy.where(
            df["facility_type"] != "no_treatment",
            df["facility_type"].astype(str) + "_simple",
            df["facility_type"],
        ),
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
            existing_altids = []  # noqa
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
