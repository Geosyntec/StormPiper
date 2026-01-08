from typing import cast

import numpy

from .preference_functions import PREFERENCE_FUNCTIONS
from .prom_types import T1, T2, DType


def check_finite(arr):
    if not numpy.isfinite(arr).all():
        raise ValueError(
            "Input matrix must not contain None, nan or +-infinity values. "
            "Please set a meaningful default value for all missing data."
        )
    return arr


def check_param_length(arr, M):
    msg = "Length of the array must match the number of criteria"
    if not len(arr) == M:
        raise ValueError(msg)
    return arr


def check_pref_fxn(pref_function, M):
    if pref_function is None:
        pref_function = ["usual" for _ in range(M)]
    elif isinstance(pref_function, str):
        pref_function = [pref_function for _ in range(M)]

    pref_function = check_param_length(pref_function, M)
    methods = PREFERENCE_FUNCTIONS.keys()

    msg = (
        "Supply a single pref function or a list of pref functions. "
        f"Preference functions may be any of {methods}"
    )
    if not all(isinstance(i, str) and i in methods for i in pref_function):
        raise ValueError(msg)
    return pref_function


def check_weights(
    weights: list[int | float] | numpy.ndarray[tuple[T2], DType],
) -> numpy.ndarray[tuple[T2], DType]:
    w = numpy.array(weights)
    assert (w >= 0.0).all()
    wsum = w.sum()
    if wsum > 0.0:
        return w / w.sum()
    return w  # type: ignore


def minmax_normalization(
    arr: numpy.ndarray[tuple[T1], DType],
) -> numpy.ndarray[tuple[T1], DType]:
    min_ = numpy.min(arr)
    range_ = numpy.max(arr) - min_
    if range_ == 0.0:
        return cast(numpy.ndarray[tuple[T1], DType], numpy.ones(arr.shape))
    return (arr - min_) / range_
