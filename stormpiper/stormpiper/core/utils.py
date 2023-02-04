import asyncio
import datetime
import functools
from typing import List, Optional

import pandas
import pytz
from celery.result import AsyncResult


def columns_of_dtype(df: pandas.DataFrame, selector: str) -> List[str]:
    """get columns of df that  match the 'selector' dtype

    e.g.,
    >columns_of_dtype(df, 'datetime')
    output: ['time_created', 'time_updated']

    """
    return [str(c) for c in df.columns if selector in str(df[c].dtype)]


def datetime_to_isoformat(df, cols=None, dt_selector=None, inplace=False):
    """create json serializable timestamps by converting all datetime columns to isoformat"""
    if dt_selector is None:
        dt_selector = "datetime"
    if cols is None:
        cols = columns_of_dtype(df, dt_selector)
    if not inplace:
        df = df.copy()

    df[cols] = df[cols].applymap(lambda x: x.isoformat())

    return df


async def wait_a_sec_and_see_if_we_can_return_some_data(
    task: AsyncResult,
    timeout: Optional[float] = None,
    exp: Optional[float] = None,
) -> None:
    if timeout is None:
        timeout = 0.5

    if exp is None:
        exp = 1

    t = 0.0
    inc = 0.05  # check back every inc seconds
    while t < timeout:
        if task.ready():  # exit even if the task failed
            return
        else:
            inc *= exp
            t += inc
            await asyncio.sleep(inc)
    return


def datetime_now():
    return datetime.datetime.now(pytz.timezone("US/Pacific"))


def rsetattr(obj, attr, val):
    """Allows assignment to nested attribute"""
    pre, _, post = attr.rpartition(".")
    return setattr(rgetattr(obj, pre) if pre else obj, post, val)


# using wonder's beautiful simplification:
# #https://stackoverflow.com/questions/31174295/getattr-and-setattr-on-nested-objects/31174427?noredirect=1#comment86638618_31174427


def rgetattr(obj, attr, *args):
    """Allows retrieval of nested attribute."""

    def _getattr(obj, attr):
        return getattr(obj, attr, *args)

    return functools.reduce(_getattr, [obj] + attr.split("."))
