from fastapi import APIRouter, Depends

from fastapi.exceptions import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from stormpiper.database.connection import get_async_session
from stormpiper.models.tmnt_attr import TMNTFacilityAttr, TMNTFacilityAttrUpdate
from stormpiper.database import crud
from stormpiper.apps import supersafe as ss


router = APIRouter()

@router.get(
    "/{altid}",
    response_model=TMNTFacilityAttr,
    name="tmnt_facility_attr:get_tmnt_attr",
)
async def get_tmnt_attr(
    altid: str,
    db: AsyncSession = Depends(get_async_session),
):
    attr = await crud.tmnt_attr.get(db=db, id=altid)

    if not attr:
        raise HTTPException(
            status_code=404, detail=f"Record not found for altid={altid}"
        )

    return attr


@router.patch(
    "/{altid}",
    response_model=TMNTFacilityAttr,
    name="tmnt_facility_attr:patch_tmnt_attr",
)
async def patch_tmnt_attr(
    *,
    altid: str,
    attr_in: TMNTFacilityAttrUpdate,
    db: AsyncSession = Depends(get_async_session),
    user: ss.users.User = Depends(ss.users.current_active_user),
):
    attr = await crud.tmnt_attr.get(db=db, id=altid)

    if not attr:
        raise HTTPException(
            status_code=404, detail=f"Record not found for altid={altid}"
        )

    attr_in.updated_by = user.email

    attr = await crud.tmnt_attr.update(db=db, id=altid, new_obj=attr_in)

    return attr
