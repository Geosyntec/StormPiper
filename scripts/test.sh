#! /usr/bin/env sh

set -e
set -x

docker compose -f docker-stack.yml up stormpiper-test postgis -d
docker compose -f docker-stack.yml exec stormpiper-test pytest "$@"
