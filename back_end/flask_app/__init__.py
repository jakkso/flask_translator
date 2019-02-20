"""
Contains app creation functionality
"""
from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask.logging import default_handler
from flask_mail import Mail
from flask_migrate import Migrate
from flask_restful import Api
from flask_sqlalchemy import SQLAlchemy

from flask_app.logger import formatter
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
    default_handler.setFormatter(formatter)  # logging formatter
    api = Api(app)
    CORS(app)
    jwt.init_app(app)
    mail.init_app(app)
    Migrate(app, db)
    api.add_resource(
        endpoints.UserLogin,
        "/api/user/login",
        resource_class_kwargs={"logger": app.logger},
    )
    api.add_resource(
        endpoints.UserRegistration,
        "/api/user/registration",
        resource_class_kwargs={"logger": app.logger},
    )
    api.add_resource(
        endpoints.UserActivation,
        "/api/user/activate",
        resource_class_kwargs={"logger": app.logger},
    )
    api.add_resource(
        endpoints.UserResetPassword,
        "/api/user/reset_password",
        resource_class_kwargs={"logger": app.logger},
    )
    api.add_resource(
        endpoints.UserDeletion,
        "/api/user/delete",
        resource_class_kwargs={"logger": app.logger},
    )
    api.add_resource(
        endpoints.UserLogoutAccess,
        "/api/logout/access",
        resource_class_kwargs={"logger": app.logger},
    )
    api.add_resource(
        endpoints.UserLogoutRefresh,
        "/api/logout/refresh",
        resource_class_kwargs={"logger": app.logger},
    )
    api.add_resource(
        endpoints.TokenRefresh,
        "/api/token/refresh",
        resource_class_kwargs={"logger": app.logger},
    )
    api.add_resource(
        endpoints.Translation,
        "/api/translate",
        resource_class_kwargs={"logger": app.logger},
    )
    return app
