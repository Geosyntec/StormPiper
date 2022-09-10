import pandas

from stormpiper.connections import arcgis
from stormpiper.src import loading
from stormpiper.src.tmnt import default_tmnt_source_controls as src_ctrls
from stormpiper.src.tmnt import spatial

from ._base import datadir


def fetch_tacoma_gis_data():  # pragma: no cover

    n = list(range(50))

    gdf_delin = arcgis.get_tmnt_facility_delineations(url=None).iloc[n]
    gdf_delin.to_file(datadir / "tmnt_facility_delineation.geojson", driver="GeoJSON")
    altids = gdf_delin.relid

    gdf = arcgis.get_tmnt_facilities(bmp_url=None, codes_url=None, cols=None).query(
        "altid in @altids"
    )
    gdf.to_file(datadir / "tmnt_facility.geojson", driver="GeoJSON")

    gdf_subbasin = arcgis.get_subbasins(url=None, cols=None)
    gdf_subbasin.to_file(datadir / "subbasin.geojson", driver="GeoJSON")

    lgus = spatial.overlay_rodeo(delineations=gdf_delin, subbasins=gdf_subbasin)
    lgus.to_file(datadir / "lgu_boundary.geojson", driver="GeoJSON")

    load = loading.compute_loading(lgu_boundary=lgus)
    load.to_json(datadir / "lgu_load.json", orient="table")

    tmnt_src_ctrl = src_ctrls.dummy_tmnt_source_control(gdf_subbasin.subbasin.to_list())
    tmnt_src_ctrl.to_json(datadir / "tmnt_source_control.json", orient="table")


def main():  # pragma: no cover
    fetch_tacoma_gis_data()


if __name__ == "__main__":  # pragma: no cover
    main()
