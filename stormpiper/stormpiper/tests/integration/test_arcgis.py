import pytest

from stormpiper.connections import arcgis


@pytest.mark.integration
def test_fetch_delin():
    df = arcgis.get_tmnt_facility_delineations()
    assert len(df) > 50


@pytest.mark.integration
def test_fetch_tmnt():
    df = arcgis.get_tmnt_facilities()
    assert len(df) > 50


@pytest.mark.integration
def test_fetch_subbasins():
    df = arcgis.get_subbasins_with_equity_ix()
    assert len(df) > 50
