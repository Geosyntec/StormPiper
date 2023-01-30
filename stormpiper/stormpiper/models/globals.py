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
    updated_by: None | str = None


class GlobalSettingCreate(GlobalSettingUpdate):
    ...
