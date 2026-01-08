import logging
from ipaddress import ip_address
from random import randint
from typing import Tuple

from ratelimit.auths import EmptyInformation
from ratelimit.types import Scope

from stormpiper.core.config import settings

logging.basicConfig(level=settings.LOGLEVEL)
logger = logging.getLogger(__name__)


async def client_ip(scope: Scope) -> Tuple[str, str]:
    """
    parse ip
    """

    ip = None
    group = "default"

    # get IP address
    if scope["client"]:
        ip, _ = tuple(scope["client"])
        if any(
            [s in str(ip) for s in ["testclient", "localhost"]]
            + [str(ip).startswith("172.") and str(ip).endswith(".1")]
        ):  # pragma: no branch
            ip = str(randint(1_000_000, 10_000_000 - 1))

        elif not ip_address(ip).is_global:
            raise EmptyInformation(scope)  # pragma: no cover

    else:  # pragma: no cover
        for name, value in scope["headers"]:
            if name == b"x-real-ip":
                ip = value.decode("utf8")

    if ip is None:
        raise EmptyInformation(scope)  # pragma: no cover

    # check if malicious traffic
    bad_keys = [
        ".php",
        "wp-admin",
        "wp-content",
        "wp-includes",
        "wp-user",
        ".env",
        "env.production",
    ]
    for k in bad_keys:  # pragma: no cover
        if k in scope["path"]:
            group = "malicious"
            logger.warning(
                f"  BLOCKED malicious IP: {ip}; REASON contains bad key: {k}"
            )
            break

    return ip, group
