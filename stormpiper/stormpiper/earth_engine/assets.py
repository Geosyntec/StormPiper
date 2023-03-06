from stormpiper.core.config import settings

from .ee import ee


def assets():  # pragma: no cover
    project_folder = settings.EE_PROJECT_DIRECTORY
    return ee.data.listAssets({"parent": project_folder})
