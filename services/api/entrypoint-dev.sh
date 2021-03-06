#!/bin/sh

echo "Waiting for postgres"
while ! nc -z db 5432; do
    sleep 0.1
done
export FLASK_DEBUG=1
export FLASK_ENV=development
python app.py