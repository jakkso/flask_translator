"""
Contains tests for models
"""

from flask_app.models import UserModel


def test_validate_username() -> None:
    """
    Tests that the username validation function works.
    """
    assert True is UserModel(username="bob@bob.com").validate_username()
    assert False is UserModel(username="bob").validate_username()
    assert True is UserModel(username="b@b.com").validate_username()


def test_validate_password() -> None:
    """
    Testing that basic password validation works
    """
    assert True is UserModel.validate_password(password="1234567891011a")
    assert True is UserModel.validate_password(password="hunter2hunter222")
    assert False is UserModel.validate_password(password="12345")
