import json
from typing import Any, Dict, List

import networkx as nx
import pandas
from nereid.src.network.utils import nxGraph_to_dict
from nereid.src.tasks import solve_watershed

from stormpiper.core.context import get_context
from stormpiper.database.connection import engine

from .loading import land_surface_load_nereid_from_db


def get_graph_edges_from_db(connectable):
    edge_list = pandas.read_sql("graph_edge", con=connectable)
    return edge_list


def get_tmnt_facilities_from_db(connectable):
    # need to populate epoch in ref_data_key and assign design storm depth
    facilities = pandas.read_sql("select * from tmnt_v", con=connectable).drop(
        columns=["id", "geom"]
    )
    return facilities


def init_graph_from_df(*, edge_list: pandas.DataFrame) -> nx.DiGraph:

    g = nx.from_pandas_edgelist(edge_list, create_using=nx.DiGraph)
    edge_data = {
        dct.get("source"): {k: v for k, v in dct.to_dict().items() if k != "id"}
        for i, dct in edge_list.iterrows()
    }
    nx.set_node_attributes(g, edge_data)

    return g


def init_land_surface_loading_node_data_from_df(
    *, df: pandas.DataFrame
) -> Dict[str, Dict[str, Any]]:
    """pre filter for epoch"""
    ls_data = {
        str(dct.get("node_id", "")): {
            k: v for k, v in dct.to_dict().items() if k != "node_id"
        }
        for _, dct in df.iterrows()
    }

    return ls_data


def init_treatment_facilities_from_df(*, df: pandas.DataFrame) -> List[Dict[str, Any]]:
    treatment_facilities_list = [row.dropna().to_dict() for _, row in df.iterrows()]
    return treatment_facilities_list


def solve_wq_epochs_from_db(engine=engine):
    """
    get epochs
    get graph
    get facilities as df
    get all epoch loading as df


    res_df_ls = []
    for epoch in epochs
        filter loading df
        loading to data

        assign ref data key [epoch] to facilities for nomograph lookups
        facilities to data

        set node attributes on graph
        call solver

        gather results
        result = res.get('results', []) + res.get('leaf_results', [])

        res_df = pandas.DataFrame(
            [{'node_id':n.get('node_id'), {'epoch': epoch}, 'blob':json.dumps(n, sort_keys=True)} for n in result]
        )

        append(res_df)

    delete and replace table

    """
    with engine.begin() as conn:

        edge_list = get_graph_edges_from_db(conn)
        tmnt_facilities_og = get_tmnt_facilities_from_db(conn)
        met = pandas.read_sql("met", con=conn)

        # get all loading data for all epochs. will query it down later.
        loading_df = land_surface_load_nereid_from_db(epoch=None, connectable=conn)

    epochs = met.epoch.unique()
    context = get_context()

    results_per_epoch_dfs = []

    for epoch in epochs:

        epoch_data = met.query("epoch==@epoch").iloc[0].to_dict()
        ref_data_key = epoch_data["epoch"]
        design_storm_depth_inches = epoch_data["design_storm_precip_depth_inches"]

        # epoch-specific reference data assignment on treatment facilities for nomographs
        tmnt_facilities_df = tmnt_facilities_og.assign(
            design_storm_depth_inches=design_storm_depth_inches
        ).assign(ref_data_key=ref_data_key)
        treatment_facilities = init_treatment_facilities_from_df(df=tmnt_facilities_df)

        # TODO: loading should be _after_ applying upstream source controls
        epoch_loading_df = loading_df.query("epoch==@epoch")
        loading_data = init_land_surface_loading_node_data_from_df(df=epoch_loading_df)

        # make a fresh graph
        g = init_graph_from_df(edge_list=edge_list)

        # set loading data
        nx.set_node_attributes(g, loading_data)

        # prep for nereid call

        ## serialise the graph with data
        graph = nxGraph_to_dict(g)
        watershed = dict(graph=graph, treatment_facilities=treatment_facilities)

        response_dict = solve_watershed(
            watershed=watershed,
            treatment_pre_validated=False,
            context=context,
        )

        result = response_dict["results"] + response_dict["leaf_results"]

        res_df = pandas.DataFrame(
            [
                {
                    "node_id": n.get("node_id"),
                    "epoch": epoch,
                    "blob": json.dumps(n, sort_keys=True),
                }
                for n in result
            ]
        )

        # TODO: compute virtual pollutant values (sediment-bound organics)

        results_per_epoch_dfs.append(res_df)

    results_blob = pandas.concat(results_per_epoch_dfs).reset_index(drop=True)

    return results_blob
