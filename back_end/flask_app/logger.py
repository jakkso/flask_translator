"""

"""
import logging

from flask import request


class RequestFormatter(logging.Formatter):
    def format(self, record):
        record.url = request.url
        record.remote_addr = request.remote_addr
        return super().format(record)


formatter = RequestFormatter(
    '[%(asctime)s] %(remote_addr)s requested %(url)s\n'
    '%(levelname)s in %(module)s: %(message)s'
)


def fmt(method: str, username: str, description: str) -> str:
    """
    Log message formatter
    :param method: http method name
    :param username:
    :param description: event description
    :return: string
    """
    return f'Method: {method} | Username: `{username}` | {description}'
