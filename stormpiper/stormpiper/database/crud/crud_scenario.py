import logging

from sqlalchemy.ext.asyncio import AsyncSession

from stormpiper.core.config import settings
from stormpiper.models.scenario import ScenarioCreate, ScenarioUpdate

from ..schemas.scenario import Scenario
from .base import CRUDBase

logging.basicConfig(level=settings.LOGLEVEL)
logger = logging.getLogger(__name__)


class CRUDScenario(CRUDBase[Scenario, ScenarioCreate, ScenarioUpdate]):
    async def on_after_create(self, *, db: AsyncSession, obj: Scenario) -> None:
        logger.info(f"created new scenario with id: {getattr(obj, self.id)}")
        return None

    async def on_after_update(self, *, db: AsyncSession, obj: Scenario) -> None:
        logger.info(f"updated new scenario with id: {getattr(obj, self.id)}")
        # dct = orm_to_dict(obj)
        # logger.info(
        #     f"updated scenario values: {json.dumps(dct, indent=2, default=str)}"
        # )

        return None


scenario = CRUDScenario(Scenario)
