"""
Contains app creation functionality
"""
from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_mail import Mail
from flask_migrate import Migrate
from flask_restful import Api
from flask_sqlalchemy import SQLAlchemy

from settings import Config


db = SQLAlchemy()
jwt = JWTManager()
mail = Mail()


@jwt.token_in_blacklist_loader
def check_if_token_in_blacklist(decrypted_token):
    from flask_app import models

    jti = decrypted_token["jti"]
    return models.RevokedTokenModel.is_jti_blacklisted(jti)


def create_app(test_config=None) -> Flask:
    """
    API endpoint configuration
    import is in this func to prevent import errors
    """
    from flask_app.resources import endpoints

    app = Flask(__name__)
    app.config.from_object(Config)
    if test_config:
        app.config.update(test_config)
    with app.app_context():
        db.init_app(app)
        db.create_all()
    api = Api(app)
    CORS(app)
    jwt.init_app(app)
    mail.init_app(app)
    Migrate(app, db)
    api.add_resource(endpoints.UserLogin, "/api/user/login")
    api.add_resource(endpoints.UserRegistration, "/api/user/registration")
    api.add_resource(endpoints.UserActivation, "/api/user/activate")
    api.add_resource(endpoints.UserResetPassword, "/api/user/reset_password")
    api.add_resource(endpoints.UserDeletion, "/api/user/delete")
    api.add_resource(endpoints.UserLogoutAccess, "/api/logout/access")
    api.add_resource(endpoints.UserLogoutRefresh, "/api/logout/refresh")
    api.add_resource(endpoints.TokenRefresh, "/api/token/refresh")
    api.add_resource(endpoints.SecretResource, "/api/translate")
    return app