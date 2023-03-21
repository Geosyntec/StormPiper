import aiohttp
import pytest

from stormpiper.email_helper.email import send_email_to_user


async def email_clients():
    yield None
    async with aiohttp.ClientSession() as client:
        yield client


@pytest.mark.asyncio
@pytest.mark.parametrize(
    "template", ["reset_password", "request_verify", "welcome_verify", "error_message"]
)
async def test_send_email(template):
    async for email_client in email_clients():
        await send_email_to_user(
            template=template,
            client=email_client,
            email="existing_user@example.com",
            token="token",
            content="",
            email_dict_list=[{"email": "existing_user@example.com"}],
        )
