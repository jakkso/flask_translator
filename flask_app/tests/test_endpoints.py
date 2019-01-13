"""
Contain tests for endpoints
"""
import os
import tempfile

import pytest

from flask_app import create_app
from settings import Config


def test_registration() -> None:
    """
    Tests user creation
    :return:
    """
    Config.SQLALCHEMY_DATABASE_URI = 'sqlite:///:memory:'
    app = create_app()
    app.config['TESTING'] = True


@pytest.fixture()
def client():
    app = create_app()
    database_fd, app.config['SQLALCHEMY_DATABASE_URI'] = tempfile.mkstemp()
    # with app.app_context():


