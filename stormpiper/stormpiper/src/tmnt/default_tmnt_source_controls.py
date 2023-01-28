from typing import List

import pandas


def dummy_tmnt_source_control(subbasins: List[str]):  # pragma: no cover

    StormLineCleaning_Pct_Reduction = {
        "DEHP": 54,  # %
        "PHE": 75,
        "PYR": 80,
        "TSS": 28,
        "TZn": 30,
    }

    Sweeping_Pct_Reduction = {
        "DEHP": 44,  # %
        "PHE": 58,
        "PYR": 60,
        "TSS": 21,
        "TZn": 29,
    }

    sw = {
        "activity": "Street Sweeping",
        "direction": "upstream",
        "order": 0,
    }

    sweeping = pandas.DataFrame(
        [
            {**sw, **{"variable": k, "percent_reduction": v}}
            for k, v in Sweeping_Pct_Reduction.items()
        ]
    )

    Dumping_Pct_Reduction = {
        "DEHP": 22,  # %
        "PHE": 29,
        "PYR": 30,
        "TSS": 11.5,
        "TZn": 18.5,
    }

    dum = {
        "activity": "Dumping Prevention",
        "direction": "upstream",
        "order": 1,
    }

    dumping = pandas.DataFrame(
        [
            {**dum, **{"variable": k, "percent_reduction": v}}
            for k, v in Dumping_Pct_Reduction.items()
        ]
    )

    slc = {
        "activity": "Storm Line Cleaning",
        "direction": "downstream",
        "order": 0,
    }

    linecleaning = pandas.DataFrame(
        [
            {**slc, **{"variable": k, "percent_reduction": v}}
            for k, v in StormLineCleaning_Pct_Reduction.items()
        ]
    )

    src_ctrl = (
        pandas.concat([sweeping, linecleaning, dumping])
        .merge(pandas.DataFrame({"subbasin": subbasins}), how="cross")  # type: ignore cross
        .reset_index(drop=True)
        .assign(id=lambda df: df.index.values + 1)
        .set_index("id")
    )

    return src_ctrl


def foss_tmnt_source_control(foss_subbasins: List[str]):  # pragma: no cover

    StormLineCleaning_Pct_Reduction = {
        "DEHP": 54,  # %
        "PHE": 75,
        "PYR": 80,
        "TSS": 28,
        "TZn": 30,
    }

    Sweeping_Pct_Reduction = {
        "DEHP": 44,  # %
        "PHE": 58,
        "PYR": 60,
        "TSS": 21,
        "TZn": 29,
    }

    sw = {
        "activity": "Street Sweeping",
        "direction": "upstream",
        "order": 0,
    }

    sweeping = pandas.DataFrame(
        [
            {**sw, **{"variable": k, "percent_reduction": v}}
            for k, v in Sweeping_Pct_Reduction.items()
        ]
    )

    slc = {
        "activity": "Storm Line Cleaning",
        "direction": "downstream",
        "order": 0,
    }

    linecleaning = pandas.DataFrame(
        [
            {**slc, **{"variable": k, "percent_reduction": v}}
            for k, v in StormLineCleaning_Pct_Reduction.items()
        ]
    )

    src_ctrl = (
        pandas.concat([sweeping, linecleaning])
        .merge(pandas.DataFrame({"subbasin": foss_subbasins}), how="cross")  # type: ignore cross
        .reset_index(drop=True)
        .assign(id=lambda df: df.index.values + 1)
        .set_index("id")
    )

    return src_ctrl
