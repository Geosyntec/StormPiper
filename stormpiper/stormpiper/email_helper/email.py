import base64
import logging

import aiohttp

from stormpiper.core.config import settings

from . import email_templates

logging.basicConfig(level=settings.LOGLEVEL)
logger = logging.getLogger(__name__)


async def post(url, headers, json=None):
    async with aiohttp.ClientSession() as client:
        async with client.post(url, headers=headers, json=json) as resp:
            txt = await resp.text()
            log = logger.warning if resp.status > 200 else logger.info
            log(f"response status: {resp.status} text: {txt}")


async def send_email_to_user(*, template: str, client=None, **template_kwargs):
    url = settings.EMAIL_SEND_URL
    key_secret = f"{settings.EMAIL_API_KEY}:{settings.EMAIL_API_SECRET}"
    auth = base64.b64encode(key_secret.encode()).decode()
    headers = {"Authorization": f"Basic {auth}"}

    template_builder = getattr(email_templates, template)

    _json = template_builder(**template_kwargs)

    if client is None:
        await post(url, headers=headers, json=_json)
    else:
        async with client.post(url, headers=headers, json=_json) as resp:
            txt = await resp.text()
            log = logger.warning if resp.status > 200 else logger.info
            log(f"response status: {resp.status} text: {txt}")
