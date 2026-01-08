# type: ignore
import logging

from celery import Celery, chain, group
from celery.schedules import crontab
from celery.signals import celeryd_init, worker_ready

from stormpiper.bg_utils import Singleton, clear_locks
from stormpiper.core.config import settings
from stormpiper.src import tasks

logging.basicConfig(level=settings.LOGLEVEL)
logger = logging.getLogger(__name__)

celery_app = Celery("tasks")


@worker_ready.connect()
def w_unlock_all(**kwargs):
    clear_locks(celery_app)


@celeryd_init.connect()
def d_unlock_all(**kwargs):
    clear_locks(celery_app)


celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],  # Ignore other content
    result_serializer="json",
    broker_url=settings.REDIS_BROKER_URL,
    result_backend=settings.REDIS_RESULT_BACKEND,
    timezone="US/Pacific",
    singleton_lock_expiry=1800,
    broker_connection_retry_on_startup=True,
)


def run_in_chain(func, *args, **kwargs):
    logger.info(f"background {func.__name__} has started running.")
    continue_chain = kwargs.pop("continue_chain", True)
    if not continue_chain:
        raise IncompleteChainError("A task failed and broke the chain.")
    try:
        func(*args, **kwargs)
    except Exception as e:
        logger.error(f"background {func.__name__} has failed.")
        logger.exception(e)
        return False
    logger.info(f"background {func.__name__} has successfully completed.")
    return True


class IncompleteChainError(Exception): ...


@celery_app.task(acks_late=True, track_started=True)
def clear_singleton_locks(**kwargs):
    clear_locks(celery_app)


@celery_app.task(acks_late=True, track_started=True)
def ping():  # pragma: no cover
    logger.info("background pinged")
    return tasks.ping()


@celery_app.task
def check_results(results, can_raise=False, msg: str | None = None):
    """naively check that the return value for all tasks is 'truthy'"""
    results = results if isinstance(results, list) else [results]
    logger.info(f"type:{type(results)}; results: {results}; len:{len(results)}")
    succeeded = all(i for i in results)
    status = "SUCCEEDED" if succeeded else "FAILED"
    logger.info(f"Status: {status} for #{len(results)} results -- {msg}")

    if not succeeded and can_raise:
        raise IncompleteChainError(f"some task failed in the chain {results}")

    return succeeded


@celery_app.task
def task_raises():
    try:
        raise ValueError("Deliberately failed the task")
    except Exception as e:
        logger.exception(e)
        return False
    else:
        return True  # type: ignore


@celery_app.task
def task_succeeds_or_continues_chain(continue_chain=True):
    return continue_chain


@celery_app.task(acks_late=True, track_started=True)
def delete_and_refresh_tmnt_facility_table(continue_chain=True):  # pragma: no cover
    return run_in_chain(
        tasks.delete_and_refresh_tmnt_facility_table, continue_chain=continue_chain
    )


@celery_app.task(acks_late=True, track_started=True)
def update_tmnt_attributes(continue_chain=True, overwrite=False):  # pragma: no cover
    return run_in_chain(
        tasks.update_tmnt_attributes, overwrite=overwrite, continue_chain=continue_chain
    )


@celery_app.task(acks_late=True, track_started=True)
def delete_and_refresh_tmnt_facility_delineation_table(
    continue_chain=True,
):  # pragma: no cover
    return run_in_chain(
        tasks.delete_and_refresh_tmnt_facility_delineation_table,
        continue_chain=continue_chain,
    )


@celery_app.task(acks_late=True, track_started=True)
def delete_and_refresh_subbasin_table(continue_chain=True):  # pragma: no cover
    return run_in_chain(
        tasks.delete_and_refresh_subbasin_table, continue_chain=continue_chain
    )


@celery_app.task(acks_late=True, track_started=True)
def delete_and_refresh_lgu_boundary_table(continue_chain=True):  # pragma: no cover
    return run_in_chain(
        tasks.delete_and_refresh_lgu_boundary_table, continue_chain=continue_chain
    )


@celery_app.task(acks_late=True, track_started=True)
def delete_and_refresh_lgu_load_table(continue_chain=True):  # pragma: no cover
    return run_in_chain(
        tasks.delete_and_refresh_lgu_load_table, continue_chain=continue_chain
    )


