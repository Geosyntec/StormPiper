import logging

from stormpiper import startup

logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)


def init() -> None:  # pragma: no cover

    startup.get_database_connection()
    startup.get_redis_connection()

    return


def main() -> None:  # pragma: no cover
    logger.info("Initializing service")
    init()
    logger.info("Worker finished initializing")


if __name__ == "__main__":  # pragma: no cover
    main()
