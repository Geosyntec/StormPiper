from fastapi import APIRouter, Depends
from fastapi.responses import Response

from stormpiper.apps.supersafe.users import check_user
from stormpiper.models.prom import PromRequest
from stormpiper.src.decision_support.prom import run_subbasins_promethee_prioritization

rpc_router = APIRouter(dependencies=[Depends(check_user)])


@rpc_router.post("/subbasin/promethee_prioritization")
async def run_promethee_prioritization(prom: PromRequest):

    criteria, weights = zip(*((m.criteria, m.weight) for m in prom.criteria))
    wq_type = prom.wq_type

    scored_df = run_subbasins_promethee_prioritization(
        criteria=criteria,  # type: ignore
        weights=weights,
        wq_type=wq_type,
    )[["subbasin", "score"]]

    return Response(
        content=scored_df.to_json(orient="records"),
        media_type="application/json",
    )
