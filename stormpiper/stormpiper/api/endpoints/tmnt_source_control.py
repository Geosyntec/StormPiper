from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.exceptions import HTTPException
from sqlalchemy import select

from stormpiper.apps.supersafe.users import user_role_ge_editor, user_role_ge_reader
from stormpiper.database import crud
from stormpiper.database.schemas import tmnt
from stormpiper.models.tmnt_source_control import (
    TMNTSourceControl,
    TMNTSourceControlCreate,
    TMNTSourceControlPatch,
    TMNTSourceControlPost,
    TMNTSourceControlUpdate,
)

from ..depends import AsyncSessionDB, Editor

router = APIRouter(dependencies=[Depends(user_role_ge_reader)])


@router.get(
    "/{id}",
    response_model=TMNTSourceControl,
    name="tmnt_source_control:get_tmnt_source_control",
)
async def get_tmnt_source_control(
    id: int,
    db: AsyncSessionDB,
):
    attr = await crud.tmnt_source_control.get(db=db, id=id)

    if not attr:
        raise HTTPException(status_code=404, detail=f"Record not found for id={id}")

    return attr


@router.patch(
    "/{id}",
    response_model=TMNTSourceControl,
    name="tmnt_source_control:patch_tmnt_source_control",
)
async def patch_tmnt_source_control(
    *,
    db: AsyncSessionDB,
    user: Editor,
    id: int,
    tmnt_attr: TMNTSourceControlPatch,
):
    attr = await crud.tmnt_source_control.get(db=db, id=id)

    if not attr:  # pragma: no cover
        raise HTTPException(status_code=404, detail=f"Record not found for id={id}")

    new_obj = TMNTSourceControlUpdate(
        **tmnt_attr.dict(exclude_unset=True, exclude_none=True), updated_by=user.email
    )

    try:
        attr = await crud.tmnt_source_control.update(db=db, id=id, new_obj=new_obj)
    except Exception as e:  # pragma: no cover
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(e).replace("\n", " "),
        )

    return attr


@router.post(
    "/",
    response_model=TMNTSourceControl,
    name="tmnt_source_control:create_tmnt_source_control",
)
async def create_tmnt_source_control(
    *,
    db: AsyncSessionDB,
    user: Editor,
    tmnt_attr: TMNTSourceControlPost,
):
    new_obj = TMNTSourceControlCreate(
        **tmnt_attr.dict(exclude_unset=True, exclude_none=True), updated_by=user.email
    )

    try:
        attr = await crud.tmnt_source_control.create(db=db, new_obj=new_obj)
    except Exception as e:  # pragma: no cover
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(e).replace("\n", " "),
        )

    return attr


@router.delete(
    "/{id}",
    status_code=status.HTTP_204_NO_CONTENT,
    name="tmnt_source_control:delete_tmnt_source_control",
    dependencies=[Depends(user_role_ge_editor)],
)
async def delete_tmnt_source_control(
    db: AsyncSessionDB,
    id: int,
):
    try:
        attr = await crud.tmnt_source_control.remove(db=db, id=id)
    except Exception as e:  # pragma: no cover
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(e).replace("\n", " "),
        )

    return None


@router.get(
    "/",
    response_model=list[TMNTSourceControl],
    name="tmnt_source_control:get_all_tmnt_source_control",
)
async def get_all_tmnt_source_control(
    db: AsyncSessionDB,
    limit: int | None = Query(int(1e6)),
    offset: int = Query(0),
):
    result = await db.execute(
        select(tmnt.TMNTSourceControl).offset(offset).limit(limit)
    )
    scalars = result.scalars().all()

    return scalars
