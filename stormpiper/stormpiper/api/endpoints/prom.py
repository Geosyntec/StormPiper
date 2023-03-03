from fastapi import APIRouter, Depends
from fastapi.responses import Response

from stormpiper.apps.supersafe.users import user_role_ge_reader
from stormpiper.models.prom import PromRequest
from stormpiper.src.decision_support.prom import run_subbasins_promethee_prioritization

rpc_router = APIRouter(dependencies=[Depends(user_role_ge_reader)])


@rpc_router.post("/calculate_subbasin_promethee_prioritization", tags=["rpc"])
async def calculate_subbasin_promethee_prioritization(prom: PromRequest):
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
