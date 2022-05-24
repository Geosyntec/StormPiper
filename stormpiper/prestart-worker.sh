#! /usr/bin/env bash
set -e

prefix="Worker Prestart script: "

echo "$prefix prestart worker found"
python /stormpiper/stormpiper/pre-start-worker.py
echo "$prefix prestart worker complete"
