import ee

from stormpiper.core.config import settings


def assets():
    project_folder = settings.EE_PROJECT_DIRECTORY
    return ee.data.listAssets({"parent": project_folder})
