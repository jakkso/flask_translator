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


def test_login(app) -> None:
    """
    Login test
    """
    client = app.test_client
    data = {}
    no_data = client().post("/login", data=data)
    assert no_data.status_code == 400
    client().post("/registration", data={"username": "bob", "password": "hunter2"})
    data = {"username": "bob", "password": ""}
    bad_pw = client().post("/login", data=data)
    assert bad_pw.status_code == 400
    data["password"] = "hunter2"
    success = client().post("/login", data=data)
    assert success.status_code == 200
    body = json.loads(success.data.decode("utf-8"))
    assert body["access_token"] is not None
    assert body["refresh_token"] is not None


def test_logout_access(app) -> None:
    """
    Test logout access token functionality
    """
    client = app.test_client
    no_token = client().post("/logout/access")
    assert no_token.status_code == 401
    bob = client().post(
        "/registration", data={"username": "bob", "password": "hunter2"}
    )
    body = json.loads(bob.data.decode("utf-8"))
    access_token = body["access_token"]
    headers = {"Authorization": f"Bearer {access_token}"}
    invalidate_access = client().post("/logout/access", headers=headers)
    assert invalidate_access.status_code == 202
    revoked_token = client().post("/logout/access", headers=headers)
    assert revoked_token.status_code == 401


def test_logout_refresh(app) -> None:
    """
    Test logout of refresh token functionality
    """
    client = app.test_client
    no_token = client().post("/logout/access")
    assert no_token.status_code == 401
    bob = client().post(
        "/registration", data={"username": "bob", "password": "hunter2"}
    )
    body = json.loads(bob.data.decode("utf-8"))
    refresh_token = body['refresh_token']
    headers = {'Authorization': f'Bearer {refresh_token}'}
    invalidate_refresh = client().post('/logout/refresh', headers=headers)
    assert invalidate_refresh.status_code == 202
    revoked_token = client().post("/logout/refresh", headers=headers)
    assert revoked_token.status_code == 401


