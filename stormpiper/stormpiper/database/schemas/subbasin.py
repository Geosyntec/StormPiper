from geoalchemy2 import Geometry
from sqlalchemy import Column, Float, Integer, String, Table

from stormpiper.core.config import settings

from .base_class import Base


class Subbasin(Base):
    """This table comes directly from the Tacoma GIS team.

    The node_id column is computed at the time of insertion.
    """

    __tablename__ = "subbasin"

    id = Column(Integer, primary_key=True)
    basinname = Column(String)
    subbasin = Column(String)
    area_acres = Column(Float)

    lu_resair_pct = Column(Float)
    lu_commcmu_pct = Column(Float)
    lu_rgcd_pct = Column(Float)
    lu_com_pct = Column(Float)
    lu_indh_pct = Column(Float)
    lu_indl_pct = Column(Float)
    lu_resl_pct = Column(Float)
    lu_ins_pct = Column(Float)
    lu_resm_pct = Column(Float)
    lu_resmfhd_pct = Column(Float)
    lu_comn_pct = Column(Float)
    lu_comnmu_pct = Column(Float)
    lu_os_pct = Column(Float)
    lu_shore_pct = Column(Float)
    lu_rgctm_pct = Column(Float)
    lc_pasture_pct = Column(Float)
    lc_grass_pct = Column(Float)
    lc_water_pct = Column(Float)
    lc_imp_roof_pct = Column(Float)
    lc_imp_nonroof_pct = Column(Float)
    lc_imp_total_pct = Column(Float)
    age_of_development_score = Column(Float)
    pavement_condition_score = Column(Float)
    biodiversity_pct = Column(Float)
    urban_heat_degc = Column(Float)
    discharge_points_count = Column(Float)
    access = Column(Float)
    economic_value = Column(Float)
    environmental_value = Column(Float)
    livability_value = Column(Float)
    opportunity_value = Column(Float)

    geom = Column(Geometry(srid=settings.TACOMA_EPSG))


load_cols = [
    "runoff_volume_cuft",
    "TCu_load_lbs",
    "TN_load_lbs",
    "TP_load_lbs",
    "TSS_load_lbs",
    "TZn_load_lbs",
    "PHE_load_lbs",
    "PYR_load_lbs",
    "DEHP_load_lbs",
]

_result_cols = [
    n + suffix for n in load_cols for suffix in ["", "_generated", "_reduced"]
] + [n.replace("_lbs", "_pct").replace("_cuft", "_pct") + "_reduced" for n in load_cols]


class SubbasinResult(Base):
    __table__ = Table(
        "subbasin_result",
        Base.metadata,
        *[
            Column("id", Integer, primary_key=True),
            Column("subbasin", String),
            Column("node_id", String),
            Column("epoch", String),
        ],
        *[Column(n, Float) for n in _result_cols],
    )
