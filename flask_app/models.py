"""
Contains database models
"""
from passlib.hash import pbkdf2_sha256 as sha256

from flask_app import db


class UserModel(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(120), nullable=False)

    def save_to_db(self):
        db.session.add(self)
        db.session.commit()

    @classmethod
    def find_by_username(cls, username):
        return cls.query.filter_by(username=username).first()

    @classmethod
    def return_all(cls):
        def to_json(user):
            return {"username": user.username, "password": user.password}

        return list(map(lambda user: to_json(user), UserModel.query.all()))

    @classmethod
    def delete_all(cls):
        try:
            rows_deleted = db.session.query(cls).delete()
            db.session.commit()
            return {"message": f"{rows_deleted} row(s) deleted"}
        except:
            return {"message": "Something went wrong"}

    @staticmethod
    def generate_hash(password):
        return sha256.hash(password)

    @staticmethod
    def verify_hash(password, hash_):
        return sha256.verify(password, hash_)


class RevokedTokenModel(db.Model):
    __tablename__ = "revoked_tokens"
    id = db.Column(db.Integer, primary_key=True)
    jti = db.Column(db.String(120))

    def add(self):
        db.session.add(self)
        db.session.commit()

    @classmethod
    def is_jti_blacklisted(cls, jti):
        query = cls.query.filter_by(jti=jti).first()
        return bool(query)
