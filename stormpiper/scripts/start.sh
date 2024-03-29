#! /usr/bin/env sh

# ref: https://github.com/tiangolo/uvicorn-gunicorn-docker/blob/master/python3.6/start.sh

set -e

MODULE_NAME=stormpiper.main
VARIABLE_NAME=${VARIABLE_NAME:-app}
export APP_MODULE=${APP_MODULE:-"$MODULE_NAME:$VARIABLE_NAME"}

export GUNICORN_CONF=${GUNICORN_CONF:-/gunicorn_conf.py}
export WORKER_CLASS=${WORKER_CLASS:-uvicorn.workers.UvicornWorker}

# If there's a prestart.sh script in the /stormpiper directory, run it before starting
PRE_START_PATH=${PRE_START_PATH:-/stormpiper/prestart.sh}
echo "Checking for script in $PRE_START_PATH"
if [ -f $PRE_START_PATH ] ; then
    echo "Running script $PRE_START_PATH"
    . "$PRE_START_PATH"
else
    echo "There is no script $PRE_START_PATH"
fi

echo "starting application...."

# Start Gunicorn
exec gunicorn -k "$WORKER_CLASS" -c "$GUNICORN_CONF" "$APP_MODULE" --forwarded-allow-ips=*
