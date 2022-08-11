import pandas

from stormpiper.database.connection import engine


def build_edge_list(lgu_boundary, tmnt_v):

    lgu = lgu_boundary.assign(
        basinname=lambda df: "B_" + df["basinname"].str.replace(" ", "_")
    ).assign(ntype="land_surface")

    fac = tmnt_v.assign(ntype="tmnt_structural")

    da_to_tmnt = (
        lgu.dropna(subset=["altid"])
        .assign(source=lambda df: df["node_id"])
        .assign(target=lambda df: df["relid"])
    )

    tmnt_to_subbasin = fac.assign(source=lambda df: df["node_id"]).assign(
        target=lambda df: "SB_" + df["subbasin"]
    )

    subbasin_to_wshed = (
        lgu.loc[lgu["altid"].isna()]
        .assign(source=lambda df: df["node_id"])
        .assign(target=lambda df: df["basinname"])
    )

    wshed_to_sound = (
        lgu.drop_duplicates(subset=["basinname"])
        .dropna()
        .assign(source=lambda df: df["basinname"])
        .assign(target="PUGET_SOUND")
    )

    cols = ["source", "target", "ntype", "subbasin", "basinname"]

    edge_list = (
        pandas.concat(
            [
                da_to_tmnt,
                tmnt_to_subbasin,
                subbasin_to_wshed,
                wshed_to_sound,
            ]
        )[cols]
        .assign(target=lambda df: df["target"].fillna("PUGET_SOUND"))
        .reset_index(drop=True)
        .assign(id=lambda df: df.index + 1)
        .set_index("id")
    )

    return edge_list


def build_edge_list_from_database(*, engine=engine):

    with engine.begin() as conn:

        lgu = pandas.read_sql("lgu_boundary", con=conn)
        fac = pandas.read_sql("select * from tmnt_v", con=conn)

    return build_edge_list(lgu, fac)
