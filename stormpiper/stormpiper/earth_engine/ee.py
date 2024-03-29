from typing import TYPE_CHECKING, Any

import ee
from ee import FeatureCollection as FeatureCollection
from ee import Geometry, Initialize, ServiceAccountCredentials

if TYPE_CHECKING:  # pragma: no cover

    class Image(Any):
        ...

else:
    from ee import Image
