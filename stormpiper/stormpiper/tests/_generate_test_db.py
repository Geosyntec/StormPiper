import logging
from pathlib import Path

import sqlalchemy as sa

from stormpiper.database import utils
from stormpiper.database.schemas.base import Base

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def build_test_db():

    path = Path(__file__).parent.resolve() / "_no_git_test.db"
    engine = sa.create_engine(f"sqlite:///{path}")

    utils.init_spatial(engine)
    with engine.begin() as conn:
        Base.metadata.create_all(conn)
        logger.info("Created all database metadata and schemas")


if __name__ == "__main__":
    build_test_db()
