#! /usr/bin/env sh

set -e
set -x

docker compose -f docker-stack.yml up stormpiper-test postgis redis bg_worker -d
docker compose -f docker-stack.yml exec stormpiper-test bash prestart-tests.sh
docker compose -f docker-stack.yml exec stormpiper-test pytest "$@"

