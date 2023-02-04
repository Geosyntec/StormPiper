from typing import Any

from ee import FeatureCollection as FeatureCollection
from ee import Reducer  # type: ignore
from ee import Geometry
from ee import Image as _Image
from ee import Initialize, ServiceAccountCredentials, data


class Image(Any, _Image):
    ...
