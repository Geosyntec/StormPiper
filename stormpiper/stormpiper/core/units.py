from functools import lru_cache

from pint import UnitRegistry

ureg = UnitRegistry()
ureg.define("cuft = cubic_feet")
ureg.define("mcg = microgram")


@lru_cache()
def conversion_factor_from_to(from_unit: str, to_unit: str) -> float:
    factor: float = ureg(from_unit).to(to_unit).magnitude
    return factor
