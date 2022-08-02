import logging
from typing import Optional

from celery import Celery, chain, group, chord
from celery.schedules import crontab

from stormpiper.core.config import settings
from stormpiper.src import tasks

logging.basicConfig(level=settings.LOGLEVEL)
logger = logging.getLogger(__name__)

celery_app = Celery("tasks")

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],  # Ignore other content
    result_serializer="json",
    broker_url=settings.REDIS_BROKER_URL,
    result_backend=settings.REDIS_RESULT_BACKEND,
    timezone="US/Pacific",
)


class IncompleteChainError(Exception):
    ...


@celery_app.task(acks_late=True, track_started=True)
def ping():  # pragma: no cover
    logger.info("background pinged")
    return tasks.ping()


@celery_app.task
def check_results(results, can_raise=False, msg: Optional[str] = None):
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
    return True


@celery_app.task
def task_succeeds_or_continues_chain(continue_chain=True):
    return continue_chain


@celery_app.task(acks_late=True, track_started=True)
def delete_and_refresh_tmnt_facility_table(continue_chain=True):  # pragma: no cover
    logger.info("background delete_and_refresh_tmnt_facility_table")
    try:
        if not continue_chain:
            raise IncompleteChainError(f"A task failed and broke the chain.")
        tasks.delete_and_refresh_tmnt_facility_table()
    except Exception as e:
        logger.exception(e)
        raise e
    return True


@celery_app.task(acks_late=True, track_started=True)
def update_tmnt_attributes(continue_chain=True, overwrite=False):  # pragma: no cover
    logger.info("background update_tmnt_attributes")
    try:
        if not continue_chain:
            raise IncompleteChainError(f"A task failed and broke the chain.")
        tasks.update_tmnt_attributes(overwrite=overwrite)
    except Exception as e:
        logger.exception(e)
        return False
    return True


@celery_app.task(acks_late=True, track_started=True)
def delete_and_refresh_tmnt_facility_delineation_table(
    continue_chain=True,
):  # pragma: no cover
    logger.info("background delete_and_refresh_tmnt_facility_delineation_table")
    try:
        if not continue_chain:
            raise IncompleteChainError(f"A task failed and broke the chain.")
        tasks.delete_and_refresh_tmnt_facility_delineation_table()
    except Exception as e:
        logger.exception(e)
        return False
    return True


@celery_app.task(acks_late=True, track_started=True)
def delete_and_refresh_subbasin_table(continue_chain=True):  # pragma: no cover
    logger.info("background delete_and_refresh_subbasin_table")
    try:
        if not continue_chain:
            raise IncompleteChainError(f"A task failed and broke the chain.")
        tasks.delete_and_refresh_subbasin_table()
    except Exception as e:
        logger.exception(e)
        return False
    return True


@celery_app.task(acks_late=True, track_started=True)
def delete_and_refresh_lgu_boundary_table(continue_chain=True):  # pragma: no cover
    logger.info("background delete_and_refresh_lgu_boundary_table")
    try:
        if not continue_chain:
            raise IncompleteChainError(f"A task failed and broke the chain.")
        tasks.delete_and_refresh_lgu_boundary_table()
    except Exception as e:
        logger.exception(e)
        return False
    return True


@celery_app.task(acks_late=True, track_started=True)
def delete_and_refresh_lgu_load_table(continue_chain=True):  # pragma: no cover
    logger.info("background delete_and_refresh_lgu_load_table")
    try:
        if not continue_chain:
            raise IncompleteChainError(f"A task failed and broke the chain.")
        tasks.delete_and_refresh_lgu_load_table()
    except Exception as e:
        logger.exception(e)
        return False
    return True


@celery_app.task(acks_late=True, track_started=True)
def delete_and_refresh_static_reference_tables(continue_chain=True):  # pragma: no cover
    logger.info("background delete_and_refresh_static_reference_tables")
    try:
        if not continue_chain:
            raise IncompleteChainError(f"A task failed and broke the chain.")
        logger.info("background delete_and_refresh_met_table")
        tasks.delete_and_refresh_met_table()
    except Exception as e:
        logger.exception(e)
        return False
    return True


