const generateEmailTempletes = (name: string,VerificationUrl: string,  ) =>{
    return`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Verify Your Email</title>
</head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:Arial,sans-serif;color:#111827;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0"
    style="padding:32px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0"
          cellpadding="0" style="max-width:560px;background:#ffffff;border-radius:12px;">
          <tr>
            <td align="center" style="padding:32px 24px;background:#111827;border-radius:12px 12px 0 0;">
              <h1 style="margin:0;color:#ffffff;font-size:25px;">
                Verify your email
              </h1>
              <p style="color:#d1d5db;margin-bottom:0;">
                One last step to get started.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:32px 24px;line-height:1.7;">
              <p>Hi <strong>${name}</strong>,</p>

              <p>
                Thanks for creating an account with
                <strong>Submit Koro</strong>!
                Please verify your email address to complete
                your registration.
              </p>

              <table role="presentation" cellspacing="0" cellpadding="0"
                align="center" style="margin:28px auto;">
                <tr>
                  <td bgcolor="#2563eb" style="border-radius:6px;">
                    <a href="${VerificationUrl}"
                      style="display:inline-block;padding:14px 26px;
                      color:#ffffff;text-decoration:none;font-weight:bold;">
                      Verify Email Address
                    </a>
                  </td>
                </tr>
              </table>

              <p style="font-size:13px;color:#6b7280;">
                If the button doesn't work, copy this link into your browser:
              </p>

              <p style="font-size:13px;word-break:break-all;">
                <a href="${VerificationUrl}" style="color:#2563eb;">
                  ${VerificationUrl}
                </a>
              </p>

              <p style="font-size:13px;color:#6b7280;">
                This verification link expires in 15 minutes.
              </p>

              <p>
                If you didn't create this account, you can safely
                ignore this email.
              </p>

              <p style="margin-top:28px;">
                Best regards,<br />
                <strong>The Mridul's Team</strong>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`
}

export default generateEmailTempletes;