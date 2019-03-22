#!/bin/bash
export REACT_APP_API_URL='https://www.jakks0.xyz/api/'
if [[ $1 = 'build' ]]; then
    docker-compose -f docker-compose-prod.yml build
elif [[ $1 = 'certbot' ]]; then
    sudo bash init-letsencrypt.sh
elif [[ $1 = 'down' ]]; then
    docker-compose -f docker-compose-prod.yml down
elif [[ $1 = 'test' ]]; then
    docker-compose -f docker-compose-prod.yml up -d --build
    docker-compose -f docker-compose-prod.yml exec flask-api python -m pytest
#    docker-compose -f docker-compose-prod.yml exec client npm test
    docker-compose -f docker-compose-prod.yml down
elif [[ $1 = 'up' ]]; then
    if [[ $2 = 'detached' ]]; then
        docker-compose -f docker-compose-prod.yml up -d
    elif [[ $2 != 'detached' && $2 != '' ]]; then
        echo "Unknown arg '$2' Did you mean detached?"
    else
        docker-compose -f docker-compose-prod.yml up
    fi
else
    if [[ $1 = '' ]]; then
        echo "You must supply an argument."
    else
        echo "Invalid argument '$1'"
    fi
    echo "Accepts one single argument at a time, only the first argument will"
    echo "be considered."
    echo "Available arguments are below"
    echo "Argument          Action"
    echo "======================================================================="
    echo "build             Build production webapp containers."
    echo "certbot           Run script to generate SSL certificates for webapp."
    echo "                  Run this prior to attempting to start app for the "
    echo "                  first time, as nginx will fail to launch with"
    echo "                  missing SSL certs.  Requires sudo usage."
    echo "down              Stop webapp."
    echo "test              Build, test, then bring down webapp."
    echo "up                Attempt to start webapp."
    echo "up detached       Attempt to start webapp, as a detached process."
fi