@celery_app.task(acks_late=True, track_started=True)
def delete_and_refresh_graph_edge_table(continue_chain=True):  # pragma: no cover
    try:
        if not continue_chain:
            raise IncompleteChainError(f"A task failed and broke the chain.")
        logger.info("background delete_and_refresh_graph_edge_table")
        tasks.delete_and_refresh_graph_edge_table()
    except Exception as e:
        logger.exception(e)
        return False
    return True


@celery_app.task(acks_late=True, track_started=True)
def delete_and_refresh_result_table(continue_chain=True):  # pragma: no cover
    try:
        if not continue_chain:
            raise IncompleteChainError(f"A task failed and broke the chain.")
        logger.info("background delete_and_refresh_result_table")
        tasks.delete_and_refresh_result_table()
    except Exception as e:
        logger.exception(e)
        return False
    return True


# @celery_app.task
# def chord_1_refresh_base_tables(continue_chain=True):

#     try:

#         if not continue_chain:
#             raise IncompleteChainError(f"A task failed and broke the chain.")
#         gp = group(
#             delete_and_refresh_static_reference_tables.s(),
#             delete_and_refresh_tmnt_facility_table.s(),
#             delete_and_refresh_tmnt_facility_delineation_table.s(),
#             delete_and_refresh_subbasin_table.s(),
#         ) | check_results.s(msg="pulled static gis resources")

#         return gp

#     except Exception as e:
#         logger.exception(e)

#     finally:
#         return False


# @celery_app.task
# def chord_2_update_default_attrs_and_refresh_lgu_loading(continue_chain=True):

#     try:

#         if not continue_chain:
#             raise IncompleteChainError(f"A task failed and broke the chain.")
#         gp = group(
#             update_tmnt_attributes.si(),
#             chain(
#                 # this rodeo requires updated delineations and subbasins
#                 delete_and_refresh_lgu_boundary_table.s(),
#                 task_raises.si(),
#                 # this hits ee with the rodeo overlay result
#                 delete_and_refresh_lgu_load_table.s(),
#                 check_results.s(
#                     msg="Refresh LGU Boundary then Recompute LGU Load with EE."
#                 ),
#             ),
#         ) | check_results.s(msg="update tmnt and refresh LGU tables")

#         return gp

#     except Exception as e:
#         logger.exception(e)

#     finally:
#         return False


# @celery_app.task
# def chord_3_update_graph_recalculate(continue_chain=True):

#     try:

#         if not continue_chain:
#             raise IncompleteChainError(f"A task failed and broke the chain.")
#         gp = group(
#             chain(
#                 delete_and_refresh_graph_edge_table.s(),
#                 delete_and_refresh_result_table.s(),
#                 check_results.s(msg="update graph and resolve results"),
#             ),
#         ) | check_results.s(msg="update results")

#         return gp

#     except Exception as e:
#         logger.exception(e)

#     finally:
#         return False


# @celery_app.task
# def refresh_all():
#     gp = group(
#         chain(
#             chord_1_refresh_base_tables.s(),
#             chord_2_update_default_attrs_and_refresh_lgu_loading.s(),
#             # chord_3_update_graph_recalculate.s(),
#             check_results.s(msg="refresh all - check chain"),
#         ),
#     ) | check_results.s(msg="finalize refresh all results")

