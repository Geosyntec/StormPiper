from typing import Any

from .base import BaseModel


class TaskModel(BaseModel):
    task_id: str
    status: str
    result: Any | None = None
