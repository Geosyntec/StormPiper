from stormpiper.models.globals import GlobalSettingCreate, GlobalSettingUpdate

from ..schemas.globals import GlobalSetting
from .base import CRUDBase


class CRUDGlobalSetting(
    CRUDBase[GlobalSetting, GlobalSettingCreate, GlobalSettingUpdate]
):
    ...


global_setting = CRUDGlobalSetting(GlobalSetting, id="variable")
