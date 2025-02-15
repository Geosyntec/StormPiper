from stormpiper.models.tmnt_source_control import (
    TMNTSourceControlCreate,
    TMNTSourceControlUpdate,
)

from ..schemas.tmnt import TMNTSourceControl
from .base import CRUDBase


class CRUDTMNTSourceControl(
    CRUDBase[TMNTSourceControl, TMNTSourceControlCreate, TMNTSourceControlUpdate]
): ...


tmnt_source_control = CRUDTMNTSourceControl(TMNTSourceControl)
