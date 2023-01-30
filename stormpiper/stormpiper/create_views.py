import logging

import startup

from stormpiper.database.connection import engine

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def main() -> None:
    logger.info("creating views...")
    startup.build_views(engine)
    logger.info("creating views...complete.")


if __name__ == "__main__":
    main()
