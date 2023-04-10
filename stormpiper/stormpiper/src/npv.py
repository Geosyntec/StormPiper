import json
from typing import Any

import numpy
import numpy_financial as nf
import pandas
from pydantic import ValidationError
from sqlalchemy.ext.asyncio import AsyncSession

from stormpiper.core.config import default_global_cost_settings
from stormpiper.core.exceptions import RecordNotFound
from stormpiper.database import crud
from stormpiper.database.utils import orm_to_dict, scalars_to_records
from stormpiper.models.npv import PVRequest


def compute_bmp_npv_deprecated(
    capital_cost: float,
    om_cost_per_yr: float,
    lifespan_yrs: float,
    discount_rate: float,  # globals
    planning_horizon_yrs: float,  # globals
    replacement_cost: float | None = None,  # default is zero
) -> tuple[float, list]:
    # planning_horizon_yrs = 50 # years
    # discount_rate = 0.05 # avg interest rate 0.08 - 0.03 for inflation

    # capital_cost = 450_000  # $
    # om_cost_per_yr = 6000  # $
    # replacement_cost = capital_cost / 2  # incurred at end of lifespan. refurbishment cost
    # lifespan_yrs = 15

    costs = numpy.zeros(int(planning_horizon_yrs))
    costs -= om_cost_per_yr

    # capital costs are assumed to be incurred on year zero, this year.
    # this overwrites the om cost for year zero as well.
    costs[0] = -capital_cost

    # replacement costs are optional, but if they exist we encumber them
    # after each lifespan.
    if replacement_cost:
        ix = [i for i, _ in enumerate(costs) if i % int(lifespan_yrs) == 0 and i > 0]
        costs[ix] = -replacement_cost  # assume no OM these years, so we overwrite

    net_present_value = nf.npv(discount_rate, costs)

    return round(net_present_value, 2), list(costs.round(2))


def compute_pv_capital_cost(
    *,
    capital_cost: float,
    capital_cost_basis_year: int | float | None = None,
    install_year: int | float | None = None,
    ## globals
    discount_rate: float,
    inflation_rate: float,
    cost_basis_year: int | float,
) -> float:
    if capital_cost_basis_year is None:
        capital_cost_basis_year = cost_basis_year

    if install_year is None:
        install_year = cost_basis_year

    escalation_factor = 1 / (
        (1 - inflation_rate) ** (cost_basis_year - capital_cost_basis_year)
    )
    discount_factor = 1 / (
        (1 + discount_rate) ** (max(install_year - cost_basis_year, 0))
    )
    pv_capital_cost = capital_cost * escalation_factor * discount_factor

    return round(pv_capital_cost, 2)


def compute_bmp_om_pv(
    *,
    om_cost_per_yr: float,
    om_cost_basis_year: int | float | None = None,
    install_year: int | float | None = None,
    lifespan_yrs: float | None,
    replacement_cost: float | None = None,  # default is zero
    ## globals
    discount_rate: float,
    inflation_rate: float,
    planning_horizon_yrs: float,
    cost_basis_year: int | float,
) -> pandas.DataFrame:
    # planning_horizon_yrs = 50 # years
    # discount_rate = 0.05 # avg interest rate 0.08 - 0.03 for inflation

    # capital_cost = 450_000  # $
    # om_cost_per_yr = 6000  # $
    # replacement_cost = capital_cost / 2  # incurred at end of lifespan. refurbishment cost
    # lifespan_yrs = 15

    if install_year is None:
        install_year = cost_basis_year

    if om_cost_basis_year is None:
        om_cost_basis_year = cost_basis_year

    if replacement_cost is None:
        replacement_cost = 0

    if lifespan_yrs is None:
        lifespan_yrs = 0

    start_analysis_year = int(min(cost_basis_year, install_year))
    end_analysis_year = int(
        max(cost_basis_year, install_year) + planning_horizon_yrs + 1
    )
    df = (
        pandas.DataFrame(
            {
                "year": numpy.arange(start_analysis_year, end_analysis_year, 1).astype(
                    int
                )
            }
        )
        .assign(
            in_planning_horizon=lambda df: (
                df["year"] + planning_horizon_yrs + 1
            ).astype(int)
            >= end_analysis_year
        )
        .assign(om_cost_period=lambda df: (df["year"] - om_cost_basis_year).astype(int))
        .assign(cost_basis_period=lambda df: (df["year"] - cost_basis_year).astype(int))
        .assign(
            discount_factor=lambda df: 1
            / ((1 + discount_rate) ** df["cost_basis_period"])
        )
        .assign(
            om_cost_escalation_factor=lambda df: (
                (1 + inflation_rate) ** df["om_cost_period"]
            )
        )
        .assign(
            cost_basis_escalation_factor=lambda df: (
                (1 + inflation_rate) ** df["cost_basis_period"]
            )
        )
        .assign(om_cost=om_cost_per_yr)
        .assign(
            replacement_cost=lambda df: numpy.where(
                df["year"].isin(
                    list(
                        numpy.arange(install_year, end_analysis_year + 1, lifespan_yrs)
                    )[1:]
                ),
                replacement_cost,
                0,
            )
        )
        .assign(om_cost_total=lambda df: df["om_cost"] + df["replacement_cost"])
        .assign(
            om_cost_total_in_horizon=lambda df: (
                df["in_planning_horizon"] * df["om_cost_total"]
            ).round(2)
        )
        .assign(
            escalated_cost=lambda df: (
                df["om_cost_total_in_horizon"]
                * df["om_cost_escalation_factor"]
                * df["cost_basis_escalation_factor"]
            ).round(2)
        )
        .assign(
            discounted_escalated_cost=lambda df: (
                df["discount_factor"] * df["escalated_cost"]
            ).round(2)
        )
        .assign(pv_om_cost=lambda df: df["discounted_escalated_cost"])
    )

    return df


