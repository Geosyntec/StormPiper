import logging
from io import BytesIO
from itertools import product
from typing import Dict, List, Tuple

import networkx as nx
import pandas
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from stormpiper.core.config import settings
from stormpiper.database.schemas import changelog
from stormpiper.database.utils import scalars_to_records

logging.basicConfig(level=settings.LOGLEVEL)
logger = logging.getLogger(__name__)


DEPENDENCY_ADJACENCY_LIST = """# This graph is backward, it needs to be reversed to be in the order of 'information flow'.
# whitespace delimited
# table                                         depends_on      depends_on          depends_on
met
tmnt_facility
tmnt_facility_delineation
subbasin
tmnt_source_control
tmnt_facility_attribute
tmnt_facility_cost                              global_setting
tmnt_v                                          tmnt_facility_attribute    tmnt_facility    tmnt_facility_cost
lgu_boundary                                    subbasin        tmnt_facility_delineation
graph_edge                                      lgu_boundary    tmnt_facility_attribute     tmnt_facility
lgu_load                                        lgu_boundary
tmnt_source_control_upstream_load_reduced       lgu_load        tmnt_source_control             lgu_boundary
lgu_load_to_structural                          tmnt_source_control_upstream_load_reduced       lgu_load
result_blob                                     lgu_load_to_structural      graph_edge          tmnt_facility_attribute   met   tmnt_facility
result_v                                        result_blob
load_to_ds_src_ctrl                             result_blob
tmnt_source_control_downstream_load_reduced     load_to_ds_src_ctrl     tmnt_source_control        lgu_boundary
subbasin_result                                 load_to_ds_src_ctrl     tmnt_source_control_downstream_load_reduced
"""


"This is a Static, Global, and 'Immutable' object defined by the adjacency list"
OG = nx.read_adjlist(
    BytesIO(DEPENDENCY_ADJACENCY_LIST.encode()), create_using=nx.DiGraph
).reverse()


def simplify_graph(g: nx.DiGraph, nodes: list) -> nx.DiGraph:
    """Produces a subgraph of g at the provided nodes and preserves
    connectivity between predecessors and successors to missing nodes.
    """

    ng = g.copy()

    for n in g.nodes:
        if n not in nodes:
            for i, o in product(ng.predecessors(n), ng.successors(n)):
                ng.add_edge(i, o)
            ng.remove_node(n)

    return ng


def check_if_sorted(*, preds, tablename, changelog):
    # preds = list(g.predecessors(tablename))

    if len(preds) == 0:
        return True

    logger.debug(f"checking {tablename} with predecessors: {preds}")

    # discard tables on which we are not dependant
    changelog_slim = [t for t in changelog if t in preds]

    # get max index of the predecessors. if this is smaller than the index of the tablename
    # then the tablename is newer than all of them, i.e., is not dirty.
    maxi = max([changelog.index(i) for i in changelog_slim])
    tablenamei = changelog.index(tablename)
    is_sorted = tablenamei > maxi

    return is_sorted


def check_if_deps_are_sorted(*, g: nx.DiGraph, tablename: str, changelog: list):
    preds = list(g.predecessors(tablename))

    # for a given tablename check if it's deps are sorted in time.
    table_is_sorted = check_if_sorted(
        preds=preds, tablename=tablename, changelog=changelog
    )
    if not table_is_sorted:
        logger.error(f"table {tablename} not sorted. predecessors: {preds}")
        logger.info(f"changelog: {changelog}")
        return False

    # if sorted, check that the deps of each dep are sorted in time (recurse)
    # return all(recurse(i) for i in deps)
    return all(
        check_if_deps_are_sorted(g=g, tablename=t, changelog=changelog) for t in preds
    )


def is_dirty(*, g: nx.DiGraph, tablename: str, changelog: list) -> bool:
    ng = simplify_graph(g=g, nodes=changelog)

    is_sorted = check_if_deps_are_sorted(g=ng, tablename=tablename, changelog=changelog)

    return not is_sorted


def sync_is_dirty(*, tablename: str, engine):
    changelog = (
        pandas.read_sql(
            "select tablename, last_updated from tablechangelog", con=engine
        )
        .set_index("last_updated")
        .sort_index()["tablename"]
        .tolist()
    )

    return is_dirty(g=OG, tablename=tablename, changelog=changelog)


async def sorted_changelog_records(db: AsyncSession) -> List[Dict]:
    changelog_results = (
        (await db.execute(select(changelog.TableChangeLog))).scalars().all()
    )
    records = sorted(
        scalars_to_records(changelog_results), key=lambda x: x["last_updated"]
    )

    return records


async def async_is_dirty(*, tablename: str, db: AsyncSession) -> Tuple[bool, str]:
    records = await sorted_changelog_records(db=db)
    result_record = next(filter(lambda x: x["tablename"] == tablename, records))
    last_updated = str(result_record["last_updated"])
    changelog = [t["tablename"] for t in records]

    is_dirty_bool = is_dirty(g=OG, tablename=tablename, changelog=changelog)

    return is_dirty_bool, last_updated
