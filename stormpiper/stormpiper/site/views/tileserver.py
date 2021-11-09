from fastapi import APIRouter, Request, Response
from fastapi.templating import Jinja2Templates

from stormpiper import earth_engine
from stormpiper.core.config import stormpiper_path

router = APIRouter()

templates = Jinja2Templates(directory=str(stormpiper_path / "site" / "templates"))


@router.get("/tileserver", include_in_schema=False)
async def tileservice_view(request: Request) -> Response:

    layers = earth_engine.layers().values()

    return templates.TemplateResponse(
        "tileserver.html", {"request": request, "layers": layers}
    )
