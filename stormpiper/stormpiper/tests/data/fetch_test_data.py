import json

from stormpiper.connections import arcgis
from stormpiper.models.scenario import SCENARIO_EXAMPLES
from stormpiper.models.scenario_validator import scenario_validator
from stormpiper.src import loading, scenario
from stormpiper.src.tmnt import default_tmnt_source_controls as src_ctrls
from stormpiper.src.tmnt import spatial

from ._base import datadir


def fetch_tacoma_gis_data():  # pragma: no cover
    n = 50

    gdf_delin = (
        arcgis.get_tmnt_facility_delineations(url=None)
        .iloc[:n]
        .sort_index(axis=1)
        .sort_values("node_id")
    )
    gdf_delin.to_file(datadir / "tmnt_facility_delineation.geojson", driver="GeoJSON")
    altids = gdf_delin.relid  # noqa

    gdf = (
        arcgis.get_tmnt_facilities(bmp_url=None, codes_url=None, cols=None)
        .query("altid in @altids")
        .sort_index(axis=1)
        .sort_values("node_id")
    )
    gdf.to_file(datadir / "tmnt_facility.geojson", driver="GeoJSON")

    gdf_subbasin = (
        arcgis.get_subbasins_with_metrics(url=None, cols=None)
        .sort_index(axis=1)
        .sort_values("subbasin")
    )
    gdf_subbasin.to_file(datadir / "subbasin.geojson", driver="GeoJSON")

    lgus = (
        spatial.overlay_rodeo(delineations=gdf_delin, subbasins=gdf_subbasin)
        .sort_index(axis=1)
        .sort_values("node_id")
    )
    lgus.to_file(datadir / "lgu_boundary.geojson", driver="GeoJSON")

    load = (
        loading.compute_loading(lgu_boundary=lgus)
        .sort_index(axis=1)
        .sort_values(["node_id", "epoch", "variable"])
    )
    load.to_json(datadir / "lgu_load.json", orient="table", indent=2)

    tmnt_src_ctrl = (
        src_ctrls.dummy_tmnt_source_control(gdf_subbasin.subbasin.to_list())
        .sort_index(axis=1)
        .sort_values(["subbasin", "variable", "direction", "activity"])
    )
    tmnt_src_ctrl.to_json(
        datadir / "tmnt_source_control.json", orient="table", indent=2
    )


def fetch_scenario_results():
    scenarios = []
    for _, dct in enumerate(SCENARIO_EXAMPLES.values()):
        scenario_data = dct.get("value", {})
        d = scenario_validator(scenario_data).dict(exclude_unset=True)
        data = scenario.solve_scenario_data(data=d, force=True)
        scenarios.append(data)

    with open(datadir / "scenario.json", "w") as fp:
        json.dump(scenarios, fp, indent=2, sort_keys=True, default=str)


def main():  # pragma: no cover
    fetch_tacoma_gis_data()
    fetch_scenario_results()


if __name__ == "__main__":  # pragma: no cover
    main()
