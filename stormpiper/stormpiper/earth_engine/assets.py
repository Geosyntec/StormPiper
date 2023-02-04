from stormpiper.core.config import settings

from . import ee


def assets():
    project_folder = settings.EE_PROJECT_DIRECTORY
    return ee.data.listAssets({"parent": project_folder})
