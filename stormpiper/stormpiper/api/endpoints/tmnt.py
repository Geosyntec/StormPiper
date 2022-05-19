from typing import List, Optional

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel

from stormpiper.database.connection import get_async_session
from stormpiper.database.schemas import tmnt


router = APIRouter()


class TMNTResponse(BaseModel):
    # id:str
    node_id: str
    altid: str
    facilitytype: str
    # treatment_strategy: Optional[float]
    facility_type: Optional[float]
    # ref_data_key:Optional[str]
    design_storm_depth_inches: Optional[float]
    tributary_area_tc_min: Optional[float]
    total_volume_cuft: Optional[float]
    area_sqft: Optional[float]
    inf_rate_inhr: Optional[float]
    retention_volume_cuft: Optional[float]
    media_filtration_rate_inhr: Optional[float]
    hsg: Optional[str]
    minimum_retention_pct_override: Optional[float]
    treatment_rate_cfs: Optional[float]
    depth_ft: Optional[float]
    captured_pct: Optional[float]
    retained_pct: Optional[float]

    class Config:
        orm_mode = True


@router.get("/", response_model=List[TMNTResponse], name="tmnt:get_all_tmnt")
async def get_all_tmnt(db: AsyncSession = Depends(get_async_session)):

    result = await db.execute(select(tmnt.TMNT_View))
    scalars = result.scalars().all()

    return scalars


@router.get("/{altid}", response_model=TMNTResponse, name="tmnt:get_tmnt")
async def get_tmnt(altid: str, db: AsyncSession = Depends(get_async_session)):

    result = await db.execute(
        select(tmnt.TMNT_View).where(tmnt.TMNT_View.altid == altid)
    )

    return result.scalars().first()
