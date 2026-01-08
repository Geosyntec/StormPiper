import numpy


def usual(d: numpy.ndarray, q: float, p: float):
    return (d > 0).astype(numpy.float32)


def ushape(d: numpy.ndarray, q: float, p: float):
    return (d > q).astype(numpy.float32)


def vshape_2(d: numpy.ndarray, q: float, p: float):
    mask = p > q
    cond = numpy.logical_and(q < d, d <= p)
    return numpy.where(cond, (d - q) / numpy.where(mask, p - q, 1), d > p).astype(
        numpy.float32
    )


def vshape(d: numpy.ndarray, q: float, p: float):
    mask = p > 0
    cond = numpy.logical_and(0 < d, d <= p)
    return numpy.where(cond, d / numpy.where(mask, p, 1), d > p).astype(numpy.float32)


def level(d: numpy.ndarray, q: float, p: float):
    cond = numpy.logical_and(q < d, d <= p)
    return numpy.where(cond, 0.5, d > p).astype(numpy.float32)


PREFERENCE_FUNCTIONS = {f.__name__: f for f in [usual, ushape, vshape, vshape_2, level]}
PREFERENCE_FUNCTIONS["linear"] = vshape_2
