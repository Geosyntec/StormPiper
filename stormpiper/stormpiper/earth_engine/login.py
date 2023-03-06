import asyncio
import base64
import logging

from starlette.concurrency import run_in_threadpool
from tenacity import retry
from tenacity.after import after_log
from tenacity.before import before_log
from tenacity.stop import stop_after_attempt
from tenacity.wait import wait_fixed

from stormpiper.core.config import settings

from . import ee

logging.basicConfig(level=settings.LOGLEVEL)
logger = logging.getLogger(__name__)


@retry(
    stop=stop_after_attempt(60 * 5),  # 10 mins
    wait=wait_fixed(2),  # 2 seconds
    before=before_log(logger, logging.INFO),
    after=after_log(logger, logging.WARN),
)
async def async_login(**kwargs):
    logger.debug("Calling async_login...")
    email = kwargs.pop("email", settings.EE_SERVICE_ACCOUNT)
    key_file = kwargs.pop("key_file", None)
    key_data = kwargs.pop(
        "key_data", base64.b64decode(settings.EE_JSON_BASE64.encode("ascii"))
    )
    try:
        credentials = ee.ServiceAccountCredentials(
            email=email, key_file=key_file, key_data=key_data
        )
        # the ee library has set incorrect type hints/constraints on the ee.Initialize function.
        logger.info("initializing ee with async_login attempt")

        await run_in_threadpool(
            ee.Initialize,
            credentials=credentials,  # type: ignore
            opt_url="https://earthengine-highvolume.googleapis.com",
        )
        logger.info("Login to earth engine succeeded.")
        return True

    except Exception as e:
        logger.exception("Error logging in to earth engine", e, exc_info=True)
        raise e


@retry(
    stop=stop_after_attempt(60 * 5),  # 10 mins
    wait=wait_fixed(2),  # 2 seconds
    before=before_log(logger, logging.INFO),
    after=after_log(logger, logging.WARN),
)
def login(**kwargs):
    logger.debug("Calling login...")
    email = kwargs.pop("email", settings.EE_SERVICE_ACCOUNT)
    key_file = kwargs.pop("key_file", None)
    key_data = kwargs.pop(
        "key_data", base64.b64decode(settings.EE_JSON_BASE64.encode("ascii"))
    )
    try:
        credentials = ee.ServiceAccountCredentials(
            email=email, key_file=key_file, key_data=key_data
        )
        # the ee library has set incorrect type hints/constraints on the ee.Initialize function.
        ee.Initialize(credentials)  # type: ignore
        logger.info("Login to earth engine succeeded.")
        return True

    except Exception as e:
        logger.exception("Error logging in to earth engine", e, exc_info=True)
        raise e


async def ee_continuous_login(sleep_seconds: int = 3600) -> None:
    logger.debug("Calling ee_continuous_login...")
    logged_in = await async_login()

    while logged_in:
        await asyncio.sleep(sleep_seconds)
        logger.info("logging in to earth engine again")
        logged_in = await async_login()
