from typing import Any, TYPE_CHECKING

import ee
from ee import FeatureCollection as FeatureCollection
from ee import Geometry

from ee import Initialize, ServiceAccountCredentials

if TYPE_CHECKING:

    class Image(Any):
        ...

else:
    from ee import Image
