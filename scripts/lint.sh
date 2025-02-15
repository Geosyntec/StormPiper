#! /usr/bin/env sh

set -e
set -x

ruff format ./stormpiper --check --diff
ruff check ./stormpiper --diff

# mkdir -p .mypy_cache
# mypy stormpiper/stormpiper --install-types --non-interactive
