#! /usr/bin/env bash
set -e

prefix="Prestart script: "

echo "$prefix prestart found"
echo "$prefix mingling with db..."
python /stormpiper/stormpiper/pre-start.py


# Run migrations
if [[ -n $RUN_PRESTART_MIGRATION ]]; then 
    echo "$prefix running migrations on db..."
    alembic upgrade head
fi

# initialize database
echo "$prefix bootstrapping database..."
python /stormpiper/stormpiper/initial_data.py
echo "$prefix prestart complete"
