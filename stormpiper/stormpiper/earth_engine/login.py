import ee

from stormpiper.core.config import settings, stormpiper_path


EE_AUTHENTICATED = False


def login():
    global EE_AUTHENTICATED

    if EE_AUTHENTICATED:
        return

    try:
        private_key_path = str(stormpiper_path / ".private_keys" / "tncKey.json")
        credentials = ee.ServiceAccountCredentials(
            settings.EE_SERVICE_ACCOUNT, private_key_path
        )
        ee.Initialize(credentials)
        EE_AUTHENTICATED = True

    except Exception:  # pragma: no cover
        EE_AUTHENTICATED = False
        raise
