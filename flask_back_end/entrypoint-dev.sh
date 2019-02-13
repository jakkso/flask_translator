#!/bin/sh

# While this file seems unnecessary, currently the app uses sqlite as the
# DB engine, so in the future, checking that postgres is accessible
# will be done here.

python app.py