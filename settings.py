"""
Contains configuration values for app
"""
from os import environ as env
from os.path import abspath, dirname, join

from dotenv import load_dotenv

base_dir = abspath(dirname(__file__))
load_dotenv(join(base_dir, ".env"))


class Config:
    SECRET_KEY = env.get("flask_key")
    SQLALCHEMY_DATABASE_URI = env.get(
        "DATABASE_URI", "sqlite:///" + join(base_dir, "app.db")
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_SECRET_KEY = env.get("jwt_key")
    JWT_BLACKLIST_ENABLED = True
    JWT_BLACKLIST_TOKEN_CHECKS = ["access", "refresh"]
    TRANSLATE_API_KEY = env.get("text_translate_key")
    SECURITY_SALT = env.get("password_salt")

    # Flask mail settings
    MAIL_DEFAULT_SENDER = env.get("mail_default_sender")
    MAIL_USERNAME = env.get("mail_default_sender")
    MAIL_PASSWORD = env.get("mail_password")
    MAIL_USE_TLS = True
    MAIL_USE_SSL = False
    MAIL_SERVER = "smtp.gmail.com"
    MAIL_PORT = 587

    FRONT_END_URL = env.get("front_end_url")
