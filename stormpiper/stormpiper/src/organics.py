import pandas

VIRTUAL_POLLUTANT_MAPPER = {
    "PHE": lambda tss: tss * 1e-6 * 1 * 1,
    "PYR": lambda tss: tss * 1.9 * 1,
    "DEHP": lambda tss: tss * 1e-6 * 19.3 * 2.3,
}


VIRTUAL_POCS = VIRTUAL_POLLUTANT_MAPPER.keys()


def add_virtual_pocs_to_tidy_load_summary(
    load_tidy: pandas.DataFrame,
) -> pandas.DataFrame:
    """
    load_tidy must have a 'variable' column with parameters labels.

    """

    tss = load_tidy.query('variable == "TSS"')

    if tss.empty:
        return pandas.DataFrame()

    poc_dfs = []
    for poc in VIRTUAL_POCS:
        func = VIRTUAL_POLLUTANT_MAPPER[poc]
        poc_df = tss.assign(variable=poc).assign(value=lambda df: func(df.value))
        poc_dfs.append(poc_df)

    df = pandas.concat([load_tidy] + poc_dfs)

    return df


def add_virtual_pocs_to_wide_load_summary(load_wide):
    results = load_wide.copy()
    tss_cols = [c for c in results.columns if "tss" in c.lower()]

    for poc in VIRTUAL_POCS:
        new_cols = [poc + c.replace("TSS", "") for c in tss_cols]
        func = VIRTUAL_POLLUTANT_MAPPER[poc]
        results[new_cols] = results[tss_cols].apply(func, axis=1, result_type="expand")

    return results
