import asyncio
import base64
import logging

import ee
from tenacity import after_log  # type: ignore
from tenacity import before_log  # type: ignore
from tenacity import stop_after_attempt  # type: ignore
from tenacity import wait_fixed  # type: ignore
from tenacity import retry

from stormpiper.core.config import settings

logging.basicConfig(level=settings.LOGLEVEL)
logger = logging.getLogger(__name__)


@retry(
    stop=stop_after_attempt(60 * 5),  # 10 mins
    wait=wait_fixed(2),  # 2 seconds
    before=before_log(logger, logging.INFO),
    after=after_log(logger, logging.WARN),
)
def login(**kwargs):
    email = kwargs.pop("email", settings.EE_SERVICE_ACCOUNT)
    key_file = kwargs.pop("key_file", None)
    key_data = kwargs.pop(
        "key_data", base64.b64decode(settings.EE_JSON_BASE64.encode("ascii"))
    )
    try:
        credentials = ee.ServiceAccountCredentials(
            email=email, key_file=key_file, key_data=key_data
        )
        ee.Initialize(credentials)
        logger.info("Login to earth engine succeeded.")
        return True
    except Exception as e:
        logger.exception("Error logging in to earth engine", e, exc_info=True)
        raise e


async def ee_continuous_login(sleep_seconds: int = 3600) -> None:
    logged_in = login()

    while logged_in:

        await asyncio.sleep(sleep_seconds)
        logger.info("logging in to earth engine again")
        logged_in = login()
