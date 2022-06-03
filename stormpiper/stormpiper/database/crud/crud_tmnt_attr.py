from .base import CRUDBase
from ..schemas.tmnt import TMNTFacilityAttr
from stormpiper.models.tmnt_attr import TMNTFacilityAttrCreate, TMNTFacilityAttrUpdate


class CRUDTMNTFacilityAttr(
    CRUDBase[TMNTFacilityAttr, TMNTFacilityAttrCreate, TMNTFacilityAttrUpdate]
):
    pass


tmnt_attr = CRUDTMNTFacilityAttr(TMNTFacilityAttr, id='altid')
