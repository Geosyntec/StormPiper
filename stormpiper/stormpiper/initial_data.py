import logging

from stormpiper import startup

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def main() -> None:
    startup.create_admin_user()


if __name__ == "__main__":
    main()
