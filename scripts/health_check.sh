#! /usr/bin/env sh

set -e

status="$(curl -Is https://dev.tacomawatersheds.com | head -1)"
validate=( $status )
if [ ${validate[-2]} == "200" ]; then
  echo "OK"
else
  echo "DEV NOT RESPONDING"
  make alert-dev-unreachable
fi

status="$(curl -Is https://tacomawatersheds.com | head -1)"
validate=( $status )
if [ ${validate[-2]} == "200" ]; then
  echo "OK"
else
  echo "PROD NOT RESPONDING"
  make alert-prod-unreachable
fi
