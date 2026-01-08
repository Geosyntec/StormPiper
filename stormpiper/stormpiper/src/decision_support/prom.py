import logging
from typing import Sequence, cast

import geopandas
import numpy

from stormpiper.core.config import settings
from stormpiper.database.connection import engine
from .preference_functions import PREFERENCE_FUNCTIONS, usual
from .prom_types import T1, T2, DType
from .util import (
    minmax_normalization,
    check_param_length,
    check_pref_fxn,
    check_weights,
)

logging.basicConfig(level=settings.LOGLEVEL)
logger = logging.getLogger(__name__)


def run_promethee_ii(
    df,
    criteria: Sequence[str],
    weights: Sequence[float],
    types: Sequence[int],
):
    matrix = df[criteria].to_numpy()
    pref_funcs = ["usual"] * len(weights)

    logger.debug(f"types: {types}\nweights: {weights}")

    scores, _weighted_flow = prom_ii(
        matrix,
        weights=numpy.array(weights),
        criteria_type=numpy.array(types),
        pref_function=pref_funcs,
    )
    scores = minmax_normalization(scores) * 100  # type: ignore

    return scores


def run_subbasins_promethee_prioritization(
    criteria: Sequence[str],
    weights: Sequence[float],
    directions: Sequence[int],
    engine=engine,
) -> geopandas.GeoDataFrame:
    sub_results = geopandas.read_postgis(
        "select * from subbasininfo_v order by subbasin",
        con=engine,
    ).assign(  # type: ignore
        score=lambda df: run_promethee_ii(
            df, criteria=list(criteria), weights=list(weights), types=list(directions)
        ).round(3)
    )

    return sub_results  # type: ignore


def unicriterion_flow(array, fxn, q, p, chunksize):
    N = array.shape[0]

    uniflow_plus = numpy.zeros_like(array, dtype=numpy.float32)
    uniflow_minus = numpy.zeros_like(array, dtype=numpy.float32)
    chunks = numpy.array_split(array, numpy.arange(chunksize, N, chunksize))
    len_chunks = len(chunks)
    for i in range(N):
        splits_plus = numpy.zeros_like(array, dtype=numpy.float32)
        splits_minus = numpy.zeros_like(array, dtype=numpy.float32)
        c = array[i]
        for j in range(len_chunks):
            arr = chunks[j]
            n = arr.shape[0]
            diff = c - arr
            splits_plus[j : j + n] += fxn(diff, q, p)
            splits_minus[j : j + n] += fxn(-diff, q, p)

        flow_plus = splits_plus.sum()
        flow_minus = splits_minus.sum()

        uniflow_plus[i] += flow_plus
        uniflow_minus[i] += flow_minus

    return uniflow_plus / (N - 1), uniflow_minus / (N - 1)


def multicriterion_flow(
    matrix: numpy.ndarray[tuple[T1, T2], DType],
    criteria_type: (
        numpy.ndarray[tuple[T2], numpy.dtype[numpy.int8]] | list[int] | None
    ) = None,
    pref_function: str | numpy.ndarray[tuple[T2], DType] | list[str] | None = None,
    q: numpy.ndarray[tuple[T2], DType] | list[int | float] | None = None,
    p: numpy.ndarray[tuple[T2], DType] | list[int | float] | None = None,
    chunksize: int | None = None,
) -> tuple[numpy.ndarray[tuple[T1, T2], DType], numpy.ndarray[tuple[T1, T2], DType]]:
    N, M = matrix.shape
    pref_function = check_pref_fxn(pref_function, M)

    if criteria_type is None:
        criteria_type = [1 for _ in range(M)]
    criteria_type = numpy.array(criteria_type).astype(numpy.int8)

    if q is None:
        q = [0.0 for _ in range(M)]
    if p is None:
        p = [0.0 for _ in range(M)]
    q = check_param_length(q, M)
    p = check_param_length(p, M)

    if chunksize is None:
        chunksize = N

    _matrix = cast(
        numpy.ndarray[tuple[T1, T2], DType], (matrix * criteria_type).T.astype(float)
    )
    pref_matrix_plus = numpy.zeros_like(_matrix)
    pref_matrix_minus = numpy.zeros_like(_matrix)
    for i in range(M):
        pref_fxn = pref_function[i]
        fxn = PREFERENCE_FUNCTIONS.get(pref_fxn, usual)

        uniflow_plus, uniflow_minus = unicriterion_flow(
            _matrix[i], fxn, q=q[i], p=p[i], chunksize=chunksize
        )

        pref_matrix_plus[i] += uniflow_plus
        pref_matrix_minus[i] += uniflow_minus

    return pref_matrix_plus.T, pref_matrix_minus.T


def weighted_multicriterion_flow(
    multicriterion_results: numpy.ndarray[tuple[T1, T2], DType],
    weights: numpy.ndarray[tuple[T2], DType] | list[int | float],
) -> tuple[numpy.ndarray[tuple[T1], DType], numpy.ndarray[tuple[T1, T2], DType]]:
    weighted_flow = cast(
        numpy.ndarray[tuple[T1, T2], DType],
        multicriterion_results * check_weights(weights),
    )
    return weighted_flow.sum(axis=1), weighted_flow


def prom_ii(
    matrix: numpy.ndarray[tuple[T1, T2], DType],
    weights: numpy.ndarray[tuple[T2], DType] | list[int | float],
    criteria_type: numpy.ndarray[tuple[T2], DType] | list[int] | None = None,
    pref_function: str | numpy.ndarray[tuple[T2], DType] | list[str] | None = None,
    q: numpy.ndarray[tuple[T2], DType] | list[int | float] | None = None,
    p: numpy.ndarray[tuple[T2], DType] | list[int | float] | None = None,
    chunksize: int | None = None,
) -> tuple[numpy.ndarray[tuple[T1], DType], numpy.ndarray[tuple[T1, T2], DType]]:
    multicriterion_results_plus, multicriterion_results_minus = multicriterion_flow(
        matrix, criteria_type, pref_function, q=q, p=p, chunksize=chunksize
    )

    net = cast(
        numpy.ndarray[tuple[T1, T2], DType],
        multicriterion_results_plus - multicriterion_results_minus,
    )

    score, weighted_flow = weighted_multicriterion_flow(net, weights)

    return score, weighted_flow
