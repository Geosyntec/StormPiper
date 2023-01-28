from typing import Optional

from .base import BaseModel, BaseORM


class GlobalSettingPatch(BaseModel):
    value: str


class GlobalSettingBase(BaseModel):
    variable: str
    value: str


class GlobalSettingResponse(BaseORM, GlobalSettingBase):
    ...


class GlobalSettingPost(GlobalSettingBase):
    ...


class GlobalSettingUpdate(GlobalSettingBase):
    updated_by: Optional[str] = None


class GlobalSettingCreate(GlobalSettingBase):
    updated_by: Optional[str] = None
