import uuid

from sqlalchemy import Column, DateTime, String
from sqlalchemy.dialects.postgresql import JSONB

from ..hacks import GUID
from .base_class import Base, MutableTrackedTable


class Scenario(Base, MutableTrackedTable):
    """This table comes from...

    lifecycle is row-by-row and managed solely by ORM
    """

    __tablename__ = "scenario"

    # id must go to the client to track, edit, update the scenario
    id = Column(GUID, primary_key=True, default=uuid.uuid4)

    # name is not unique, user can set as they wish, sort rename etc.
    name = Column(String)

    # contains entire user submitted scenario blob. parts of this can change, so we
    # hash it's state to see what needs to be computed or recomputed to keep the
    # results in sync.
    # ref models.scenario.Scenario for contents
    input = Column(JSONB)
    # format:
    # ScenarioInput = {
    #   delineation_collection: DelineationFeatureCollection
    #   tmnt_facility_collection: StructuralFacilityFeatureCollection
    # }
    #
    input_time_updated = Column(DateTime(timezone=True))

    # upon changes to the delineation collection, recompute expensive ee loading calculation.
    loading_hash = Column(String)

    # upon result calculation completion, write the input_hash as hash(input json)
    input_hash = Column(String)

    # when triggering a results (re)calculation, check first if the hash(input json)
    # matches the input_hash.
    # when reading results, check first if the hash(input json)
    # matches the scenario_hash.
    # results = Column(JSONB)

    result_time_updated = Column(DateTime(timezone=True))

    lgu_boundary = Column(JSONB)
    lgu_load = Column(JSONB)
    delin_load = Column(JSONB)
    structural_tmnt = Column(JSONB)
    graph_edge = Column(JSONB)
    structural_tmnt_result = Column(JSONB)