#     return gp


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

    __chain_refresh_results = chain(
        delete_and_refresh_graph_edge_table.s(),
        delete_and_refresh_result_table.s(),
        check_results.s(msg="update graph and resolve results"),
    )

    refresh_results = group(
        __chain_refresh_results,
    ) | check_results.s(can_raise=True, msg="update results")

    # refresh_all sequence:
    _group1 = delete_and_refresh_tacoma_gis_tables

    ## group 2 is dependant on group 1 successfully finishing
    _group2 = group(
        update_tmnt_attributes.si(),
        __chain_lgu_tables,
    ) | check_results.s(can_raise=True, msg="update tmnt and refresh LGU tables")

    ## group 3 are dependant on both group 1 & 2
    _group3 = group(refresh_results) | check_results.s(
        can_raise=True, msg="update results"
    )

    # refresh_all = group( # chains of chords cannot propagate errors in celery
    #     chain(
    #         _group1,
    #         _group2,
    #         _group3,
    #         # check_results.s(msg="refresh all tables"),
    #     )
    # ) | check_results.s(msg="finalize task")

    # test_refresh = group( # these run out of order for some reason.
    #     chain(
    #         chord_1_refresh_base_tables.s(),
    #         chord_2_update_default_attrs_and_refresh_lgu_loading.s(),
    #         chord_3_update_graph_recalculate.s(),
    #     ),
    # ) | check_results.s(msg="finalize refresh all results")


@celery_app.task
def run_refresh_task():

    # calling 'get' risks deadlocks in the backend. But since Celery won't propagate
    # errors or pass signatures from chords, it appears to be impossible to work
    # around this for a series workflow chains of chords rather than chains of tasks.
    _ = Workflows._group1().get(disable_sync_subtasks=False, timeout=120)

    _ = Workflows._group2().get(disable_sync_subtasks=False, timeout=300)

    _ = Workflows._group3().get(disable_sync_subtasks=False, timeout=120)

    return True


@celery_app.task(acks_late=True, track_started=True)
def _deprecated_refresh_all_tables():  # pragma: no cover
    logger.info("background refresh_all_tables")
    # chain runs elements in sequence
    # group runs elements in parallel
    try:

        group1 = group_delete_and_refresh_tacoma_gis_tables | check_results.s(
            msg="pulled static gis resources"
        )

        group2 = group(
                update_tmnt_attributes.si(),
            chain_refresh_lgu_tables,
        ) | check_results.s(msg="update tmnt and refresh LGU tables")

        group3 = group(
                chain(
                    delete_and_refresh_graph_edge_table.si(),
                    delete_and_refresh_result_table.si(),
                check_results.s(msg="update graph and resolve results"),
            ),
        ) | check_results.s(msg="update results")

        tst = chord(
            [
                chain(
                    group1,
                    group2,
                    group3,
                    check_results.s(msg="refresh all tables"),
            ),
            ]
        )(check_results.s(msg="finalize task"))

        return getattr(tst, "id", "error -- no task id")

        # t2 = chord(
        #     # requires updated tmnt facility and subbasin tables
        #     [
        #         update_tmnt_attributes.si(),
        #         refresh_lgu_tables.si(),
        #     ]
        # )(check_chord_results.s(msg="update tmnt and refresh LGU tables"))

        # for t in [t1, t2]:
        #     t.get()
        #     if not t.status.lower() == "success":
        #         return False

        # tsk = chord(chain(t1, t2))(check_chord_results.s(msg="refresh all tables"))

        # tsk = chain(
        # parallel refresh client data from web, including esri/arcgis
        # delete_and_refresh_tacoma_gis_tables.si(),
        # parallel jobs to update secondary derived tables and resources
        # chord(
        #     # requires updated tmnt facility and subbasin tables
        #     [
        #         update_tmnt_attributes.si(),
        #         refresh_lgu_tables.si(),
        #     ]
        # )(check_chord_results.s()).si(),
        # chord(
        #     [
        # chain(
        #     delete_and_refresh_graph_edge_table.si(),
        #     delete_and_refresh_result_table.si(),
        # )
        #     ]
        # )(check_chord_results.s()),
        # )
        # tsk.apply_async()

    except Exception as e:
        logger.exception(e)
        return False
    return True


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
    "refresh_all_tables": {
        "task": "stormpiper.bg_worker.run_refresh_task",
        # daily at 6am
        "schedule": crontab(0, "6"),
    },
}
