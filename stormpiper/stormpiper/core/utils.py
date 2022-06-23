from typing import List

import pandas


def columns_of_dtype(df: pandas.DataFrame, selector: str) -> List[str]:
    """get columns of df that  match the 'selector' dtype

    e.g.,
    >columns_of_dtype(df, 'datetime')
    output: ['time_created', 'time_updated']

    """
    return [c for c in df.columns if selector in str(df[c].dtype)]


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
