import asyncio
import platform
import sys

from stormpiper.core.config import settings
from stormpiper.email_helper.email import send_email_to_user


def warn_maintainers_of_errors(*, content: str | None = None) -> None:
    if content is None:
        content = "An ERROR with Tacoma Watersheds has occured."

    emails = settings.MAINTAINER_EMAIL_LIST[:1]
    email_dict_list = [{"Email": email} for email in emails]

    if platform.system() == "Windows":
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    asyncio.run(
        send_email_to_user(
            template="error_message",
            email_dict_list=email_dict_list,
            content=content,
        )
    )


if __name__ == "__main__":
    content = sys.argv[1]
    warn_maintainers_of_errors(content=content)
