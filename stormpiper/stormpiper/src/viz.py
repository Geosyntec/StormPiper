import altair as alt
import pandas


def make_cost_timeseries_plot(source: str | pandas.DataFrame) -> alt.TopLevelMixin:
    _base = (
        alt.Chart(source)
        .encode(x=alt.X("year:O", axis=alt.Axis(title="Year")))
        .transform_filter(
            (alt.datum.variable == "pv_om_cost")
            | (alt.datum.variable == "pv_capital_cost")
        )
    )

    bar = _base.mark_bar().encode(
        y=alt.Y("value:Q", axis=alt.Axis(format="$,.0f", title="Cost")),
        color=alt.Color(
            "title:N", legend=alt.Legend(title=None, orient="top", labelLimit=0)
        ),
    )

    nearest = alt.selection_point(
        nearest=True, on="mouseover", fields=["year"], empty="none"
    )

    selectors = (
        bar.mark_point()
        .encode(
            x="year:O",
            y="value:Q",
            opacity=alt.value(0),
        )
        .add_params(nearest)
    )

    # Draw points on the line, and highlight based on selection
    points = (
        bar.transform_filter(alt.datum.value > 0)
        .mark_point()
        .encode(opacity=alt.condition(nearest, alt.value(1), alt.value(0)))
    )

    # Draw text labels near the points, and highlight based on selection

    text = (
        bar.transform_filter(alt.datum.value > 0)
        .mark_text(align="left", dx=5, dy=-5)
        .encode(text=alt.condition(nearest, "value:Q", alt.value(" "), format="$,.0f"))
    )

    # Draw a rule at the location of the selection

    rules = _base.mark_rule(color="gray").encode(x="year:O").transform_filter(nearest)

    # rules = lrules + brules

    chart: alt.LayerChart = (
        alt.layer(bar, selectors, points, rules, text)
        .configure_legend(labelLimit=0, direction="vertical", title=None)
        .properties(width="container", height=150)
    ).configure(autosize="fit-x")

    return chart


def make_cost_timeseries_plot_2(
    source: str | pandas.DataFrame,
) -> alt.TopLevelMixin:  # pragma: no cover
    _base = alt.Chart(source).encode(x=alt.X("year:O", axis=alt.Axis(title="Year")))

    _base_line = _base.transform_filter(
        (
            (alt.datum.variable == "pv_om_cost_cumsum")
            | (alt.datum.variable == "pv_total_cost_cumsum")
        )
        & (alt.datum.value > 0)
    )

    _base_bar = _base.transform_filter(
        (
            (alt.datum.variable == "pv_om_cost")
            | (alt.datum.variable == "pv_capital_cost")
        )
        & (alt.datum.value > 0)
    )

    line = _base_line.mark_line(interpolate="step-after").encode(
        y=alt.Y("value:Q", axis=alt.Axis(format="$,.0f", title="Cost")),
        color=alt.Color(
            "title:N", legend=alt.Legend(title=None, orient="top", labelLimit=0)
        ),
    )

    bar = _base_bar.mark_bar().encode(
        y=alt.Y("value:Q", axis=alt.Axis(format="$,.0f", title="Cost")),
        color=alt.Color(
            "title:N", legend=alt.Legend(title=None, orient="top", labelLimit=0)
        ),
    )

    nearest = alt.selection(
        type="single", nearest=True, on="mouseover", fields=["year"], empty="none"
    )

    lselectors = (
        line.mark_point()
        .encode(
            x="year:O",
            y="value:Q",
            opacity=alt.value(0),
        )
        .add_selection(nearest)
    )

    bselectors = (
        bar.mark_point()
        .encode(
            x="year:O",
            y="value:Q",
            opacity=alt.value(0),
        )
        .add_selection(nearest)
    )

    # Draw points on the line, and highlight based on selection
    lpoints = line.mark_point().encode(
        opacity=alt.condition(nearest, alt.value(1), alt.value(0))
    )
    bpoints = bar.mark_point().encode(
        opacity=alt.condition(nearest, alt.value(1), alt.value(0))
    )

    # Draw text labels near the points, and highlight based on selection
    ltext = line.mark_text(align="left", dx=5, dy=-5).encode(
        text=alt.condition(nearest, "value:Q", alt.value(" "), format="$,.0f")
    )
    btext = bar.mark_text(align="left", dx=5, dy=-5).encode(
        text=alt.condition(nearest, "value:Q", alt.value(" "), format="$,.0f")
    )

    # Draw a rule at the location of the selection

    l1 = alt.layer(bar, bselectors, bpoints, btext).properties(
        width="container", height=150
    )

    l2 = alt.layer(line, lselectors, lpoints, ltext).properties(
        width="container", height=150
    )

    chart = (
        alt.vconcat(l1, l2)
        .resolve_scale(
            y="independent",
            color="independent",
        )
        .configure_concat(spacing=2)
    ).configure(autosize="fit-x")

    return chart
