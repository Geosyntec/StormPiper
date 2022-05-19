import logging

from stormpiper import startup

logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)


def init() -> None:

    startup.get_redis_connection()
    startup.get_background_worker_connection()
    startup.get_database_connection()

    return


def main() -> None:
    logger.info("Initializing service")
    init()
    logger.info("Application finished initializing")


if __name__ == "__main__":
    main()