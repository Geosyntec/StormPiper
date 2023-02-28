#! /usr/bin/env sh
set -e

prefix="Prestart script: "

echo "$prefix prestart found"
echo "$prefix mingling with db..."
python /stormpiper/stormpiper/pre-start.py


# Run migrations
if [ "$RUN_PRESTART_MIGRATION" = "1" ] || [ "$RUN_PRESTART_MIGRATION" = "true" ]; then
    echo "$prefix running migrations on db..."
    alembic upgrade head
fi

# initialize database
echo "$prefix bootstrapping database..."
python /stormpiper/stormpiper/create_views.py
python /stormpiper/stormpiper/initial_data.py
echo "$prefix prestart complete"
