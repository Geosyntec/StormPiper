from stormpiper.models.tmnt_attr import TMNTFacilityAttrCreate, TMNTFacilityAttrUpdate

from ..schemas.tmnt import TMNTFacilityAttr
from .base import CRUDBase


class CRUDTMNTFacilityAttr(
    CRUDBase[TMNTFacilityAttr, TMNTFacilityAttrCreate, TMNTFacilityAttrUpdate]
):
    pass


tmnt_attr = CRUDTMNTFacilityAttr(TMNTFacilityAttr, id="altid")
