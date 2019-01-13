"""
Contain tests for API endpoints
"""
import json

from flask_app.tests import app


def test_registration(app) -> None:
    """
    Tests user registration
    """
    client = app.test_client
    no_body = client().post("/registration")
    assert no_body.status_code == 400
    body = json.loads(no_body.data.decode("utf-8"))
    assert body["message"].get("username") == "This field cannot be blank"

    no_pw = client().post("/registration", data={"username": "bob"})
    assert no_pw.status_code == 400
    body = json.loads(no_pw.data.decode("utf-8"))
    assert body["message"].get("password") == "This field cannot be blank"

    no_username = client().post("/registration", data={"password": "bob"})
    assert no_username.status_code == 400
    body = json.loads(no_username.data.decode("utf-8"))
    assert body["message"].get("username") == "This field cannot be blank"

    bob = client().post(
        "/registration", data={"username": "bob", "password": "hunter2"}
    )
    assert bob.status_code == 201
    body = json.loads(bob.data.decode("utf-8"))
    assert body["message"] == "User bob was created"
    assert body["access_token"] is not None
    assert body["refresh_token"] is not None

    duplicate_bob = client().post(
        "/registration", data={"username": "bob", "password": "hunter2"}
    )
    assert duplicate_bob.status_code == 400
    body = json.loads(duplicate_bob.data.decode("utf-8"))
    assert body["message"] == "User bob already exists"
