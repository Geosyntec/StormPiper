from sqlalchemy import Column, String

from .base_class import Base, MutableTrackedTable


class GlobalSetting(Base, MutableTrackedTable):
    """This table creates a set of user editable global settings"""

    __tablename__ = "global_setting"

    variable = Column(String, primary_key=True)
    value = Column(String)
