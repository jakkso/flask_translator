"""
Contains validator decorator functions.  These two functions are essentially the same
as their identically named counterparts from flask_jwt_extended, except that when
tokens are invalid in some way, the current app's logger is called.
"""


from functools import wraps

from flask import current_app as app, request
from flask_jwt_extended.exceptions import JWTExtendedException
from flask_jwt_extended.view_decorators import (
    verify_jwt_in_request,
    verify_jwt_refresh_token_in_request,
)

from flask_app.logger import fmt


def jwt_required(fn):
    """
    Used to inject logger calls into api endpoints
    :param fn:
    :return:
    """

    @wraps(fn)
    def wrapper(*args, **kwargs):
        try:
            verify_jwt_in_request()
        except JWTExtendedException as e:
            method = request.method
            description = (
                f"Request failed: invalid access token: {e.__class__.__name__}"
            )
            app.logger.info(fmt(method, username="Unknown", description=description))
            raise
        return fn(*args, **kwargs)

    return wrapper


def jwt_refresh_token_required(fn):
    """
    Used to inject logger calls into api endpoints for failed requests
    :param fn:
    :return:
    """

    @wraps(fn)
    def wrapper(*args, **kwargs):
        try:
            verify_jwt_refresh_token_in_request()
        except JWTExtendedException as e:
            method = request.method
            description = (
                f"Request failed: invalid refresh token: {e.__class__.__name__}"
            )
            app.logger.info(fmt(method, username="Unknown", description=description))
            raise
        return fn(*args, **kwargs)

    return wrapper
