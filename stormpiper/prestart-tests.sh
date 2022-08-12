#! /usr/bin/env bash
set -e

prefix="Prestart Tests script: "

echo "$prefix prestart found"
echo "$prefix mingling with db..."
python /stormpiper/stormpiper/pre-start-tests.py


# Run migrations
if [[ -n $RUN_PRESTART_MIGRATION ]]; then 
    echo "$prefix running migrations on db..."
    alembic upgrade head
fi
