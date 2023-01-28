import logging

import startup

from stormpiper.database.connection import engine

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def main() -> None:
    startup.create_initial_users()
    startup.create_default_globals(engine)


if __name__ == "__main__":
    main()
