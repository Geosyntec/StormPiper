from stormpiper.database.connection import engine
from stormpiper.src import tasks


def test_tasks(db):
    tasks.delete_and_refresh_met_table(engine=engine)
    tasks.update_tmnt_attributes(engine=engine)
    tasks.update_tmnt_attributes(engine=engine, overwrite=True)
    tasks.delete_and_refresh_all_results_tables(engine=engine)
