from datetime import datetime

from django.template.loader import render_to_string


def render_otp_email(otp_code: str, username: str) -> str:
    """Genera el HTML del email con el codigo OTP."""
    return render_to_string("email/auth/otp_login.html", {
        "otp_code": otp_code,
        "username": username,
        "year": datetime.now().year,
    })
