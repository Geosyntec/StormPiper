from io import StringIO

import pandas


def create_met_dataframe() -> pandas.DataFrame:

    string = """
epoch	mean_annual_precip_depth_inches	design_storm_precip_depth_inches
1980s	35.539	0.652
2030s	35.982	0.715
2050s	40.338	0.759
2080s	38.060	0.800
"""

    df = pandas.read_table(StringIO(string))

    return df
