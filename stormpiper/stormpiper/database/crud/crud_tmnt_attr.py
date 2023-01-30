from typing import Any

from sqlalchemy.ext.asyncio import AsyncSession

from stormpiper.models.tmnt_attr import TMNTFacilityAttrCreate, TMNTFacilityAttrUpdate
from stormpiper.models.tmnt_cost import TMNTFacilityCostCreate, TMNTFacilityCostUpdate

from ..schemas.tmnt import TMNTFacilityAttr
from ..schemas.tmnt_cost import TMNTFacilityCost
from .base import CRUDBase


class CRUDTMNTFacilityAttr(
    CRUDBase[TMNTFacilityAttr, TMNTFacilityAttrCreate, TMNTFacilityAttrUpdate]
):
    ...


class CRUDTMNTFacilityCost(
    CRUDBase[TMNTFacilityCost, TMNTFacilityCostCreate, TMNTFacilityCostUpdate]
):
    async def upsert(
        self,
        db: AsyncSession,
        *,
        id: Any,
        new_obj: TMNTFacilityCostUpdate | dict[str, Any],
    ) -> TMNTFacilityCost:

        if isinstance(new_obj, dict):
            update_data = new_obj
        else:
            update_data = new_obj.dict(exclude_unset=True)

        obj = await self.get(db=db, id=id)

        if obj is None:
            update_data["node_id"] = id
            return await self.create(
                db=db, new_obj=TMNTFacilityCostCreate(**update_data)
            )
        return await self.update(db=db, id=id, new_obj=new_obj)


tmnt_attr = CRUDTMNTFacilityAttr(TMNTFacilityAttr, id="altid")

tmnt_cost = CRUDTMNTFacilityCost(TMNTFacilityCost, id="node_id")
