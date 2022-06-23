#! /usr/bin/env sh

set -e
set -x

docker compose \
		-f docker-compose.develop.yml \
		-f docker-compose.dev-volume.yml \
		config > docker-stack.yml
docker compose -f docker-stack.yml exec stormpiper-test pytest "$@"
