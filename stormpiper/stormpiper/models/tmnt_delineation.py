from .base import BaseModel


class TMNTFacilityDelineation(BaseModel):
    node_id: str
    altid: str

    class Config:
        orm_mode = True
