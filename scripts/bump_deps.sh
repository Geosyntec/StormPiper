#!/bin/bash

set -e

pip install -U "uv>=0.9,<0.10"

# dev
uv pip compile requirements/requirements_unpinned.txt > requirements/requirements.txt

# nereid
uv pip compile requirements/requirements_test_unpinned.txt > requirements/requirements_test.txt

