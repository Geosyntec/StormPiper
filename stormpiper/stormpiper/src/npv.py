from typing import List, Optional, Tuple

import numpy
import numpy_financial as nf


def compute_bmp_npv(
    capital_cost: float,
    om_cost_per_yr: float,
    lifespan_yrs: float,
    discount_rate: float,  # globals
    planning_horizon_yrs: float,  # globals
    replacement_cost: Optional[float] = None,  # default is zero
) -> Tuple[float, List]:
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

    # replacement costs are optional, but if they exist we encoumber them
    # repeatedly after each lifespan.
    if replacement_cost:
        ix = [i for i, _ in enumerate(costs) if i % int(lifespan_yrs) == 0 and i > 0]
        costs[ix] = -replacement_cost  # assume no OM these years, so we overwrite

    net_present_value = nf.npv(discount_rate, costs)

    return round(net_present_value, 2), list(costs.round(2))
