"""
Contains API endpoint definitions
"""
from smtplib import SMTPSenderRefused

from flask import render_template
from flask_jwt_extended import (
    create_access_token,
    create_refresh_token,
    get_jwt_identity,
    get_raw_jwt
)
from flask_jwt_extended.exceptions import JWTExtendedException
from flask_restful import Resource, reqparse

from flask_app.email.email import send_email
from flask_app.logger import fmt
from flask_app.models import RevokedTokenModel, UserModel
from flask_app.resources.translate import translate
from flask_app.resources.validator import jwt_required, jwt_refresh_token_required
from settings import Config

login = reqparse.RequestParser()
login.add_argument("username", help="This field cannot be blank", required=True)
login.add_argument("password", help="This field cannot be blank", required=True)

translator = reqparse.RequestParser()
translator.add_argument("text", help="This field cannot be blank", required=True)
translator.add_argument("from", help="This field cannot be blank", required=True)
translator.add_argument("to", help="This field cannot be blank", required=True)

pw_req = reqparse.RequestParser()
pw_req.add_argument("password", help="This field cannot be blank", required=True)

username_req = reqparse.RequestParser()
username_req.add_argument("username", help="This field cannot be blank", required=True)


class Endpoint(Resource):
    """
    Used to inject logger dependency
    """

    def __init__(self, **kwargs) -> None:
        self.logger = kwargs.get("logger")


class UserRegistration(Endpoint):
    def post(self):
        data = login.parse_args()
        if UserModel.find_by_username(data["username"]):
            self.logger.info(
                fmt("POST", data["username"], "Registration attempt for existing user")
            )
            return {"message": f'User {data["username"]} already exists'}, 400
        new_user = UserModel(
            username=data["username"],
            password=UserModel.generate_hash(data["password"]),
            email_verified=False,
        )
        if not new_user.validate_username():
            self.logger.info(
                fmt(
                    "POST",
                    new_user.username,
                    "Registration attempt with invalid username",
                )
            )
            return {"message": "Invalid email address"}, 400
        elif not UserModel.validate_password(data["password"]):
            self.logger.info(
                fmt(
                    "POST",
                    new_user.username,
                    "Registration attempt with invalid password",
                )
            )
            return {"message": "Invalid password"}, 400
        else:
            token_ = create_access_token(identity=new_user.username)
            confirm_url = generate_activation_url("activate", token_)
            subject = "Please confirm your email address"
            html = render_template("activate.html", confirm_url=confirm_url)
            try:
                new_user.save_to_db()
                self.logger.info(
                    fmt("POST", new_user.username, "Successful registration")
                )
                send_email(new_user.username, subject, html)
            except SMTPSenderRefused:
                self.logger.error(f"Email provider login failure")
            finally:
                return {"message": f'User {data["username"]} was created'}, 201


class UserActivation(Endpoint):
    def post(self):
        """
        This method is responsible for generating and sending activation email messages
        """
        data = login.parse_args()
        current_user = UserModel.find_by_username(data["username"])
        if not current_user or not UserModel.verify_hash(
            data["password"], current_user.password
        ):
            if not current_user:
                self.logger.info(
                    fmt(
                        "POST",
                        "Bad/missing",
                        "Failed activation email req: bad/missing username",
                    )
                )
            else:
                self.logger.info(
                    fmt(
                        "POST",
                        current_user.username,
                        "Failed activation email req: bad password",
                    )
                )
            return {"message": "Bad credentials"}, 400
        elif current_user.email_verified:
            self.logger.info(
                fmt(
                    "POST",
                    current_user.username,
                    "Failed activation email req: already verified",
                )
            )
            return {"message": f"User {data['username']} already verified"}, 400
        else:
            try:
                token = create_access_token(identity=current_user.username)
                confirm_url = generate_activation_url("activate", token)
                subject = "Please confirm your email address"
                html = render_template("activate.html", confirm_url=confirm_url)
                send_email(current_user.username, subject, html)
                self.logger.info(
                    fmt(
                        "POST", current_user.username, "Successful activation email req"
                    )
                )
                return {"message": "Verification email sent"}, 201
            except SMTPSenderRefused:
                self.logger.error(f"Email provider login failure")
                return {"message": "Something went wrong"}, 500

    @jwt_required
    def put(self):
        """
        This method actually sets the account to active
        """
        revoked_token = RevokedTokenModel(jti=get_raw_jwt()["jti"])
        revoked_token.add()
        username = get_jwt_identity()
        user = UserModel.find_by_username(username)
        if not user or not username:
            self.logger.info(fmt("PUT", username, "Failed activation: bad username"))
            return {"message": f"User {username} does not exist"}, 400
        elif user.email_verified:
            self.logger.info(
                fmt("PUT", username, "Failed activation: already activated")
            )
            return {"message": "User already verified"}, 400
        else:
            user.email_verified = True
            user.save_to_db()
            self.logger.info(fmt("PUT", username, "Successful activation"))
            return {"message": f"User {username} has been verified"}, 201


