const nodemailer = require('nodemailer');

let transporter = null;
let testAccountEmail = null; // Ethereal preview address (dev only)

async function getTransporter() {
  if (transporter) return transporter;

  const hasSmtp = process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASSWORD;

  if (hasSmtp) {
    // Production / configured SMTP (SendGrid, Resend SMTP, SES, Mailgun, etc.)
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: parseInt(process.env.SMTP_PORT || '587') === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD
      }
    });
    console.log(`✓ Email: using SMTP at ${process.env.SMTP_HOST}`);
  } else if (process.env.NODE_ENV !== 'production') {
    // Development fallback: Ethereal — creates a free throwaway inbox automatically
    const testAccount = await nodemailer.createTestAccount();
    testAccountEmail = testAccount.user;
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass
      }
    });
    console.log(`✓ Email: using Ethereal test account (${testAccount.user})`);
    console.log(`  Preview emails at: https://ethereal.email`);
  } else {
    // Production with no SMTP configured — log warning but don't crash
    console.warn('⚠  Email: no SMTP configured. Password reset emails will not be sent.');
    return null;
  }

  return transporter;
}

/**
 * Send a password reset email.
 * Returns { ok: true, previewUrl? } or { ok: false, error }.
 */
async function sendPasswordResetEmail(toEmail, resetToken) {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}`;
  const fromAddress = process.env.SMTP_FROM || 'noreply@unclinq.app';

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#F5F0EB;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F5F0EB;padding:40px 20px;">
    <tr><td align="center">
      <table width="100%" style="max-width:480px;background:#FDFAF7;border-radius:16px;padding:40px;border:1px solid rgba(0,0,0,0.06);">
        <tr><td>
          <p style="margin:0 0 8px;color:#C06C54;font-size:13px;letter-spacing:0.08em;text-transform:uppercase;font-weight:500;">Unclinq</p>
          <h1 style="margin:0 0 16px;font-size:24px;font-weight:500;color:#1A1A18;letter-spacing:-0.02em;">Reset your password</h1>
          <p style="margin:0 0 28px;color:#6B6B67;font-size:15px;line-height:1.6;">
            We received a request to reset the password for your Unclinq account.<br>
            Click the button below to choose a new password.
          </p>
          <a href="${resetUrl}"
             style="display:inline-block;padding:14px 28px;background:#C06C54;color:#fff;text-decoration:none;border-radius:12px;font-size:15px;font-weight:500;letter-spacing:-0.01em;">
            Reset password
          </a>
          <p style="margin:28px 0 0;color:#9B9B97;font-size:13px;line-height:1.5;">
            This link expires in <strong>1 hour</strong>. If you didn't request this, you can safely ignore this email — your password won't change.
          </p>
          <hr style="margin:28px 0;border:none;border-top:1px solid rgba(0,0,0,0.06);">
          <p style="margin:0;color:#C0BDB8;font-size:12px;">
            Or copy this URL into your browser:<br>
            <span style="color:#9B9B97;word-break:break-all;">${resetUrl}</span>
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>
  `.trim();

  try {
    const t = await getTransporter();
    if (!t) {
      // No transporter (production, no SMTP) — log the link as a last resort
      console.warn(`[EMAIL SKIPPED] Password reset link for ${toEmail}: ${resetUrl}`);
      return { ok: true }; // Return ok so the API doesn't expose SMTP config state
    }

    const info = await t.sendMail({
      from: `"Unclinq" <${fromAddress}>`,
      to: toEmail,
      subject: 'Reset your Unclinq password',
      text: `Reset your Unclinq password\n\nClick here to reset: ${resetUrl}\n\nThis link expires in 1 hour. If you didn't request this, ignore this email.`,
      html
    });

    const result = { ok: true };

    // In dev with Ethereal, log the preview URL so you can see the email
    if (process.env.NODE_ENV !== 'production') {
      const previewUrl = nodemailer.getTestMessageUrl(info);
      if (previewUrl) {
        console.log(`[DEV] Password reset email preview: ${previewUrl}`);
        result.previewUrl = previewUrl;
      }
    }

    return result;
  } catch (err) {
    console.error('Failed to send password reset email:', err.message);
    return { ok: false, error: err.message };
  }
}

/**
 * Send a 6-digit OTP verification email.
 * Returns { ok: true, previewUrl? } or { ok: false, error }.
 */
async function sendOtpEmail(toEmail, code, purpose = 'login') {
  const fromAddress = process.env.SMTP_FROM || 'noreply@unclinq.app';
  const action = purpose === 'register' ? 'create your account' : 'sign in';

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#F5F0EB;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F5F0EB;padding:40px 20px;">
    <tr><td align="center">
      <table width="100%" style="max-width:480px;background:#FDFAF7;border-radius:16px;padding:40px;border:1px solid rgba(0,0,0,0.06);">
        <tr><td>
          <p style="margin:0 0 8px;color:#C06C54;font-size:13px;letter-spacing:0.08em;text-transform:uppercase;font-weight:500;">Unclinq</p>
          <h1 style="margin:0 0 16px;font-size:24px;font-weight:500;color:#1A1A18;letter-spacing:-0.02em;">Your sign-in code</h1>
          <p style="margin:0 0 28px;color:#6B6B67;font-size:15px;line-height:1.6;">
            Use this code to ${action}. It expires in <strong>10 minutes</strong>.
          </p>
          <div style="background:#F5F0EB;border-radius:12px;padding:24px;text-align:center;margin-bottom:28px;">
            <span style="font-size:40px;font-weight:600;letter-spacing:0.18em;color:#1A1A18;font-family:'Courier New',monospace;">${code}</span>
          </div>
          <p style="margin:0;color:#9B9B97;font-size:13px;line-height:1.5;">
            If you didn't request this code, you can safely ignore this email.
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>
  `.trim();

  try {
    const t = await getTransporter();
    if (!t) {
      console.warn(`[EMAIL SKIPPED] OTP for ${toEmail}: ${code}`);
      return { ok: true };
    }

    const info = await t.sendMail({
      from: `"Unclinq" <${fromAddress}>`,
      to: toEmail,
      subject: `${code} is your Unclinq code`,
      text: `Your Unclinq sign-in code is: ${code}\n\nIt expires in 10 minutes. If you didn't request this, ignore this email.`,
      html
    });

    const result = { ok: true };
    if (process.env.NODE_ENV !== 'production') {
      const previewUrl = nodemailer.getTestMessageUrl(info);
      if (previewUrl) {
        console.log(`[DEV] OTP email preview: ${previewUrl}`);
        result.previewUrl = previewUrl;
      }
    }
    return result;
  } catch (err) {
    console.error('Failed to send OTP email:', err.message);
    return { ok: false, error: err.message };
  }
}

module.exports = { sendPasswordResetEmail, sendOtpEmail };
