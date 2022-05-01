import base64
from functools import lru_cache

import ee

from stormpiper.core.config import settings


lru_cache()


def login():
    private_key_data = base64.b64decode(settings.EE_JSON_BASE64.encode("ascii"))
    credentials = ee.ServiceAccountCredentials(
        settings.EE_SERVICE_ACCOUNT, key_data=private_key_data
    )
    ee.Initialize(credentials)
