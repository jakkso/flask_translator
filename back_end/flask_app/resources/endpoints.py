"""
Contains API endpoint definitions
"""
from smtplib import SMTPAuthenticationError

from flask import render_template
from flask_jwt_extended import (
    create_access_token,
    create_refresh_token,
    jwt_required,
    jwt_refresh_token_required,
    get_jwt_identity,
    get_raw_jwt,
)
from jwt import ExpiredSignatureError

from flask_restful import Resource, reqparse

from flask_app.email.email import send_email
from flask_app.models import RevokedTokenModel, UserModel
from flask_app.resources.translate import translate
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


class UserRegistration(Resource):
    def post(self):
        data = login.parse_args()
        if UserModel.find_by_username(data["username"]):
            return {"message": f'User {data["username"]} already exists'}, 400
        new_user = UserModel(
            username=data["username"],
            password=UserModel.generate_hash(data["password"]),
            email_verified=False,
        )
        if not new_user.validate_username():
            return {"message": "Invalid email address"}, 400
        elif not UserModel.validate_password(data["password"]):
            return {"message": "Invalid password"}, 400
        else:
            token_ = create_access_token(identity=new_user.username)
            confirm_url = generate_activation_url("activate", token_)
            subject = "Please confirm your email address"
            html = render_template("activate.html", confirm_url=confirm_url)
            try:
                new_user.save_to_db()
                send_email(new_user.username, subject, html)
                return {"message": f'User {data["username"]} was created'}, 201
            except SMTPAuthenticationError:  # gmail is screwing with me, asking for auth instead of sending the email.
                pass
            # return {'message': f'{confirm_url}'}, 201
            return {"message": "Something went wrong"}, 500


class UserActivation(Resource):
    def post(self):
        data = login.parse_args()
        current_user = UserModel.find_by_username(data["username"])
        if not current_user or not UserModel.verify_hash(
            data["password"], current_user.password
        ):
            return {"message": "Bad credentials"}, 400
        elif current_user.email_verified:
            return {"message": f"User {data['username']} already verified"}, 400
        else:
            token = create_access_token(identity=current_user.username)
            confirm_url = generate_activation_url("activate", token)
            subject = "Please confirm your email address"
            html = render_template("activate.html", confirm_url=confirm_url)
            send_email(current_user.username, subject, html)
            return {"message": "Verification email sent"}, 201

    @jwt_required
    def put(self):
        revoked_token = RevokedTokenModel(jti=get_raw_jwt()["jti"])
        revoked_token.add()
        username = get_jwt_identity()
        user = UserModel.find_by_username(username)
        if not user or not username:
            return {"message": f"User {username} does not exist"}, 400
        elif user.email_verified:
            return {"message": "User already verified"}, 200
        else:
            user.email_verified = True
            user.save_to_db()
            return {"message": f"User {username} has been verified"}, 201


class UserLogin(Resource):
    def post(self):
        data = login.parse_args()
        user = UserModel.find_by_username(data["username"])
        if not user or not UserModel.verify_hash(data["password"], user.password):
            return {"message": "Bad credentials"}, 400
        elif not user.email_verified:
            return {"message": f"Unverified email address"}, 401
        else:
            access_token = create_access_token(identity=data["username"])
            refresh_token = create_refresh_token(identity=data["username"])
            return (
                {
                    "message": f"Logged in as {user.username}",
                    "access_token": access_token,
                    "refresh_token": refresh_token,
                },
                200,
            )


class UserLogoutAccess(Resource):
    @jwt_required
    def post(self):
        jti = get_raw_jwt()["jti"]
        try:
            revoked_token = RevokedTokenModel(jti=jti)
            revoked_token.add()
            return {"message": "Access token has been revoked"}, 202
        except ExpiredSignatureError:
            return {"message": "Something went wrong"}, 500


class UserLogoutRefresh(Resource):
    @jwt_refresh_token_required
    def post(self):
        jti = get_raw_jwt()["jti"]
        try:
            revoked_token = RevokedTokenModel(jti=jti)
            revoked_token.add()
            return {"message": "Refresh token has been revoked"}, 202
        except:
            return {"message": "Something went wrong"}, 500


class UserResetPassword(Resource):
    def post(self):
        data = username_req.parse_args()
        user = UserModel.find_by_username(data["username"])
        if user:
            token = create_access_token(identity=user.username)
            url = generate_activation_url("reset_password", token)
            subject = "Password reset request"
            html = render_template("reset_password.html", reset_url=url)
            send_email(user.username, subject, html)
        return {"message": "Attempted password reset"}, 200

    @jwt_required
    def put(self):
        data = pw_req.parse_args()
        password = data["password"]
        token = get_raw_jwt()
        username = token["identity"]
        user = UserModel.find_by_username(username)
        if not user or not username:
            return {"message": "Invalid username"}, 400
        elif not user.validate_password(password):
            return {"message": "Invalid password"}, 400
        else:
            user.password = UserModel.generate_hash(password)
            user.save_to_db()
            revoked_token = RevokedTokenModel(jti=token["jti"])
            revoked_token.add()
            return {"message": "Password updated"}, 201


class UserDeletion(Resource):
    @jwt_required
    def delete(self):
        data = pw_req.parse_args()
        password = data["password"]
        token = get_raw_jwt()
        username = get_jwt_identity()
        user = UserModel.find_by_username(username)
        if not user or not UserModel.verify_hash(password, user.password):
            return {"message": "Bad credentials"}, 400
        revoked_token = RevokedTokenModel(jti=token["jti"])
        revoked_token.add()
        return UserModel.delete_user(username), 202


class TokenRefresh(Resource):
    @jwt_refresh_token_required
    def post(self):
        user = get_jwt_identity()
        access_token = create_access_token(identity=user)
        return {"access_token": access_token}, 200


class SecretResource(Resource):
    @jwt_required
    def post(self):
        data = translator.parse_args()
        response = translate(text=data["text"], src=data["from"], target=data["to"])
        if isinstance(response, list):  # Successful responses are lists of dicts
            return response, 200
        elif response["error"]:
            return {"error": "Internal Service Error"}, 500


def generate_activation_url(token_name: str, token_value: str) -> str:
    """
    Generates url with token_name=token_value embedded in it.
    :param token_name:
    :param token_value:
    :return:
    """
    return Config.FRONT_END_URL + "?" + f"{token_name}={token_value}"
