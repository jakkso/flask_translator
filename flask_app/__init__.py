"""
Contains app creation functionality
"""
from flask import Flask
from flask_jwt_extended import JWTManager
from flask_migrate import Migrate
from flask_restful import Api
from flask_sqlalchemy import SQLAlchemy

from settings import Config

app = Flask(__name__)
app.config.from_object(Config)
db = SQLAlchemy(app)
jwt = JWTManager(app)
migrate = Migrate(app)


@jwt.token_in_blacklist_loader
def check_if_token_in_blacklist(decrypted_token):
    from flask_app import models
    jti = decrypted_token["jti"]
    return models.RevokedTokenModel.is_jti_blacklisted(jti)


def create_app() -> Flask:
    """
    API endpoint configuration import is in this func to prevent import errors
    """
    from flask_app.resources import endpoints
    db.create_all()
    api = Api(app)
    api.add_resource(endpoints.UserRegistration, "/registration")
    api.add_resource(endpoints.UserLogin, "/login")
    api.add_resource(endpoints.UserLogoutAccess, "/logout/access")
    api.add_resource(endpoints.UserLogoutRefresh, "/logout/refresh")
    api.add_resource(endpoints.TokenRefresh, "/token/refresh")
    api.add_resource(endpoints.AllUsers, "/users")
    api.add_resource(endpoints.SecretResource, "/secret")
    return app

