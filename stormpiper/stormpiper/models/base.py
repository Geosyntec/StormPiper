from enum import Enum

from pydantic import BaseModel as BASE, ConfigDict


class BaseModel(BASE):
    @classmethod
    def get_fields(cls, by_alias=False):
        return list(
            cls.model_json_schema(by_alias=by_alias).get("properties", {}).keys()
        )


class BaseORM(BaseModel):
    model_config = ConfigDict(from_attributes=True)


class StrEnum(str, Enum): ...
