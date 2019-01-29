"""
Contains database models
"""
from passlib.hash import pbkdf2_sha256 as sha256
import re

from flask_app import db


class UserModel(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(120), nullable=False)
    email_verified = db.Column(db.Boolean)

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

    def validate_username(self) -> bool:
        """
        The email RFC is absurdly complicated and trying to 'properly' parse it
        can require a regex thousands of characters long and I don't care to do that.
        Better to have a loose interpretation, plus, the user ought to activate their
        account so they'll have to enter a valid email address in order to be
        contacted.
        """
        pattern = r"[^@]+@[^@]+\.[^@]+"
        return bool(re.match(pattern, self.username))

    @staticmethod
    def validate_password(password) -> bool:
        """
        Basic password validation
        at least one letter and number, 14 characters in length
        """
        pattern = r"^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{14,}$"
        return bool(re.match(pattern, password))


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
