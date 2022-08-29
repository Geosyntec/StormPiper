import base64

import aiohttp

from stormpiper.core.config import settings


def build_reset_token_json(*, email, token, name=None, url=""):

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
                "TextPart": f"Hello {name}, Your reset token is:\n{token}\n\nYour reset link is:\n{url}",
                "HTMLPart": f"""
                    <p>Hello {name},</p>
                    <p>Your reset token is: </p>
                    <p>{token}</p>
                    <p>Your reset link is: </p>
                    <p>{url}</p>
                    """,
            }
        ]
    }

    return template


def build_verify_email_token_json(*, email, token, name=None, url=""):

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
                "TextPart": f"Hello {name}, Your verification token is:\n{token}\n\nYour verification link is:\n{url}",
                "HTMLPart": f"""
                    <p>Hello {name},</p>
                    <p>Your verification token is: </p>
                    <p>{token}</p>
                    <p>Your verification link is: </p>
                    <p>{url}</p>
                    """,
            }
        ]
    }

    return template


async def post(url, headers, json=None):
    async with aiohttp.ClientSession() as client:
        async with client.post(url, headers=headers, json=json) as resp:
            print(await resp.text())
            print(resp.status)


async def send_reset_password_token_to_user(
    *, email, token, name=None, client=None, reset_url=""
):

    url = settings.EMAIL_SEND_URL
    key_secret = f"{settings.EMAIL_API_KEY}:{settings.EMAIL_API_SECRET}"
    auth = base64.b64encode(key_secret.encode()).decode()
    headers = {"Authorization": f"Basic {auth}"}

    _json = build_reset_token_json(email=email, token=token, name=name, url=reset_url)

    if client is None:
        await post(url, headers=headers, json=_json)
    else:
        async with client.post(url, headers=headers, json=_json) as resp:
            print(await resp.text())
            print(resp.status)


async def send_verify_email_token_to_user(
    *, email, token, name=None, client=None, verify_url=""
):

    url = settings.EMAIL_SEND_URL
    key_secret = f"{settings.EMAIL_API_KEY}:{settings.EMAIL_API_SECRET}"
    auth = base64.b64encode(key_secret.encode()).decode()
    headers = {"Authorization": f"Basic {auth}"}

    _json = build_verify_email_token_json(
        email=email, token=token, name=name, url=verify_url
    )

    if client is None:
        await post(url, headers=headers, json=_json)
    else:
        async with client.post(url, headers=headers, json=_json) as resp:
            print(await resp.text())
            print(resp.status)
