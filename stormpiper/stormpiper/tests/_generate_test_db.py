from pathlib import Path

import sqlalchemy as sa

from stormpiper.database import utils
from stormpiper.database.schemas.base import Base


def build_test_db():

    path = Path(__file__).parent.resolve() / "_no_git_test.db"
    path.unlink(missing_ok=True)
    engine = sa.create_engine(f"sqlite:///{path}")

    utils.init_spatial(engine)
    with engine.begin() as conn:
        Base.metadata.create_all(conn)


if __name__ == "__main__":
    build_test_db()
