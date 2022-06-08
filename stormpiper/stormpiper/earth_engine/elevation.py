from typing import Dict
import ee


def get_elevation(long: float, lat: float) -> Dict[str, float]:
    """mt_rainer = [-121.756163642, 46.85166326]"""

    point = ee.Geometry.Point([long, lat])
    img = ee.Image("USGS/NED")
    elevation_meters = img.reduceRegion(ee.Reducer.first(), point)  # type: ignore

    return elevation_meters.getInfo()