@celery_app.task(acks_late=True, track_started=True)
def delete_and_refresh_static_reference_tables(continue_chain=True):  # pragma: no cover
    return run_in_chain(
        tasks.delete_and_refresh_met_table, continue_chain=continue_chain
    )


@celery_app.task(acks_late=True, track_started=True)
def delete_and_refresh_graph_edge_table(continue_chain=True):  # pragma: no cover
    return run_in_chain(
        tasks.delete_and_refresh_graph_edge_table, continue_chain=continue_chain
    )


@celery_app.task(acks_late=True, track_started=True)
def delete_and_refresh_upstream_src_ctrl_tables(
    continue_chain=True,
):  # pragma: no cover
    return run_in_chain(
        tasks.delete_and_refresh_upstream_src_ctrl_tables, continue_chain=continue_chain
    )


@celery_app.task(acks_late=True, track_started=True)
def delete_and_refresh_result_table(continue_chain=True):  # pragma: no cover
    return run_in_chain(
        tasks.delete_and_refresh_result_table, continue_chain=continue_chain
    )


@celery_app.task(acks_late=True, track_started=True)
def delete_and_refresh_downstream_src_ctrl_tables(
    continue_chain=True,
):  # pragma: no cover
    return run_in_chain(
        tasks.delete_and_refresh_downstream_src_ctrl_tables,
        continue_chain=continue_chain,
    )


@celery_app.task(base=Singleton, acks_late=True, track_started=True)
def delete_and_refresh_all_results_tables(continue_chain=True):  # pragma: no cover
    return run_in_chain(
        tasks.delete_and_refresh_all_results_tables, continue_chain=continue_chain
    )


class Workflows:
    """All workflows must be chords"""

    test_chord_with_raises = group(
        task_succeeds_or_continues_chain.si(),
        task_raises.si(),
        task_succeeds_or_continues_chain.si(),
    ) | check_results.s(can_raise=True, msg="test_chord_with_raises should fail")

    test_chord_with_nested_chain_with_raises = group(
        task_succeeds_or_continues_chain.si(),
        chain(
            task_succeeds_or_continues_chain.s(),
            task_raises.s(),
            task_succeeds_or_continues_chain.s(),
        ),
        task_succeeds_or_continues_chain.si(),
    ) | check_results.s(
        can_raise=True, msg="test_chord_with_nested_chain_with_raises should fail"
    )

    # each of these have no dependencies, so they all run in parallel
    delete_and_refresh_tacoma_gis_tables = group(
        delete_and_refresh_static_reference_tables.si(),
        delete_and_refresh_tmnt_facility_table.si(),
        delete_and_refresh_tmnt_facility_delineation_table.si(),
        delete_and_refresh_subbasin_table.si(),
    ) | check_results.s(can_raise=True, msg="pulled static gis resources")

    __chain_lgu_tables = chain(
        # this rodeo requires updated delineations and subbasins
        delete_and_refresh_lgu_boundary_table.s(),
        # this hits ee with the rodeo overlay result
        delete_and_refresh_lgu_load_table.s(),
        # check_results.s(msg="Refresh LGU Boundary then Recompute LGU Load with EE."),
    )

    refresh_lgu_tables = (
        group(
            __chain_lgu_tables,
        )
        | check_results.s(msg="Refresh LGU Boundary then Recompute LGU Load with EE."),
    )

    # refresh_all sequence:
    _group1 = delete_and_refresh_tacoma_gis_tables

    ## group 2 is dependent on group 1 successfully finishing
    _group2 = group(
        update_tmnt_attributes.si(),
        __chain_lgu_tables,
    ) | check_results.s(can_raise=True, msg="update tmnt and refresh LGU tables")

    ## group 3 are dependent on both group 1 & 2
    _group3 = group(delete_and_refresh_all_results_tables.s()) | check_results.s(
        can_raise=True, msg="update results"
    )

    refresh_all = group(  # chains of chords cannot propagate errors in celery
        chain(
            _group1,
            _group2,
            _group3,
        )
    ) | check_results.s(msg="finalize task")

    # test_refresh = group( # these run out of order for some reason.
    #     chain(
    #         chord_1_refresh_base_tables.s(),
    #         chord_2_update_default_attrs_and_refresh_lgu_loading.s(),
    #         chord_3_update_graph_recalculate.s(),
    #     ),
    # ) | check_results.s(msg="finalize refresh all results")


