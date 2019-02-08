"""
Contains tests for models
"""

from flask_app.models import UserModel
from flask_app.tests import app


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


def test_find_username(app) -> None:
    with app.app_context():
        none = UserModel.find_by_username("bob@bob.com")
        assert none is None
        bob = UserModel(username="bob@bob.com", password="hunter2")
        bob.save_to_db()
        bob = UserModel.find_by_username("bob@bob.com")
        assert bob is not None


def test_delete_all(app) -> None:
    with app.app_context():
        resp = UserModel.delete_all()
        assert resp["message"] == "0 row(s) deleted"
        bob = UserModel(username="bob@bob.com", password="hunter2")
        bob.save_to_db()
        not_bob = UserModel(username="not@bob.com", password="hunter2")
        not_bob.save_to_db()
        resp = UserModel.delete_all()
        assert resp["message"] == "2 row(s) deleted"


def test_delete_user(app) -> None:
    with app.app_context():
        bob = UserModel(username="bob@bob.com", password="hunter2")
        bob.save_to_db()
        not_bob = UserModel(username="not@bob.com", password="hunter2")
        not_bob.save_to_db()
        users = UserModel.return_all()
        assert 2 == len(users)
        resp = UserModel.delete_user("not@bob.com")
        assert resp["message"] == "User not@bob.com deleted"
        assert 1 == len(UserModel.return_all())
        resp = UserModel.delete_user("fake_user")
        assert {"message": "User not found"} == resp