class UserLogin(Endpoint):
    def post(self):
        data = login.parse_args()
        user = UserModel.find_by_username(data["username"])
        if not user or not UserModel.verify_hash(data["password"], user.password):
            if not user:
                self.logger.info(
                    fmt("POST", data["username"], "Failed login: bad username")
                )
            else:
                self.logger.info(
                    fmt("POST", data["username"], "Failed login: bad password")
                )
            return {"message": "Bad credentials"}, 400
        elif not user.email_verified:
            return {"message": f"Unverified email address"}, 401
        else:
            access_token = create_access_token(identity=data["username"])
            refresh_token = create_refresh_token(identity=data["username"])
            self.logger.info(fmt("POST", data["username"], "Successful login"))
            return (
                {
                    "message": f"Logged in as {user.username}",
                    "access_token": access_token,
                    "refresh_token": refresh_token,
                },
                200,
            )


class UserLogoutAccess(Endpoint):
    @jwt_required
    def post(self):
        jti = get_raw_jwt()["jti"]
        username = get_jwt_identity()
        try:
            revoked_token = RevokedTokenModel(jti=jti)
            revoked_token.add()
            self.logger.info(
                fmt("POST", username, "Access token revocation successful")
            )
            return {"message": "Access token has been revoked"}, 202
        except JWTExtendedException:
            return {"message": "Something went wrong"}, 500


class UserLogoutRefresh(Endpoint):
    @jwt_refresh_token_required
    def post(self):
        jti = get_raw_jwt()["jti"]
        username = get_jwt_identity()
        try:
            revoked_token = RevokedTokenModel(jti=jti)
            revoked_token.add()
            self.logger.info(
                fmt("POST", username, "Refresh token revocation successful")
            )
            return {"message": "Refresh token has been revoked"}, 202
        except JWTExtendedException:
            return {"message": "Something went wrong"}, 500


class UserResetPassword(Endpoint):
    def post(self):
        """
        Much like UserActivation endpoint, this method handles sending password reset
        email messages
        """
        data = username_req.parse_args()
        user = UserModel.find_by_username(data["username"])
        if user:
            token = create_access_token(identity=user.username)
            url = generate_activation_url("reset_password", token)
            subject = "Password reset request"
            html = render_template("reset_password.html", reset_url=url)
            try:
                send_email(user.username, subject, html)
                self.logger.info(
                    fmt("POST", user.username, "Successful password reset email req")
                )
            except SMTPSenderRefused:
                self.logger.error(f"Email provider login failure")
        else:
            self.logger.info(
                fmt(
                    "POST",
                    data["username"],
                    "Failed password reset email req: bad/missing username",
                )
            )
        return {"message": "Attempted password reset"}, 200

    @jwt_required
    def put(self):
        """
        Changes password
        """
        data = pw_req.parse_args()
        password = data["password"]
        token = get_raw_jwt()
        username = token["identity"]
        user = UserModel.find_by_username(username)
        if not user or not username:
            self.logger.info(
                fmt("PUT", username, "Failed password reset: bad/missing username")
            )
            return {"message": "Invalid username"}, 400
        elif not user.validate_password(password):
            self.logger.info(
                fmt("PUT", username, "Failed password reset: bad/missing password")
            )
            return {"message": "Invalid password"}, 400
        else:
            user.password = UserModel.generate_hash(password)
            user.save_to_db()
            self.logger.info(
                fmt(
                    "PUT",
                    username,
                    "Successful password change and access token revocation",
                )
            )
            revoked_token = RevokedTokenModel(jti=token["jti"])
            revoked_token.add()
            return {"message": "Password updated"}, 201


class UserDeletion(Endpoint):
    @jwt_required
    def delete(self):
        data = pw_req.parse_args()
        password = data["password"]
        token = get_raw_jwt()
        username = get_jwt_identity()
        user = UserModel.find_by_username(username)
        if not user or not UserModel.verify_hash(password, user.password):
            if not user:
                self.logger.info(
                    fmt(
                        "DELETE", username, "Failed user deletion: bad/missing username"
                    )
                )
            else:
                self.logger.info(
                    fmt(
                        "DELETE", username, "Failed user deletion: bad/missing password"
                    )
                )
            return {"message": "Bad credentials"}, 400
        revoked_token = RevokedTokenModel(jti=token["jti"])
        revoked_token.add()
        self.logger.info(
            fmt(
                "DELETE",
                username,
                "Successful user deletion and access token revocation",
            )
        )
        return UserModel.delete_user(username), 202


class TokenRefresh(Endpoint):
    @jwt_refresh_token_required
    def post(self):
        user = get_jwt_identity()
        access_token = create_access_token(identity=user)
        self.logger.info(fmt("POST", user, "Access token created"))
        return {"access_token": access_token}, 200


class Translation(Endpoint):
    @jwt_required
    def post(self):
        data = translator.parse_args()
        user = get_jwt_identity()
        response = translate(text=data["text"], src=data["from"], target=data["to"])
        if isinstance(response, list):  # Successful responses are lists of dicts
            self.logger.info(fmt("POST", user, "Successful translate req"))
            return response[0]["translations"][0], 200
        elif response["error"]:
            self.logger.error(
                fmt(
                    "POST",
                    user,
                    f'Failed translate request - error: {response["error"]}',
                )
            )
        return {"error": "Internal server error"}, 500


def generate_activation_url(token_name: str, token_value: str) -> str:
    """
    Generates url with token_name=token_value embedded in it.
    :param token_name:
    :param token_value:
    :return:
    """
    return Config.FRONT_END_URL + "?" + f"{token_name}={token_value}"
