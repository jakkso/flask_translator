"""
Contain tests for API endpoints

`app` is a pytest fixture so that each test is repeated with its own flask app
"""
import json

from flask_app.tests import app
from flask_app.resources.endpoints import generate_activation_url
from flask_app.token import token
from settings import Config


def test_registration(app) -> None:
    """
    Tests user registration
    """
    client = app.test_client
    no_body = client().post("/user/registration")
    assert 400 == no_body.status_code
    body = json.loads(no_body.data.decode("utf-8"))
    assert "This field cannot be blank" == body["message"].get("username")

    no_pw = client().post("user/registration", data={"username": "bob"})
    assert 400 == no_pw.status_code
    body = json.loads(no_pw.data.decode("utf-8"))
    assert "This field cannot be blank" == body["message"].get("password")

    no_username = client().post("/user/registration", data={"password": "bob"})
    assert 400 == no_username.status_code
    body = json.loads(no_username.data.decode("utf-8"))
    assert "This field cannot be blank" == body["message"].get("username")

    bad_username = client().post(
        "/user/registration", data={"username": "bob", "password": "hunter2hunter222"}
    )
    assert 400 == bad_username.status_code
    body = json.loads(bad_username.data.decode("utf-8"))
    assert "Invalid email address" == body["message"]

    bad_password = client().post(
        "/user/registration", data={"username": "bob@bob.com", "password": "hunter2"}
    )
    assert 400 == bad_password.status_code
    body = json.loads(bad_password.data.decode("utf-8"))
    assert "Invalid password" == body["message"]

    bob = client().post(
        "/user/registration",
        data={"username": "bob@bob.com", "password": "hunter2hunter222"},
    )
    assert 201 == bob.status_code
    body = json.loads(bob.data.decode("utf-8"))
    assert "User bob@bob.com was created" == body["message"]

    duplicate_bob = client().post(
        "/user/registration",
        data={"username": "bob@bob.com", "password": "hunter2hunter222"},
    )
    assert 400 == duplicate_bob.status_code
    body = json.loads(duplicate_bob.data.decode("utf-8"))
    assert "User bob@bob.com already exists" == body["message"]


def test_activate_put(app) -> None:
    """
    Tests activation functionality get request
    """
    client = app.test_client
    client().post(
        "/user/registration",
        data={"username": "bob@bob.com", "password": "hunter2hunter222"},
    )
    # Good request
    resp = client().put(
        "/user/activate",
        data={"token": token.generate_confirmation_token("bob@bob.com")},
    )
    assert 201 == resp.status_code
    body = json.loads(resp.data.decode("utf-8"))
    assert "User bob@bob.com has been verified" == body["message"]
    # Already activated email
    resp = client().put(
        "/user/activate",
        data={"token": token.generate_confirmation_token("bob@bob.com")},
    )
    assert 200 == resp.status_code
    body = json.loads(resp.data.decode("utf-8"))
    assert "User already verified" == body["message"]
    # Bad token
    resp = client().put("/user/activate", data={"token": ""})
    assert 406 == resp.status_code
    body = json.loads(resp.data.decode("utf-8"))
    assert "Confirmation link has expired or is invalid" == body["message"]
    bad_email = token.generate_confirmation_token("not_bob@bob.com")
    # Unregistered email
    resp = client().put("/user/activate", data={"token": bad_email})
    assert 400 == resp.status_code
    body = json.loads(resp.data.decode("utf-8"))
    assert "User not_bob@bob.com does not exist" == body["message"]


