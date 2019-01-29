"""
Tests token module
"""

from flask_app.token import token


def test_generate_token() -> None:
    email = "bob@bob.com"
    t = token.generate_confirmation_token(email)
    assert isinstance(t, str)
    decoded = token.confirm_token(t, -2)
    assert False is decoded
    malformed = token.confirm_token("dfdds")
    assert False is malformed
    malformed = token.confirm_token(t[4:-5])
    assert False is malformed
    decoded = token.confirm_token(t)
    assert email == decoded
