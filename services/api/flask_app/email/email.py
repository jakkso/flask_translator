"""
Contains email sending functionality
"""

from flask_mail import Message

from flask_app import mail
from settings import Config


def send_email(to: str, subject: str, html: str) -> None:
    """

    :param to: email address
    :param subject:
    :param html: rendered html
    :return:
    """
    msg = Message(
        subject, recipients=[to], html=html, sender=Config.MAIL_DEFAULT_SENDER
    )
    mail.send(msg)