def test_activate_post(app) -> None:
    """
    Test activation post request
    """
    data = {"username": "", "password": ""}
    client = app.test_client
    client().post(
        "/user/registration",
        data={"username": "bob@bob.com", "password": "hunter2hunter222"},
    )
    resp = client().post("/user/activate", data=data)
    body = json.loads(resp.data.decode("utf-8"))
    assert 400 == resp.status_code
    assert "Bad credentials" == body["message"]
    data["username"] = "bob@bob.com"
    resp = client().post("/user/activate", data=data)
    body = json.loads(resp.data.decode("utf-8"))
    assert resp.status_code == 400
    assert body["message"] == "Bad credentials"
    data["password"] = "hunter2hunter222"
    resp = client().post("/user/activate", data=data)
    body = json.loads(resp.data.decode("utf-8"))
    assert 201 == resp.status_code
    assert "Verification email sent" == body["message"]
    client().put(
        "/user/activate",
        data={"token": token.generate_confirmation_token("bob@bob.com")},
    )
    resp = client().post("/user/activate", data=data)
    body = json.loads(resp.data.decode("utf-8"))
    assert 400 == resp.status_code
    assert "User bob@bob.com already verified" == body["message"]


def test_login(app) -> None:
    """
    Login test
    """
    client = app.test_client
    data = {}
    no_data = client().post("/user/login", data=data)
    assert no_data.status_code == 400
    client().post(
        "/user/registration",
        data={"username": "bob@bob.com", "password": "hunter2hunter222"},
    )
    unverified = client().post(
        "/user/login", data={"username": "bob@bob.com", "password": "hunter2hunter222"}
    )
    assert unverified.status_code == 401
    body = json.loads(unverified.data.decode("utf-8"))
    assert body["message"] == "Unverified email address"
    client().put(
        "/user/activate",
        data={"token": token.generate_confirmation_token("bob@bob.com")},
    )
    data = {"username": "bob@bob.com", "password": ""}
    bad_pw = client().post("/user/login", data=data)
    assert bad_pw.status_code == 400
    data["password"] = "hunter2hunter222"
    success = client().post("/user/login", data=data)
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
    assert 401 == no_token.status_code
    client().post(
        "/user/registration",
        data={"username": "bob@bob.com", "password": "hunter2hunter222"},
    )
    client().put(
        "/user/activate",
        data={"token": token.generate_confirmation_token("bob@bob.com")},
    )
    bob = client().post(
        "/user/login", data={"username": "bob@bob.com", "password": "hunter2hunter222"}
    )
    body = json.loads(bob.data.decode("utf-8"))
    access_token = body["access_token"]
    headers = {"Authorization": f"Bearer {access_token}"}
    invalidate_access = client().post("/logout/access", headers=headers)
    assert 202 == invalidate_access.status_code
    body = json.loads(invalidate_access.data.decode("utf-8"))
    assert "Access token has been revoked" == body["message"]
    revoked_token = client().post("/logout/access", headers=headers)
    assert 401 == revoked_token.status_code


def test_logout_refresh(app) -> None:
    """
    Test logout of refresh token functionality
    """
    client = app.test_client
    no_token = client().post("/logout/access")
    assert 401 == no_token.status_code
    client().post(
        "/user/registration",
        data={"username": "bob@bob.com", "password": "hunter2hunter222"},
    )
    client().put(
        "/user/activate",
        data={"token": token.generate_confirmation_token("bob@bob.com")},
    )
    bob = client().post(
        "/user/login", data={"username": "bob@bob.com", "password": "hunter2hunter222"}
    )
    body = json.loads(bob.data.decode("utf-8"))
    refresh_token = body["refresh_token"]
    headers = {"Authorization": f"Bearer {refresh_token}"}
    invalidate_refresh = client().post("/logout/refresh", headers=headers)
    assert 202 == invalidate_refresh.status_code
    body = json.loads(invalidate_refresh.data.decode("utf-8"))
    assert "Refresh token has been revoked" == body["message"]
    revoked_token = client().post("/logout/refresh", headers=headers)
    assert 401 == revoked_token.status_code


