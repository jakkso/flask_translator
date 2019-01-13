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

from flask_app.models import RevokedTokenModel, UserModel
from flask_app.resources.translate import translate

parser = reqparse.RequestParser()
parser.add_argument("username", help="This field cannot be blank", required=True)
parser.add_argument("password", help="This field cannot be blank", required=True)

translator = reqparse.RequestParser()
translator.add_argument("text", help="This field cannot be blank", required=True)
translator.add_argument("from", help="This field cannot be blank", required=True)
translator.add_argument("to", help="This field cannot be blank", required=True)


class UserRegistration(Resource):
    def post(self):
        data = parser.parse_args()
        if UserModel.find_by_username(data["username"]):
            return {"message": f'User {data["username"]} already exists'}

        new_user = UserModel(
            username=data["username"],
            password=UserModel.generate_hash(data["password"]),
        )

        try:
            new_user.save_to_db()
            access_token = create_access_token(identity=data["username"])
            refresh_token = create_refresh_token(identity=data["username"])
            return {
                "message": f'User {data["username"]} was created',
                "access_token": access_token,
                "refresh_token": refresh_token,
            }
        except:
            return {"message": "Something went wrong"}, 500


class UserLogin(Resource):
    def post(self):
        data = parser.parse_args()
        current_user = UserModel.find_by_username(data["username"])

        if not current_user:
            return {"message": f"User {data['username']} does not exist"}

        if UserModel.verify_hash(data["password"], current_user.password):
            access_token = create_access_token(identity=data["username"])
            refresh_token = create_refresh_token(identity=data["username"])
            return {
                "message": f"Logged in as {current_user.username}",
                "access_token": access_token,
                "refresh_token": refresh_token,
            }
        else:
            return {"message": "Bad credentials"}


class UserLogoutAccess(Resource):
    @jwt_required
    def post(self):
        jti = get_raw_jwt()["jti"]
        try:
            revoked_token = RevokedTokenModel(jti=jti)
            revoked_token.add()
            return {"message": "Access token has been revoked"}
        except ExpiredSignatureError:
            return {"message": "Something went wrong"}, 500


class UserLogoutRefresh(Resource):
    @jwt_refresh_token_required
    def post(self):
        jti = get_raw_jwt()["jti"]
        try:
            revoked_token = RevokedTokenModel(jti=jti)
            revoked_token.add()
            return {"message": "Refresh token has been revoked"}
        except:
            return {"message": "Something went wrong"}, 500


class TokenRefresh(Resource):
    @jwt_refresh_token_required
    def post(self):
        current_user = get_jwt_identity()
        access_token = create_access_token(identity=current_user)
        return {"access_token": access_token}


class AllUsers(Resource):
    def get(self):
        return UserModel.return_all()

    def delete(self):
        return UserModel.delete_all()


class SecretResource(Resource):
    @jwt_required
    def get(self):
        data = translator.parse_args()
        response = translate(text=data["text"], src=data["from"], target=data["to"])
        return response
