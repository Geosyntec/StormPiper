import base64
import logging
import asyncio

import ee

from stormpiper.core.config import settings

logging.basicConfig(level=settings.LOGLEVEL)
logger = logging.getLogger(__name__)


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
    except Exception as e:
        logger.exception("Error logging in to earth engine", e, exc_info=True)
        return False

    return True


async def ee_continuous_login(sleep_seconds: int = 3600) -> None:
    logged_in = login()

    while logged_in:

        await asyncio.sleep(sleep_seconds)
        logger.info("logging in to earth engine again")
        logged_in = login()
