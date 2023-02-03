import logging

from stormpiper.startup import (
    get_background_worker_connection,
    get_database_connection,
    get_redis_connection,
)

logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)


def init() -> None:
    get_database_connection()
    get_redis_connection()
    get_background_worker_connection()

    return


def main() -> None:
    logger.info("Initializing service")
    init()
    logger.info("Application finished initializing")


if __name__ == "__main__":
    main()
