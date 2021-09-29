#! /usr/bin/env sh

rm -fr build/
rm -fr dist/
rm -fr .eggs/
find . -name '*.egg-info' -exec rm -fr {} +
find . -name '*.egg' -exec rm -f {} +

find . -name '*.pyc' -exec rm -f {} +
find . -name '*.pyo' -exec rm -f {} +
find . -name '*~' -exec rm -f {} +
find . -name '__pycache__' -exec rm -fr {} +

find . -name '.coverage' -exec rm -f {} +
find . -name '.tox' -exec rm -fr {} +
find . -name 'htmlcov' -exec rm -fr {} +
find . -name '.pytest_cache' -exec rm -fr {} +
find . -name '.mypy_cache' -exec rm -fr {} +
