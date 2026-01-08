import asyncio
import logging
import platform

import redis
from tenacity import retry
from tenacity.after import after_log
from tenacity.before import before_log
from tenacity.stop import stop_after_attempt
from tenacity.wait import wait_fixed

from stormpiper.core.config import settings

wait_seconds = 2
try_for_minutes = 5
max_tries = int(60 / wait_seconds * try_for_minutes)


logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

redis_conn = redis.Redis.from_url(settings.REDIS_BROKER_URL)


@retry(
    stop=stop_after_attempt(max_tries),
    wait=wait_fixed(wait_seconds),
    before=before_log(logger, logging.INFO),
    after=after_log(logger, logging.WARN),
)
def get_background_worker_connection():  # pragma: no cover
    import stormpiper.bg_worker as bg

    try:
        bg.ping.apply_async().get(timeout=0.2)  # type: ignore
    except Exception as e:
        logger.error(e)
        raise e


@retry(
    stop=stop_after_attempt(max_tries),
    wait=wait_fixed(wait_seconds),
    before=before_log(logger, logging.INFO),
    after=after_log(logger, logging.WARN),
)
def get_redis_connection():  # pragma: no cover
    try:
        assert redis_conn.ping()
    except Exception as e:
        logger.error(e)
        raise e


def get_database_connection():
    from stormpiper.database.connection import reconnect_engine

    reconnect_engine()


def create_initial_users() -> None:
    from stormpiper.apps.supersafe import init_users

    logger.info("Creating initial users")

    if platform.system() == "Windows":
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())  # type: ignore
    asyncio.run(init_users.create_admin())

    logger.info("Initial data created")


def create_default_cost_globals(engine):
    from stormpiper.core.config import default_global_cost_settings
    from stormpiper.database.connection import get_session
    from stormpiper.database.schemas.globals import GlobalCostSetting

    Session = get_session(engine)

    with Session.begin() as session:  # type: ignore
        batch = []
        for dct in default_global_cost_settings:
            variable = dct["variable"]
            s = (
                session.query(GlobalCostSetting)
                .filter(GlobalCostSetting.variable == variable)
                .first()
            )
            if s is None:
                dct["updated_by"] = "system_default"
                batch.append(GlobalCostSetting(**dct))
        session.add_all(batch)


def build_views():
    from stormpiper.database.connection import engine
    from stormpiper.database.schemas.views import initialize_views

    initialize_views(engine)
