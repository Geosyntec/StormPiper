import logging

from stormpiper.startup import get_database_connection

logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)


def init() -> None:  # pragma: no cover

    get_database_connection()

    return


def main() -> None:  # pragma: no cover
    logger.info("Initializing service")
    init()
    logger.info("Test Container finished initializing")


if __name__ == "__main__":  # pragma: no cover
    main()
