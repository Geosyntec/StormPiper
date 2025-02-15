from stormpiper.models.globals import GlobalSettingCreate, GlobalSettingUpdate

from ..schemas.globals import GlobalCostSetting, GlobalSetting
from .base import CRUDBase


class CRUDGlobalSetting(
    CRUDBase[GlobalSetting, GlobalSettingCreate, GlobalSettingUpdate]
): ...


class CRUDGlobalCostSetting(
    CRUDBase[GlobalCostSetting, GlobalSettingCreate, GlobalSettingUpdate]
):
    async def create(self, *args, **kwargs) -> None:  # pragma: no cover
        raise NotImplementedError(
            "Global cost settings cannot be created by the user, only edited."
        )

    async def remove(self, *args, **kwargs) -> None:  # pragma: no cover
        raise NotImplementedError(
            "Global cost settings cannot be removed by the user, only edited."
        )


global_setting = CRUDGlobalSetting(GlobalSetting, id="variable")
global_cost_setting = CRUDGlobalCostSetting(GlobalCostSetting, id="variable")
