import pytest
from nereid.src.nomograph.nomo import load_nomograph_mapping

from stormpiper.core.context import get_context


@pytest.fixture
def nomo_map():
    return load_nomograph_mapping(get_context())


def test_volume_nomos(nomo_map):
    for name, nomo in {k: v for k, v in nomo_map.items() if "volume" in k}.items():
        perf = nomo(size=10, ddt=0.1)
        assert perf >= 0, (name, perf)


def test_flow_nomos(nomo_map):
    for name, nomo in {k: v for k, v in nomo_map.items() if "flow" in k}.items():
        perf = nomo(intensity=50, tc=100)
        assert perf >= 0, (name, perf)
