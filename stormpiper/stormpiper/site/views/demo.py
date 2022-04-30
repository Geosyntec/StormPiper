from email import header
from fastapi import APIRouter, Request, Response, Depends
from fastapi.templating import Jinja2Templates
from fastapi.responses import RedirectResponse


from stormpiper import earth_engine
from stormpiper.core.config import stormpiper_path
from stormpiper.apps.supersafe import users

router = APIRouter()

templates = Jinja2Templates(directory=str(stormpiper_path / "site" / "templates"))


@router.get(
    "/tileserver",
    include_in_schema=False,
    dependencies=[Depends(users.current_active_user)],
)
async def tileservice_view(request: Request) -> Response:

    layers = earth_engine.get_layers()

    return templates.TemplateResponse(
        "tileserver.html", {"request": request, "layers": layers.values()}
    )


@router.get("/register", name="register:get_register")
async def get_register(
    request: Request, user: users.User = Depends(users.current_user_safe(optional=True))
):
    if not user:
        return templates.TemplateResponse("register.html", {"request": request})
    return {"message": f"'{user.email}' is already logged in."}


@router.post("/register", name="register:post_register")
async def post_register(request: Request):
    return RedirectResponse(request.url_for("register:register"))


@router.get("/login", name="login:get_login")
async def get_login(request: Request):
    return templates.TemplateResponse("login.html", {"request": request})


@router.post("/login", name="login:post_login")
async def post_login(request: Request):
    return RedirectResponse(request.url_for("auth:jwt.cookie.login"))