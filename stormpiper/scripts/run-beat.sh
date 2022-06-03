#! /usr/bin/env sh

# ref: https://github.com/tiangolo/uvicorn-gunicorn-docker/blob/master/python3.6/start.sh

set -e

# If there's a prestart.sh script in the /stormpiper directory, run it before starting
PRE_START_WORKER_PATH=${PRE_START_WORKER_PATH:-/stormpiper/prestart-worker.sh}

echo "Checking for script in $PRE_START_WORKER_PATH"
if [ -f $PRE_START_WORKER_PATH ] ; then
    echo "Running script $PRE_START_WORKER_PATH"
    . "$PRE_START_WORKER_PATH"
else
    echo "There is no script $PRE_START_WORKER_PATH"
fi

echo "starting beat worker...."

celery --app stormpiper.bg_worker beat -l INFO
