from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import HTMLResponse, ORJSONResponse, PlainTextResponse
from sqlalchemy import select

from stormpiper.apps.supersafe.users import user_role_ge_reader
from stormpiper.database.schemas import tmnt_view as tmnt
from stormpiper.database.utils import orm_to_dict
from stormpiper.src.viz import make_cost_timeseries_plot

from ..depends import AsyncSessionDB

router = APIRouter(dependencies=[Depends(user_role_ge_reader)])


@router.get(
    "/cost_timeseries",
    name="chart:get_chart_cost_timeseries",
)
async def get_chart_cost_timeseries(
    request: Request, node_id: str | None = None, f: str | None = None
):
    data_url = str(
        request.url_for(
            "chart:get_chart_cost_timeseries_data", node_id=node_id or "null"
        )
    )
    spec = make_cost_timeseries_plot(data_url)
    if f == "html":
        html = spec.to_html().replace(
            "</head>",
            "<style>.vega-embed {width: 100%;}</style></head>",
        )
        return HTMLResponse(html)

    content = spec.to_json()  # type: ignore

    return PlainTextResponse(content=content)


@router.get(
    "/{node_id}/cost_timeseries/data",
    name="chart:get_chart_cost_timeseries_data",
)
async def get_chart_cost_timeseries_data(node_id: str, db: AsyncSessionDB):
    if node_id == "null":  # pragma: no cover
        raise HTTPException(
            status_code=404, detail=f"Null record requested. No data available."
        )

    result = await db.execute(
        select(tmnt.TMNT_View).where(tmnt.TMNT_View.node_id == node_id)
    )

    if not result:  # pragma: no cover
        raise HTTPException(
            status_code=404, detail=f"Record not found for node_id={node_id}"
        )

    data = orm_to_dict(result.scalars().first()).get("present_value_chart_table", None)

    if not data:  # pragma: no cover
        raise HTTPException(
            status_code=404, detail=f"Cost data not found for node_id={node_id}"
        )

    return ORJSONResponse(content=data)
