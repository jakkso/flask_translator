"""
Contains functions that generate and confirm JWTs
"""

from itsdangerous import (
    BadSignature,
    BadHeader,
    BadData,
    BadTimeSignature,
    SignatureExpired,
    URLSafeTimedSerializer,
)
from settings import Config


def generate_confirmation_token(email: str):
    """
    Generates JWT token using email address
    :param email: email address
    :return:
    """
    serializer = URLSafeTimedSerializer(Config.SECRET_KEY)
    return serializer.dumps(email, Config.SECURITY_SALT)


def confirm_token(token, expiration=3600):
    """

    :param token: JWT formatted string
    :param expiration: seconds that token is valid
    :return: If the token is valid, returns decoded email address, else False
    """
    serializer = URLSafeTimedSerializer(Config.SECRET_KEY)
    try:
        email = serializer.loads(token, salt=Config.SECURITY_SALT, max_age=expiration)
    except (SignatureExpired, BadSignature, BadHeader, BadData, BadTimeSignature):
        return False
    return email
