from ..config import Config
from .base import BaseBackend
from .redis import RedisBackend

_backend: BaseBackend | None = None


def get_backend(config: Config) -> BaseBackend:
    """
    Get the celery-singleton backend.
    The backend instance is cached for subsequent calls.

    :param app: celery instance
    :type app: celery.Celery
    """
    global _backend
    if _backend:
        return _backend
    klass = config.backend_class
    kwargs = config.backend_kwargs
    url = config.backend_url
    __backend = klass(url, **kwargs)
    _backend = __backend
    return __backend


__all__ = ["RedisBackend", "BaseBackend", "get_backend"]
