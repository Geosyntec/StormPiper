import logging

from stormpiper.database.connection import engine
from stormpiper.startup import create_admin_user, create_default_globals

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def main() -> None:
    create_admin_user()
    create_default_globals(engine)


if __name__ == "__main__":
    main()
