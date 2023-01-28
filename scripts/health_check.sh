#! /usr/bin/env sh

set -e

echo "checking"
status="$(curl -sfw '%{http_code}' https://dev.tacomawatersheds.com/ping -o /dev/null)"
echo $status
if [ ${status[0]} == "200" ]; then
  echo "DEV OK"
else
  echo "DEV NOT RESPONDING"
  make alert-dev-unreachable
fi

status="$(curl -sfw '%{http_code}' https://tacomawatersheds.com/ping -o /dev/null)"
echo $status
if [ ${status[0]} == "200" ]; then
  echo "PROD OK"
else
  echo "PROD NOT RESPONDING"
  make alert-prod-unreachable
fi
