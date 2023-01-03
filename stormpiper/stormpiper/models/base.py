from pydantic import BaseModel as BASE


class BaseModel(BASE):
    @classmethod
    def get_fields(cls, by_alias=False):
        return list(cls.schema(by_alias=by_alias).get("properties", {}).keys())

class BaseORM(BaseModel):
    class Config:
        orm_mode = True
