"""
Contains configuration values for app
"""
from os import environ as env
from os.path import abspath, dirname


base_dir = abspath(dirname(__file__))


class Config:
    SECRET_KEY = env.get("FLASK_KEY")
    SQLALCHEMY_DATABASE_URI = env.get("DATABASE_URL")
    TESTING_DB_URL = env.get("DATABASE_TEST_URL")
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_SECRET_KEY = env.get("JWT_KEY")
    JWT_BLACKLIST_ENABLED = True
    JWT_BLACKLIST_TOKEN_CHECKS = ["access", "refresh"]
    TRANSLATE_API_KEY = env.get("TEXT_TRANSLATE_KEY")
    SECURITY_SALT = env.get("PASSWORD_SALT")

    # Flask mail settings
    MAIL_USE_TLS = True
    MAIL_USE_SSL = False
    MAIL_DEFAULT_SENDER = env.get("MAIL_DEFAULT_SENDER")
    MAIL_PASSWORD = env.get("MAIL_PASSWORD")
    MAIL_SERVER = env.get("MAIL_SERVER")
    MAIL_PORT = env.get("MAIL_PORT")

    FRONT_END_URL = env.get("FRONT_END_URL")
