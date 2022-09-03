import base64

import aiohttp

from stormpiper.core.config import settings

from . import email_templates


async def post(url, headers, json=None):
    async with aiohttp.ClientSession() as client:
        async with client.post(url, headers=headers, json=json) as resp:
            print(await resp.text())
            print(resp.status)


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
            print(await resp.text())
            print(resp.status)


# async def send_reset_password_token_to_user(
#     *, email, token, name=None, client=None, reset_url=""
# ):

#     url = settings.EMAIL_SEND_URL
#     key_secret = f"{settings.EMAIL_API_KEY}:{settings.EMAIL_API_SECRET}"
#     auth = base64.b64encode(key_secret.encode()).decode()
#     headers = {"Authorization": f"Basic {auth}"}

#     _json = build_reset_token_json(email=email, token=token, name=name, url=reset_url)

#     if client is None:
#         await post(url, headers=headers, json=_json)
#     else:
#         async with client.post(url, headers=headers, json=_json) as resp:
#             print(await resp.text())
#             print(resp.status)


# async def send_verify_email_token_to_user(
#     *, email, token, name=None, client=None, verify_url=""
# ):

#     url = settings.EMAIL_SEND_URL
#     key_secret = f"{settings.EMAIL_API_KEY}:{settings.EMAIL_API_SECRET}"
#     auth = base64.b64encode(key_secret.encode()).decode()
#     headers = {"Authorization": f"Basic {auth}"}

#     _json = build_verify_email_token_json(
#         email=email, token=token, name=name, url=verify_url
#     )

#     if client is None:
#         await post(url, headers=headers, json=_json)
#     else:
#         async with client.post(url, headers=headers, json=_json) as resp:
#             print(await resp.text())
#             print(resp.status)
