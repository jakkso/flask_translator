"""
Contains test fixture for testing endpoints
"""
import pytest

from settings import Config
from flask_app import create_app, db


@pytest.fixture()
def app():
    """
    Fixture for running tests
    :return:
    """
    test_config = {"TESTING": True, "SQLALCHEMY_DATABASE_URI": Config.TESTING_DB_URL}
    app = create_app(test_config)
    yield app
    with app.app_context():
        db.session.remove()
        db.drop_all()
