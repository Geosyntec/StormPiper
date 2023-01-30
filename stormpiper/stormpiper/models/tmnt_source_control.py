from stormpiper.database.schemas.tmnt import Direction

from .base import BaseModel, BaseORM


# Shared properties
class TMNTSourceControlBase(BaseModel):
    activity: None | str = None
    subbasin: None | str = None
    direction: None | Direction = None

    # if multiple for same subbasin, variable, and direction, will be applied in order
    # least to greatest default is last.
    order: None | int = None

    # this is the pollutant acted upon. entered as an upper case abbreviation.
    variable: None | str = None

    # must be float between 0.0 and 100.0
    percent_reduction: None | float = None


# Properties to recieve at the /post route handler
class TMNTSourceControlPost(TMNTSourceControlBase):
    ...


# Properties to receive at the /patch route handler
class TMNTSourceControlPatch(TMNTSourceControlBase):
    ...


# Properties to store in DB during update
class TMNTSourceControlUpdate(TMNTSourceControlPatch):
    updated_by: None | str = None


# Properties to store in DB during creation
class TMNTSourceControlCreate(TMNTSourceControlUpdate):
    ...


# Properties shared by models stored in DB
class TMNTSourceControlInDBBase(BaseORM, TMNTSourceControlBase):
    id: int


# Properties to return to client
class TMNTSourceControl(TMNTSourceControlInDBBase):
    ...
