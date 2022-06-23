import logging

from stormpiper.startup import create_admin_user

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def main() -> None:
    create_admin_user()


if __name__ == "__main__":
    main()
