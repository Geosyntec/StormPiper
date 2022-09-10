import logging

import geopandas
import requests

from stormpiper.core.config import external_resources, settings, stormpiper_path

logging.basicConfig(level=settings.LOGLEVEL)
logger = logging.getLogger(__name__)


def _get_tmnt_facility_type_codes(*, url=None):
    if url is None:
        url = external_resources["tmnt_facility_codes"]["url"]
    r = requests.get(url)
    data = r.json()

    field_info = next(
        filter(lambda f: f["name"].lower() == "facilitytype", data["fields"])
    )

    codes = field_info["domain"]["codedValues"]
    code_lu = {d["code"]: d["name"] for d in codes}

    return code_lu


def _get_tmnt_facilities(*, url=None):
    if url is None:
        url = external_resources["tmnt_facilities"]["url"]

    return geopandas.read_file(url)


def facility_node_id(altid):
    return altid


def get_tmnt_facilities(*, bmp_url=None, codes_url=None, cols=None):

    if cols is None:
        cols = external_resources["tmnt_facilities"]["columns"]

    # FYI
    [
        # 'ACCESSISSUE', 'ACTIVEFLAG',
        "ALTID",
        # 'CANISTERS',
        "COMMONNAME",
        #    'DECOMMISSIONDATE', 'DECOMMISSIONWO',
        "FACILITYDETAIL",
        #    'FACILITYID',
        "FACILITYTYPE",
        "FLOWCONTROL",
        "INFILTRATED",
        #    'INSTALLDATE',
        #    'INSTALLEDIN', 'INSTALLWO', 'LASTUPDATE', 'LOCATIONACC', 'LOCDESC',
        #    'MANUFACTURER', 'MEDIATYPE', 'MR5', 'OBJECTID', 'OWNEDBY', 'RIMELEV',
        #    'RIMELEVACC', 'SIZE', 'SUBBASIN', 'SUMPELEV', 'SUMPELEVACC',
        "WATERQUALITY",
        #    'COMMENTS', 'ENABLED', 'ANCILLARYROLE', 'CREATEDDATE',
        #    'GlobalID', 'GlobalID_FME',
        "FLOWCONTROLTYPE",
        "WATERQUALITYTYPE",
        #    'PERMITREQUIRED', 'OUTFALLID', 'CONFIRMED_OWNER',
        "geometry",
    ]

    raw_gdf = _get_tmnt_facilities(url=bmp_url)
    code_lu = _get_tmnt_facility_type_codes(url=codes_url)

    gdf = (
        raw_gdf.replace({"FACILITYTYPE": code_lu})
        .reindex(columns=cols)
        .rename(columns=lambda c: c.lower())
        .assign(node_id=lambda df: df["altid"].apply(facility_node_id))
        .replace({"None": None, "NA": None})
        .drop_duplicates()
        # ref: database.schemas.tmnt
    )

    return gdf


def delineation_node_id(relid, altid):
    """altid is the id of the delineation, relid is the altid of the related bmp"""

    return f"ls_{relid}_{altid}"


def get_tmnt_facility_delineations(*, url=None):

    if url is None:
        url = external_resources["tmnt_facility_delineations"]["url"]

    delineations = (
        geopandas.read_file(url)
        .to_crs(settings.TACOMA_EPSG)
        .reset_index(drop=True)
        .rename(columns=lambda c: c.lower())
        .assign(relid=lambda df: df.rel_id)
        .dropna(subset="relid")
        .assign(
            node_id=lambda df: df.apply(
                lambda r: delineation_node_id(r.relid, r.altid), axis=1
            )
        )
        .reindex(
            columns=["node_id", "altid", "relid", "geometry"]
        )  # ref: database.schemas.tmnt
        .loc[lambda df: ~df.geometry.is_empty]
        .drop_duplicates()
    )

    return delineations


def get_subbasins(*, url=None, cols=None):
    if url is None:
        url = external_resources["subbasins"]["url"]
    if cols is None:
        cols = external_resources["subbasins"]["columns"]

    subbasins = (
        geopandas.read_file(url)
        .reindex(columns=cols)
        .rename(columns=lambda c: c.lower())
        .loc[lambda df: ~df.geometry.is_empty]
        .drop_duplicates()
    )

    return subbasins
