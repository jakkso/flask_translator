"""
Contains test fixture for testing endpoints
"""
import pytest

from flask_app import create_app


@pytest.fixture()
def app():
    """
    Fixture for running tests
    :return:
    """
    test_config = {"TESTING": True, "SQLALCHEMY_DATABASE_URI": "sqlite:///:memory:"}
    app = create_app(test_config)
    yield app
