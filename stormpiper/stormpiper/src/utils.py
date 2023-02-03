from textwrap import dedent

import pandas


def unpack_results_blob(results_blob):
    results_blob = results_blob.set_index(["node_id", "epoch"])[["blob"]]
    results_unpacked = results_blob["blob"].apply(
        lambda dct: pandas.Series(dct.values(), index=dct.keys())
    )

    results = (
        results_blob.join(results_unpacked)
        # if these duplicate keys are in the blob, we need to drop them to prevent dupplicate column names
        # when resetting the index
        .drop(columns=["blob", "node_id", "epoch"]).reset_index()
        # drop duplicated columns
        .loc[:, lambda df: ~df.columns.duplicated()]
    )

    return results


def get_loading_df_from_db(*, tablename="lgu_load", epoch=None, engine):
    if epoch is None:
        epoch_str, user_epoch = "1=%(epoch)s", "1"
    else:
        user_epoch = epoch
        epoch_str = "epoch = %(epoch)s "

    qry = dedent(
        f"""\
        select
            *
        from {tablename}
        where
            ({epoch_str})
        """
    )

    df_tidy = pandas.read_sql(qry, params={"epoch": user_epoch}, con=engine)

    return df_tidy
