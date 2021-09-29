import ee

from stormpiper.core.config import settings, stormpiper_path


def login():

    private_key_path = str(stormpiper_path / ".private_keys" / "tncKey.json")
    credentials = ee.ServiceAccountCredentials(
        settings.EE_SERVICE_ACCOUNT, private_key_path
    )
    ee.Initialize(credentials)


def fetch_lidar_dsm_tile_url():

    layer = "lidar_dsm"
    project_folder = settings.EE_PROJECT_DIRECTORY

    lidar_dsm_image = ee.Image(project_folder + layer).selfMask()
    visParams = {
        "palette": [
            "E3F0FE",
            "1F4E00",
            "2C5100",
            "3A5600",
            "445900",
            "4F5C02",
            "5A6005",
            "65660C",
            "736D18",
            "7E7423",
            "8A7B2E",
            "94823A",
            "9F8945",
            "AC9253",
            "B79A5E",
            "C3A36A",
        ],
        "min": 0,
        "max": 600,
    }

    map_id_dict = lidar_dsm_image.getMapId(visParams)
    url = map_id_dict["tile_fetcher"].url_format

    print(type(url), url)
    return url


def init():
    pass
