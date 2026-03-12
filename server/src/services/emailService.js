import { Resend } from 'resend';

// Initialize Resend with the API key
// (Provide a mock instance if key is missing so the app doesn't crash)
const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

export const sendEmail = async (to, subject, html, text = null) => {
  try {
    // Check if email credentials are configured
    if (!resend) {
      console.log(`\n=========================================\n`);
      console.log(`[Email Service - DEV MODE] Email credentials not configured.`);
      console.log(`Would send email to: ${to}`);
      console.log(`Subject: ${subject}`);

      // Extract OTP from HTML for console logging
      const otpMatch = html.match(/<div class="otp-code">(\d+)<\/div>/);
      if (otpMatch) {
        console.log(`\n👉 [OTP CODE]: ${otpMatch[1]} 👈\n`);
      }
      console.log(`\n=========================================\n`);
      return { success: true };
    }

    // Parse EMAIL_FROM format or use Resend's default testing email
    let fromEmail = process.env.EMAIL_FROM || 'onboarding@resend.dev';

    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, '') // Strip HTML for text version
    });

    if (error) {
      console.error('❌ Resend API Error:', error);
      throw error;
    }

    console.log(`✅ Email sent successfully to ${to}: ${data.id}`);
    return { success: true, messageId: data.id };
  } catch (error) {
    console.error('❌ Email sending error:', error.message);
    console.error('Full error:', error);

    // Extract OTP from HTML for console logging if email fails
    const otpMatch = html.match(/<div class="otp-code">(\d+)<\/div>/);
    if (otpMatch) {
      console.log(`\n\n[URGENT] Email delivery failed, but here is the requested OTP Code: ${otpMatch[1]}\n\n`);
    }

    // In production on Railway/Vercel, we swallow the error so the frontend 
    // doesn't crash the user with a 500 error during testing if they don't have Resend setup yet.
    console.log(`[Email Service] Warning: Email failed to send due to API error. User can proceed via console logs.`);
    return { success: false, message: 'Email failed to send. OTP printed to console.' };
  }
};

export const sendWelcomeEmail = async (user) => {
  const subject = 'Welcome to GymOS';
  const html = `
    <h1>Welcome to GymOS!</h1>
    <p>Hi ${user.firstName || user.email},</p>
    <p>Your account has been created successfully.</p>
  `;

  return await sendEmail(user.email, subject, html);
};

export const sendOtpEmail = async (email, otp, role = null) => {
  const subject = 'Your GymOS Login OTP';
  const roleText = role === 'super_admin' ? 'Super Admin' : role === 'owner' ? 'Gym Owner' : 'User';

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #2563eb; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
        .content { background-color: #f9fafb; padding: 30px; border-radius: 0 0 5px 5px; }
        .otp-box { background-color: white; border: 2px solid #2563eb; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0; }
        .otp-code { font-size: 32px; font-weight: bold; color: #2563eb; letter-spacing: 5px; }
        .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px; }
        .warning { color: #dc2626; font-size: 14px; margin-top: 15px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>GymOS Login OTP</h1>
        </div>
        <div class="content">
          <p>Hello,</p>
          <p>You have requested a login OTP for your ${roleText} account.</p>
          <div class="otp-box">
            <p style="margin: 0 0 10px 0; color: #6b7280;">Your OTP code is:</p>
            <div class="otp-code">${otp}</div>
          </div>
          <p>This code will expire in <strong>10 minutes</strong>.</p>
          <p class="warning">If you did not request this OTP, please ignore this email.</p>
          <p>Best regards,<br>The GymOS Team</p>
        </div>
        <div class="footer">
          <p>This is an automated email. Please do not reply.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return await sendEmail(email, subject, html);
};

