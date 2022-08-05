from pathlib import Path

from nereid.core import context, io
from nereid.src.wq_parameters import init_wq_parameters


def get_context():
    data_path = Path(__file__).parent.parent / "data" / "project_data"
    io._load_file.cache_clear()
    ctx = context.get_request_context("wa", "tac", datadir=data_path)

    return ctx


def get_pocs(context):
    pocs = init_wq_parameters("land_surface_emc_table", context=context)
    return pocs
