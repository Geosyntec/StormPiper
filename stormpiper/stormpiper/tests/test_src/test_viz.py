from stormpiper.src import viz


def test_cost_chart():
    chart = viz.make_cost_timeseries_plot("")
    assert chart.to_dict()["data"]["url"] == ""
