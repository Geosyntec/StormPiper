#! /usr/bin/env sh

set -e
set -x

black . --check --diff
# isort . --check --diff
# mkdir -p .mypy_cache
# mypy stormpiper/stormpiper --install-types --non-interactive
