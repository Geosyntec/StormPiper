from fastapi import APIRouter, Request, Response
from fastapi.templating import Jinja2Templates

from stormpiper.core.config import stormpiper_path

router = APIRouter()

templates = Jinja2Templates(directory=str(stormpiper_path / "site" / "templates"))


@router.get("/tileserver", include_in_schema=False)
async def view_tileservice(request: Request) -> Response:
    return templates.TemplateResponse("tileserver.html", {"request": request})
