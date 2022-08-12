#! /usr/bin/env sh

set -e

# If there's a prestart.sh script in the /stormpiper directory, run it before starting
PRE_START_PATH=${PRE_START_PATH:-/stormpiper/prestart-tests.sh}
echo "Checking for script in $PRE_START_PATH"
if [ -f $PRE_START_PATH ] ; then
    echo "Running script $PRE_START_PATH"
    . "$PRE_START_PATH"
else
    echo "There is no script $PRE_START_PATH"
fi

echo "starting test container...."

# This will make the container wait, doing nothing, but alive
bash -c "while true; do sleep 1; done"
