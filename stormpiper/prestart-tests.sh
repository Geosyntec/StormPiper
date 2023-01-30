#! /usr/bin/env bash
set -e

prefix="Prestart Tests script: "

echo "$prefix prestart found"
echo "$prefix mingling with db..."
python /stormpiper/stormpiper/pre-start-tests.py


# Run migrations
if [ $RUN_PRESTART_MIGRATION = 1 ] || [ $RUN_PRESTART_MIGRATION = "true" ]; then
    echo "$prefix running migrations on db..."
    alembic upgrade head
    python /stormpiper/stormpiper/create_views.py
fi
