from typing import Dict

import ee

from .ee import Geometry, Image


def get_elevation(long: float, lat: float) -> Dict[str, float]:
    """mt_rainer = [-121.756163642, 46.85166326]"""

    point = Geometry.Point([long, lat])
    img = Image("USGS/NED")
    elevation_meters = img.reduceRegion(
        ee.Reducer.first(),  # type: ignore
        point,
    )

    return elevation_meters.getInfo()
