import logging

from celery import Celery
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


@celery_app.task(acks_late=True, track_started=True)
def ping():  # pragma: no cover
    logger.info("background pinged")
    return tasks.ping()


@celery_app.task(acks_late=True, track_started=True)
def delete_and_refresh_tmnt_facility_table():  # pragma: no cover
    logger.info("background delete_and_refresh_tmnt_facility_table")
    try:
        tasks.delete_and_refresh_tmnt_facility_table()
    except Exception as e:
        logger.exception(e)
        return False
    return True


@celery_app.task(acks_late=True, track_started=True)
def delete_and_refresh_tmnt_facility_delineation_table():  # pragma: no cover
    logger.info("background delete_and_refresh_tmnt_facility_delineation_table")
    try:
        tasks.delete_and_refresh_tmnt_facility_delineation_table()
    except Exception as e:
        logger.exception(e)
        return False
    return True


@celery_app.task(acks_late=True, track_started=True)
def delete_and_refresh_subbasin_table():  # pragma: no cover
    logger.info("background delete_and_refresh_subbasin_table")
    try:
        tasks.delete_and_refresh_subbasin_table()
    except Exception as e:
        logger.exception(e)
        return False
    return True


@celery_app.task(acks_late=True, track_started=True)
def delete_and_refresh_tacoma_gis_tables():  # pragma: no cover
    logger.info("background delete_and_refresh_tacoma_gis_tables")
    try:
        tasks.delete_and_refresh_tmnt_facility_table()
        tasks.delete_and_refresh_tmnt_facility_delineation_table()
        tasks.delete_and_refresh_subbasin_table()
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
    "delete_and_refresh_tmnt_tables": {
        "task": "stormpiper.bg_worker.delete_and_refresh_tmnt_tables",
        # daily at 6am
        "schedule": crontab(0, "6"),
    },
}
