#!/bin/bash

set -e

pip install -U "uv>=0.9,<0.10"

# dev
uv pip compile stormpiper/requirements_unpinned.txt > stormpiper/requirements.txt

# nereid
uv pip compile stormpiper/requirements_test_unpinned.txt > stormpiper/requirements_test.txt

