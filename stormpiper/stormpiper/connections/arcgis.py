import asyncio
import base64
import logging

import geopandas
import pandas
import requests

from stormpiper.core.config import external_resources, settings
from stormpiper.email_helper import email

logging.basicConfig(level=settings.LOGLEVEL)
logger = logging.getLogger(__name__)


def get_features(url: str | bytes) -> list:
    response = requests.get(url)
    js = response.json()

    features = js.get("features", None)
    return [] if features is None else features


def _get_tmnt_facility_type_codes(*, url: str | bytes | None = None) -> dict[str, str]:
    if url is None:  # pragma: no branch
        url = external_resources.get("tmnt_facility_codes", {}).get("url", "")
    r = requests.get(url)
    data = r.json()

    field_info = next(
        filter(lambda f: f["name"].lower() == "facilitytype", data["fields"])
    )

    codes = field_info["domain"]["codedValues"]
    code_lu = {d["code"]: d["name"] for d in codes}

    return code_lu


def _get_tmnt_facilities(*, url: str | bytes | None = None) -> geopandas.GeoDataFrame:
    if url is None:  # pragma: no branch
        url = external_resources.get("tmnt_facilities", {}).get("url", "")

    features = get_features(url=url)
    gdf = geopandas.GeoDataFrame.from_features(features=features, crs=4326)

    return gdf


def facility_node_id(altid: str) -> str:
    return altid


def warn_maintainers_of_duplicates(
    *, df: pandas.DataFrame, bmp_url: str
) -> None:  # pragma: no cover
    duplicate_altids = df
    b64_content = base64.b64encode(duplicate_altids.to_json().encode()).decode()
    content = (
        "ERROR: Duplicate altids detected."
        + f"Resource URL: {bmp_url}"
        + "\n\n"
        + "\n".join(duplicate_altids["altid"].tolist())
    )
    attachments = [
        {
            "ContentType": "text/plain",
            "Filename": "duplicate_altids.geojson",
            "Base64Content": b64_content,
        }
    ]

    emails = settings.MAINTAINER_EMAIL_LIST[:1]
    email_dict_list = [{"Email": _email} for _email in emails]

    asyncio.ensure_future(
        email.send_email_to_user(
            template="error_message",
            email_dict_list=email_dict_list,
            content=content,
            attachments=attachments,
        )
    )


def get_tmnt_facilities(
    *,
    bmp_url: str | None = None,
    codes_url: str | bytes | None = None,
    cols: list[str] | None = None,
    with_warning: bool = True,
):
    if cols is None:  # pragma: no branch
        cols = external_resources["tmnt_facilities"]["columns"]

    # FYI
    _ = [
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
        raw_gdf.to_crs(settings.TACOMA_EPSG)
        .replace({"FACILITYTYPE": code_lu})  # type: ignore
        .reindex(columns=cols)
        .rename(columns=lambda c: c.lower())
        .assign(node_id=lambda df: df["altid"].apply(facility_node_id))
        .replace({"None": None, "NA": None})
        # ref: database.schemas.tmnt
    )

    duplicate_altids = gdf.loc[gdf["altid"].duplicated()]

    if len(duplicate_altids) > 0 and with_warning:  # pragma: no cover
        # send email to maintainers
        warn_maintainers_of_duplicates(df=duplicate_altids, bmp_url=bmp_url or "")

    return gdf.drop_duplicates()


def delineation_node_id(relid, altid):
    """altid is the id of the delineation, relid is the altid of the related bmp"""

    return f"ls_{relid}_{altid}"


