#!/usr/bin/env bash
export REACT_APP_API_URL=http://localhost/api/
docker-compose -f docker-compose-dev.yml up -d --build
docker-compose -f docker-compose-dev.yml exec flask-api python -m pytest
docker-compose -f docker-compose-dev.yml exec client npm test
docker-compose -f docker-compose-dev.yml down
