import base64

import aiohttp

from stormpiper.core.config import settings


def build_reset_token_json(
    *,
    email,
    token,
    name=None,
):

    name = name or "Dear User"

    template = {
        "Messages": [
            {
                "From": {
                    "Email": "noreply@tacomawatersheds.com",
                    "Name": "Tacoma Watersheds Administrators",
                },
                "To": [{"Email": email, "Name": name}],
                "Subject": f"Password Reset Requested for Tacoma Watersheds",
                "TextPart": f"Hello {name}, Your reset token is:\n{token}",
                "HTMLPart": (
                    f"<p>Hello {name},</p>" f"<p>Your reset token is:<br>{token}</p>"
                ),
            }
        ]
    }

    return template


def build_verify_email_token_json(
    *,
    email,
    token,
    name=None,
):

    name = name or "Dear User"

    template = {
        "Messages": [
            {
                "From": {
                    "Email": "noreply@tacomawatersheds.com",
                    "Name": "Tacoma Watersheds Administrators",
                },
                "To": [{"Email": email, "Name": name}],
                "Subject": f"Email Verification Code for Tacoma Watersheds",
                "TextPart": f"Hello {name}, Your verification token is:\n{token}",
                "HTMLPart": (
                    f"<p>Hello {name},</p>"
                    f"<p>Your verification token is:<br>{token}</p>"
                ),
            }
        ]
    }

    return template


async def post(url, headers, json=None):
    async with aiohttp.ClientSession() as client:
        async with client.post(url, headers=headers, json=json) as resp:
            print(await resp.text())
            print(resp.status)


async def send_reset_password_token_to_user(*, email, token, name=None, client=None):

    url = settings.EMAIL_SEND_URL
    key_secret = f"{settings.EMAIL_API_KEY}:{settings.EMAIL_API_SECRET}"
    auth = base64.b64encode(key_secret.encode()).decode()
    headers = {"Authorization": f"Basic {auth}"}

    _json = build_reset_token_json(email=email, token=token, name=name)

    if client is None:
        await post(url, headers=headers, json=_json)
    else:
        async with client.post(url, headers=headers, json=_json) as resp:
            print(await resp.text())
            print(resp.status)


async def send_verify_email_token_to_user(*, email, token, name=None, client=None):

    url = settings.EMAIL_SEND_URL
    key_secret = f"{settings.EMAIL_API_KEY}:{settings.EMAIL_API_SECRET}"
    auth = base64.b64encode(key_secret.encode()).decode()
    headers = {"Authorization": f"Basic {auth}"}

    _json = build_verify_email_token_json(email=email, token=token, name=name)

    if client is None:
        await post(url, headers=headers, json=_json)
    else:
        async with client.post(url, headers=headers, json=_json) as resp:
            print(await resp.text())
            print(resp.status)