def get_tmnt_facility_delineations(*, url=None):
    if url is None:  # pragma: no branch
        url = external_resources["tmnt_facility_delineations"]["url"]

    features = get_features(url=url)

    delineations = (
        geopandas.GeoDataFrame.from_features(features=features, crs=4326)
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
    if url is None:  # pragma: no branch
        url = external_resources["subbasins"]["url"]
    if cols is None:  # pragma: no branch
        cols = external_resources["subbasins"]["columns"]

    features = get_features(url)

    subbasins = (
        geopandas.GeoDataFrame.from_features(features=features, crs=4326, columns=cols)
        .to_crs(settings.TACOMA_EPSG)
        .rename(columns=lambda c: c.lower())
        .loc[lambda df: ~df.geometry.is_empty]
        .drop_duplicates()
        .assign(area_acres=lambda df: df.geometry.area / 43560)
    )

    return subbasins


def get_equity_index_deprecated(*, url=None, cols=None):  # pragma: no cover
    if url is None:  # pragma: no branch
        url = external_resources["equity_index"]["url"]
    if cols is None:  # pragma: no branch
        cols = external_resources["equity_index"]["columns"]

    features = get_features(url)

    equity_index = (
        geopandas.GeoDataFrame.from_features(features=features, crs=4326, columns=cols)
        .to_crs(settings.TACOMA_EPSG)
        .rename(columns=lambda c: c.lower())
        .loc[lambda df: ~df.geometry.is_empty]
        .drop_duplicates()
    )

    return equity_index


def get_subbasins_with_equity_ix_deprecated(
    *, url=None, cols=None, equity_ix_url=None, equity_ix_cols=None
):  # pragma: no cover
    subbasins_raw = get_subbasins(url=url, cols=cols)
    equity_index = get_equity_index_deprecated(url=equity_ix_url, cols=equity_ix_cols)

    equity_index_cols = [c for c in equity_index.columns if "geometry" != c.lower()]

    subbasins_eq_ix = geopandas.overlay(
        subbasins_raw,
        equity_index.assign(equity_ix_area_sqft=lambda df: df.geometry.area),
        how="intersection",
        keep_geom_type=True,
        make_valid=True,
    ).assign(ratio=lambda df: df.geometry.area / df["equity_ix_area_sqft"])

    subbasins_eq_ix[equity_index_cols] = subbasins_eq_ix[equity_index_cols].multiply(
        subbasins_eq_ix["ratio"], axis=0
    )

    # sum over census blocks
    sub_weighted_avg = subbasins_eq_ix.groupby(["subbasin"])[equity_index_cols].sum()
    subbasins = subbasins_raw.merge(sub_weighted_avg, on="subbasin", how="left")

    return subbasins


def get_subbasin_metrics(*, url=None):
    if url is None:  # pragma: no branch
        url = external_resources["subbasin_metrics"]["url"]

    features = [f.get("attributes", {}) for f in get_features(url)]
    df = (
        pandas.DataFrame(features)
        .rename(columns=lambda c: c.lower())
        .drop(columns=["object", "id", "objectid"], errors="ignore")
    )

    lu_cols = [c for c in df.columns if c.startswith("lu_")]
    check_lu = df.set_index("subbasin")[lu_cols].assign(
        check_sum=lambda df: df.sum(axis=1)
    )
    if check_lu["check_sum"].mean() <= 1.1:  # if fraction rather than pct
        df.loc[:, lu_cols] *= 100

    check_lc = df.set_index("subbasin")[
        [c for c in df.columns if c.startswith("lc_") and not c.endswith("total_pct")]
    ].assign(check_sum=lambda df: df.sum(axis=1))
    if check_lc["check_sum"].mean() <= 1.1:  # if fraction rather than pct
        df.loc[:, [c for c in df.columns if c.startswith("lc_")]] *= 100

    return df


def get_subbasins_with_metrics(*, url=None, cols=None, subbasin_metrics_url=None):
    subbasins_raw = get_subbasins(url=url, cols=cols)
    subbasin_metrics = get_subbasin_metrics(url=subbasin_metrics_url)
    subbasins = subbasins_raw.merge(subbasin_metrics, on="subbasin", how="left")

    return subbasins
