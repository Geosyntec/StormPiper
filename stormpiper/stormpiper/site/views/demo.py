from fastapi import APIRouter, Depends, Request, Response
from fastapi.responses import RedirectResponse
from fastapi.templating import Jinja2Templates

from stormpiper.apps.supersafe import users
from stormpiper.core.config import stormpiper_path
from stormpiper.earth_engine import async_login, get_layers

router = APIRouter()

templates = Jinja2Templates(directory=str(stormpiper_path / "site" / "templates"))


async def _init():
    await async_login()
    return get_layers()


@router.get(
    "/tileserver",
    include_in_schema=False,
    dependencies=[Depends(users.current_active_user)],
)
async def tileservice_view(
    request: Request, layers: dict[str, str] = Depends(_init)
) -> Response:
    return templates.TemplateResponse(
        "tileserver.html", {"request": request, "layers": layers.values()}
    )


@router.get("/register", name="register:get_register")
async def get_register(
    request: Request, user: users.CurrentUserOrNone
):  # pragma: no cover
    if not user:
        return templates.TemplateResponse("register.html", {"request": request})
    return {"message": f"'{user.email}' is already logged in."}


@router.post("/register", name="register:post_register")
async def post_register(request: Request):  # pragma: no cover
    return RedirectResponse(request.scope["router"].url_path_for("register:register"))


@router.get("/verify", name="verify:get_verify_token")
async def get_verify(request: Request, token: str | None = None):  # pragma: no cover
    return templates.TemplateResponse(
        "verify.html", {"request": request, "token": token}
    )


@router.get("/login", name="login:get_login")
async def get_login(request: Request):  # pragma: no cover
    return templates.TemplateResponse("login.html", {"request": request})


@router.post("/login", name="login:post_login")
async def post_login(request: Request):  # pragma: no cover
    return RedirectResponse(
        request.scope["router"].url_path_for("auth:jwt.cookie.login")
    )


@router.get("/reset_password", name="reset:get_reset_password")
async def get_reset_password(
    request: Request, token: str | None = None
):  # pragma: no cover
    return templates.TemplateResponse(
        "reset_password.html", {"request": request, "token": token}
    )
