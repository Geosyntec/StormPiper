import pandas

from stormpiper.database.connection import engine


def build_edge_list(lgu_boundary, tmnt_v: None | pandas.DataFrame):
    lgu = lgu_boundary.assign(ntype="land_surface").assign(
        ds_node_id=lambda df: df["relid"].fillna("SB_" + df["subbasin"])
    )

    tmnt_to_subbasin = pandas.DataFrame([])

    if tmnt_v is not None:
        tmnt_to_subbasin = (
            tmnt_v.assign(ntype="tmnt_facility")
            .assign(source=lambda df: df["node_id"])
            .assign(target=lambda df: "SB_" + df["subbasin"])
        )

    da_to_tmnt = (
        lgu.loc[lgu["node_id"].str.startswith("ls_")]
        .assign(source=lambda df: df["node_id"])
        .assign(target=lambda df: df["ds_node_id"])
    )

    subbasin_to_wshed = (
        lgu.drop_duplicates(subset=["subbasin"])
        .assign(source=lambda df: "SB_" + df["subbasin"])
        .assign(target=lambda df: "B_" + df["basinname"].str.replace(" ", "_"))
    )

    wshed_to_sound = (
        lgu.drop_duplicates(subset=["basinname"])
        .dropna(subset=["altid"])
        .assign(source=lambda df: "B_" + df["basinname"].str.replace(" ", "_"))
        .assign(target="PUGET_SOUND")
    )

    cols = ["source", "target", "ntype", "subbasin", "basinname"]

    edge_list = pandas.concat(
        [
            da_to_tmnt,
            tmnt_to_subbasin,
            subbasin_to_wshed,
            wshed_to_sound,
        ]
    )[cols].assign(target=lambda df: df["target"].fillna("PUGET_SOUND"))

    return edge_list


def build_edge_list_from_database(*, engine=engine):
    with engine.begin() as conn:
        lgu = pandas.read_sql("lgu_boundary", con=conn)
        fac = pandas.read_sql("select * from tmnt_v", con=conn)

    return build_edge_list(lgu, fac)