@celery_app.task(base=Singleton, acks_late=True, track_started=True)
def run_refresh_task():
    return Workflows.refresh_all()


@celery_app.task(base=Singleton, acks_late=True, track_started=True)
def update_scenario_results(data: dict, force: bool = False):
    tasks.update_scenario_results(data=data, force=force)
    return True


@celery_app.task(base=Singleton, acks_late=True, track_started=True)
def compute_scenario_results(data: dict):
    return tasks.scenario.solve_scenario_data(data=data)


@celery_app.task(base=Singleton, acks_late=True, track_started=True)
def update_all_scenario_results(data_list: list[dict], force: bool = False):
    _ = group(
        update_scenario_results.s(data=data, force=force) for data in data_list
    )().get(disable_sync_subtasks=False)

    return True


@celery_app.task(base=Singleton, acks_late=True, track_started=True)
def calculate_subbasin_promethee_prioritization(data: dict):
    """data: dict[str, list[dict[str, str|int|float]] | str],"""
    return tasks.calculate_subbasin_promethee_prioritization(data=data)


# crontab scheduling tips: (https://docs.celeryproject.org/en/stable/userguide/periodic-tasks.html)
# ==========================================
# crontab() ==> Execute every minute.
# crontab(minute=0, hour=0) ==> Execute daily at midnight.
# crontab(minute=0, hour='*/3') ==> Execute every three hours: midnight, 3am, 6am, 9am, noon, 3pm, 6pm, 9pm.
# crontab(minute=0, hour='0,3,6,9,12,15,18,21') ==> Same as previous.
# crontab(minute='*/15') ==> Execute every 15 minutes.
# crontab(day_of_week='sunday') ==> Execute every minute on Sundays.
# crontab(minute='*', hour='*', day_of_week='sun') ==> Same as previous.
# crontab(minute='*/10', hour='3,17,22', day_of_week='thu,fri') ==> Execute every ten minutes, but only between 3-4 am, 5-6 pm, and 10-11 pm on Thursdays or Fridays.
# crontab(minute=0, hour='*/2,*/3') ==> Execute every even hour, and every hour divisible by three. This means: at every hour except: 1am, 5am, 7am, 11am, 1pm, 5pm, 7pm, 11pm
# crontab(minute=0, hour='*/5') ==> Execute hour divisible by 5. This means that it is triggered at 3pm, not 5pm (since 3pm equals the 24-hour clock value of “15”, which is divisible by 5).
# crontab(minute=0, hour='*/3,8-17') ==> Execute every hour divisible by 3, and every hour during office hours (8am-5pm).
# crontab(0, 0, day_of_month='2') ==> Execute on the second day of every month.
# crontab(0, 0, day_of_month='2-30/2') ==> Execute on every even numbered day.
# crontab(0, 0, day_of_month='1-7,15-21') ==> Execute on the first and third weeks of the month.
# crontab(0, 0, day_of_month='11', month_of_year='5') ==> Execute on the eleventh of May every year.
# crontab(0, 0, month_of_year='*/3') ==> Execute every day on the first month of every quarter.


# if settings.ENABLE_BEAT_SCHEDULE:
#     logger.info("setting up celery beat task schedules...")
celery_app.conf.beat_schedule = {
    ## this task is for demonstration purposes.
    # "ping-every-10-mins": {
    #     "task": "stormpiper.bg_worker.ping",
    #     "schedule": 10 * 60,
    # },
    "clear_locks": {
        "task": "stormpiper.bg_worker.clear_singleton_locks",
        # daily at 0545
        "schedule": crontab("45", "5"),
    },
    "refresh_all_tables": {
        "task": "stormpiper.bg_worker.run_refresh_task",
        # daily at 6am
        "schedule": crontab("0", "6"),
    },
}