def test_refresh_access(app) -> None:
    """
    Tests refreshing access token functionality
    """
    client = app.test_client
    client().post(
        "/user/registration",
        data={"username": "bob@bob.com", "password": "hunter2hunter222"},
    )
    client().put(
        "/user/activate",
        data={"token": token.generate_confirmation_token("bob@bob.com")},
    )
    bob = client().post(
        "/user/login", data={"username": "bob@bob.com", "password": "hunter2hunter222"}
    )
    body = json.loads(bob.data.decode("utf-8"))
    access_token = body["access_token"]
    refresh_token = body["refresh_token"]
    no_token = client().post("/token/refresh")
    assert 401 == no_token.status_code
    headers = {"Authorization": f"Bearer {access_token}"}
    bad_token = client().post("/token/refresh", headers=headers)
    assert 422 == bad_token.status_code
    headers = {"Authorization": f"Bearer {refresh_token}"}
    good_token = client().post("/token/refresh", headers=headers)
    assert 200 == good_token.status_code
    body = json.loads(good_token.data.decode("utf-8"))
    assert access_token != body["access_token"]


def test_reset_password(app) -> None:
    client = app.test_client
    client().post(
        "/user/registration",
        data={"username": "bob@bob.com", "password": "hunter2hunter222"},
    )
    resp = client().post("/user/reset_password", query_string={})
    body = json.loads(resp.data.decode("utf-8"))
    assert 400 == resp.status_code
    assert body["message"] == {"username": "This field cannot be blank"}
    resp = client().post("/user/reset_password", data={"username": "not@bob.com"})
    assert resp.status_code == 200
    body = json.loads(resp.data.decode("utf-8"))
    assert body["message"] == "Attempted password reset"
    resp = client().post("/user/reset_password", data={"username": "bob@bob.com"})
    assert resp.status_code == 200
    assert body["message"] == "Attempted password reset"
    password = "hunter2hunter2hunter2"
    token_ = token.generate_confirmation_token("bob@bob.com")
    resp = client().put(
        "/user/reset_password", data={"token": token_, "password": password}
    )
    assert resp.status_code == 201
    bad_token = token.generate_confirmation_token("not@bob.com")
    body = json.loads(resp.data.decode("utf-8"))
    assert body["message"] == "Password updated"
    resp = client().put(
        "/user/reset_password", data={"token": bad_token, "password": password}
    )
    assert resp.status_code == 400
    body = json.loads(resp.data.decode("utf-8"))
    assert body["message"] == "Invalid username"
    resp = client().put(
        "/user/reset_password", data={"token": token_, "password": "hunter2"}
    )
    assert resp.status_code == 400
    body = json.loads(resp.data.decode("utf-8"))
    assert body["message"] == "Invalid password"
    bad_token = "bob@bob.com"
    resp = client().put(
        "/user/reset_password", data={"token": bad_token, "password": "hunter2"}
    )
    assert resp.status_code == 406
    body = json.loads(resp.data.decode("utf-8"))
    assert body["message"] == "Confirmation link has expired or is invalid"


def test_delete_account(app) -> None:
    client = app.test_client
    client().post(
        "/user/registration",
        data={"username": "bob@bob.com", "password": "hunter2hunter222"},
    )
    resp = client().delete(
        "/user/delete", data={"username": "not@bob.com", "password": "hunter2"}
    )
    assert resp.status_code == 400
    body = json.loads(resp.data.decode("utf-8"))
    assert body["message"] == "Bad credentials"
    resp = client().delete(
        "/user/delete", data={"username": "bob@bob.com", "password": "hunter2"}
    )
    assert resp.status_code == 400
    body = json.loads(resp.data.decode("utf-8"))
    assert body["message"] == "Bad credentials"
    resp = client().delete(
        "/user/delete", data={"username": "bob@bob.com", "password": "hunter2hunter222"}
    )
    assert 202 == resp.status_code
    body = json.loads(resp.data.decode("utf-8"))
    assert body["message"] == "User bob@bob.com deleted"


def test_generate_url() -> None:
    """
    Tests generation of urls
    :return:
    """
    token = "123456"
    url = generate_activation_url("token", token)
    assert Config.FRONT_END_URL + "?" + f"token={token}" == url
