#! /usr/bin/env sh

set -e
export COMPOSE_FILE=docker-stack.yml
export COMPOSE_DOCKER_CLI_BUILD=1

docker compose -f docker-compose.develop.yml config > docker-stack.yml
docker compose build

