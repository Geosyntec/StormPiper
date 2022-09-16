from textwrap import dedent


def reset_password(*, email, token, name=None, reset_url="", **kwargs):

    name = name or "Dear User"

    template = {
        "Messages": [
            {
                "From": {
                    "Email": "noreply@tacomawatersheds.com",
                    "Name": "Tacoma Watersheds Administrators",
                },
                "To": [{"Email": email, "Name": name}],
                "Subject": f"Password Reset Requested for Tacoma Watersheds",
                "TextPart": f"Hello {name}, Your reset token is:\n{token}\n\nYour reset link is:\n{reset_url}",
                "HTMLPart": f"""
                    <p>Hello {name},</p>
                    <p>Your reset token is: </p>
                    <p>{token}</p>
                    <p>Your reset link is: </p>
                    <p>{reset_url}</p>
                    """,
            }
        ]
    }

    return template


def request_verify(*, email, token, name=None, verify_url="", **kwargs):

    name = name or "Dear User"

    template = {
        "Messages": [
            {
                "From": {
                    "Email": "noreply@tacomawatersheds.com",
                    "Name": "Tacoma Watersheds Administrators",
                },
                "To": [{"Email": email, "Name": name}],
                "Subject": f"Email Verification Code for Tacoma Watersheds",
                "TextPart": f"Hello {name}, Your verification token is:\n{token}\n\nYour verification link is:\n{verify_url}",
                "HTMLPart": f"""
                    <p>Hello {name},</p>
                    <p>Your verification token is: </p>
                    <p>{token}</p>
                    <p>Your verification link is: </p>
                    <p>{verify_url}</p>
                    """,
            }
        ]
    }

    return template


def welcome_verify(*, email, token, name=None, verify_url="", **kwargs):

    name = name or "New User"

    template = {
        "Messages": [
            {
                "From": {
                    "Email": "noreply@tacomawatersheds.com",
                    "Name": "Tacoma Watersheds Administrators",
                },
                "To": [{"Email": email, "Name": name}],
                "Subject": f"Welcome to Tacoma Watersheds",
                "TextPart": dedent(
                    f"""Welcome {name},
                    Thank you for registering for access to the Tacoma Watersheds Application.

                    Please follow the link below to verify your email address and access the site.

                    Your verification link is:\n{verify_url}
                    """
                ),
                "HTMLPart": f"""
                    <p>Welcome {name},</p>
                    <p>Thank you for registering for access to the Tacoma Watersheds Application.</p>
                    <p></p>
                    <p>Please follow the link below to verify your email address and access the site. </p>
                    <p>{verify_url}</p>
                    <em>This link expires after one hour.</em>
                    """,
            }
        ]
    }

    return template


def error_message(*, email_dict_list, content, attachments=None, **kwargs):

    template = {
        "Messages": [
            {
                "From": {
                    "Email": "noreply@tacomawatersheds.com",
                    "Name": "Tacoma Watersheds Administrators",
                },
                "To": email_dict_list,
                "Subject": f"Error from Tacoma Watersheds",
                "TextPart": content,
                "Attachments": attachments or [],
            }
        ]
    }

    return template