def compute_bmp_pv(
    *,
    capital_cost: float,
    capital_cost_basis_year: int | float | None = None,
    om_cost_per_yr: float,
    om_cost_basis_year: int | float | None = None,
    install_year: int | float | None = None,
    lifespan_yrs: float | None = None,
    replacement_cost: float | None = None,  # default is zero
    ## globals
    discount_rate: float,
    inflation_rate: float,
    planning_horizon_yrs: int | float,
    cost_basis_year: int | float,
) -> dict[str, Any]:
    present_value_capital_cost = compute_pv_capital_cost(
        capital_cost=capital_cost,
        capital_cost_basis_year=capital_cost_basis_year,
        install_year=install_year,
        discount_rate=discount_rate,
        inflation_rate=inflation_rate,
        cost_basis_year=cost_basis_year,
    )

    present_value_om_cost_table = compute_bmp_om_pv(
        om_cost_per_yr=om_cost_per_yr,
        om_cost_basis_year=om_cost_basis_year,
        install_year=install_year,
        lifespan_yrs=lifespan_yrs,
        replacement_cost=replacement_cost,
        discount_rate=discount_rate,
        inflation_rate=inflation_rate,
        planning_horizon_yrs=planning_horizon_yrs,
        cost_basis_year=cost_basis_year,
    )

    present_value_om_cost = round(present_value_om_cost_table["pv_om_cost"].sum(), 2)

    present_value_total_cost = round(
        present_value_capital_cost + present_value_om_cost, 2
    )

    present_value_results = {
        "present_value_total_cost": present_value_total_cost,
        "present_value_capital_cost": present_value_capital_cost,
        "present_value_om_cost": present_value_om_cost,
        "present_value_om_cost_table": json.loads(
            present_value_om_cost_table.to_json(orient="records")
        ),
    }

    return present_value_results


def get_pv_settings(settings: list[dict] | None = None) -> dict[str, float]:
    if settings is None:
        settings = default_global_cost_settings
    _settings = {dct["variable"]: dct["value"] for dct in settings}
    pv_settings = {
        k: float(v) for k, v in _settings.items() if k in PVRequest.get_fields()
    }
    return pv_settings


async def get_pv_settings_db(db: AsyncSession) -> dict[str, float]:
    settings = scalars_to_records(await crud.global_cost_setting.get_all(db=db))
    return get_pv_settings(settings)


async def calculate_pv_for_existing_tmnt_in_db(node_id: str, db: AsyncSession):
    """Calculates the present cost of a structural bmp facility"""

    attr = await crud.tmnt_cost.get(db=db, id=node_id)

    if not attr:
        raise RecordNotFound(f"Record not found for node_id={node_id}")

    pv_global_settings = await get_pv_settings_db(db=db)

    cost_results = {
        "present_value_capital_cost": None,
        "present_value_om_cost": None,
        "present_value_total_cost": None,
        "present_value_om_cost_table": None,
    }

    try:
        pv_req = PVRequest(
            **orm_to_dict(attr),
            **pv_global_settings,
        )

    except ValidationError:
        attr = await crud.tmnt_cost.update(db=db, id=node_id, new_obj=cost_results)
        raise

    cost_results = compute_bmp_pv(**pv_req.dict())

    attr = await crud.tmnt_cost.update(db=db, id=node_id, new_obj=cost_results)

    return attr
