from ipaddress import ip_address
from random import randint
from typing import Tuple

from ratelimit.auths import EmptyInformation
from ratelimit.types import Scope


async def client_ip(scope: Scope) -> Tuple[str, str]:
    """
    parse ip
    """
    if scope["client"]:
        ip, _ = tuple(scope["client"])
        if any((s in str(ip) for s in ["testclient", "localhost"])):
            return str(randint(1_000_000, 10_000_000 - 1)), "default"

        if ip_address(ip).is_global:
            return ip, "default"

    else:  # pragma: no cover
        for name, value in scope["headers"]:
            if name == b"x-real-ip":
                ip = value.decode("utf8")
                return ip, "default"

    raise EmptyInformation(scope)  # pragma: no cover
