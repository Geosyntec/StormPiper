import pandas

from stormpiper.core.config import VIRTUAL_POCS, VIRTUAL_POLLUTANT_MAPPER


def add_virtual_pocs_to_tidy_load_summary(
    load_tidy: pandas.DataFrame,
) -> pandas.DataFrame:
    """
    load_tidy must have a 'variable' column with parameters labels.

    """

    tss = load_tidy.query('variable == "TSS"')
    non_virtual_pocs = load_tidy.query("variable not in @VIRTUAL_POCS")

    if tss.empty:
        return pandas.DataFrame()

    virtual_pocs = []
    for poc in VIRTUAL_POCS:
        func = VIRTUAL_POLLUTANT_MAPPER[poc]
        virtual_poc = tss.assign(variable=poc).assign(value=lambda df: func(df.value))
        virtual_pocs.append(virtual_poc)

    df = pandas.concat([non_virtual_pocs] + virtual_pocs)

    return df


def add_virtual_pocs_to_wide_load_summary(
    results: pandas.DataFrame,
) -> pandas.DataFrame:
    tss_cols = [c for c in results.columns if "tss" in c.lower()]

    for poc in VIRTUAL_POCS:
        new_cols = [c.replace("TSS", poc) for c in tss_cols]

        func = VIRTUAL_POLLUTANT_MAPPER[poc]
        results[new_cols] = results[tss_cols].apply(func, axis=1, result_type="expand")

    return results
