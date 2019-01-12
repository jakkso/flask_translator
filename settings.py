"""
Contains configuration values for app
"""
from os import environ as env
from os.path import abspath, dirname, join

from dotenv import load_dotenv

base_dir = abspath(dirname(__file__))
load_dotenv(join(base_dir, '.env'))


class Config:
    SECRET_KEY = env.get('SECRET_KEY', 'super-secret-key')
    SQLALCHEMY_DATABASE_URI = env.get('DATABASE_URI', 'sqlite:///' + join(base_dir, 'app.db'))
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_SECRET_KEY = 'jwt-secret-string'
    JWT_BLACKLIST_ENABLED = True
    JWT_BLACKLIST_TOKEN_CHECKS = ['access', 'refresh']
    TRANSLATE_API_KEY = env.get('key1')
