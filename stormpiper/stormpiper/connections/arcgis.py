import logging

import requests
import geopandas

from stormpiper.core.config import external_resources, settings, stormpiper_path

logging.basicConfig(level=settings.LOGLEVEL)
logger = logging.getLogger(__name__)


def _get_tmnt_facility_type_codes(*, url=None):
    if url is None:
        url = external_resources["tmnt_facility_codes"]["url"]
    params = {"f": "json", "layers": [1]}
    r = requests.get(url, params)
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
        .assign(node_id=lambda df: df["altid"])
        # ref: database.schemas.tmnt
    )

    return gdf


def get_tmnt_facility_delineations(*, url=None):

    if url is None:
        url = external_resources["tmnt_facility_delineations"]["url"]

        # todo:
        url = stormpiper_path / "data" / "geojson" / "facility_sheds_wALTID.geojson"

    delineations = (
        geopandas.read_file(url)
        .to_crs(2927)
        .reset_index(drop=True)
        .rename(columns=lambda c: c.lower())
        .rename(columns={"treatment_facility_altid": "altid"})
        .assign(id=lambda df: df.index)
        .assign(node_id=lambda df: "ls_" + df["altid"] + "_" + df.index.astype(str))
        .reindex(columns=["altid", "node_id", "geometry"])  # ref: database.schemas.tmnt
    )

    return delineations.loc[~delineations.geometry.is_empty]
