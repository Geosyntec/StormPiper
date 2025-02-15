# type: ignore
from typing import TYPE_CHECKING, Any

import ee as ee
from ee import (
    FeatureCollection as FeatureCollection,
    Geometry as Geometry,
    Initialize as Initialize,
    ServiceAccountCredentials as ServiceAccountCredentials,
)

if TYPE_CHECKING:  # pragma: no cover

    class Image(Any): ...

else:
    from ee import Image as Image
