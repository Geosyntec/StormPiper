import operator as op

import pytest

from stormpiper.apps.supersafe.models import Role


@pytest.mark.parametrize(
    "first, comparison, other",
    [
        (Role.admin, op.le, Role.admin),
        (Role.public, op.le, Role.admin),
        (Role.public, op.lt, Role.admin),
        (Role.admin, op.ge, Role.admin),
        (Role.admin, op.ge, Role.user),
        (Role.admin, op.gt, Role.public),
        (Role.public, op.eq, Role.none),
        (Role.admin, op.eq, Role.admin),
    ],
)
def test_role_ordering(first, comparison, other):
    assert comparison(first._q(), other._q())
