import { Resend } from 'resend';
import nodemailer from 'nodemailer';

// Initialize Resend with the API key
const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

// Initialize Nodemailer transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT) || 465, // Default 465 for implicit SSL
    secure: process.env.SMTP_PORT ? process.env.SMTP_SECURE === 'true' : true,
    auth: {
      user: process.env.SMTP_USER || process.env.EMAIL_USER,
      pass: process.env.SMTP_PASS || process.env.EMAIL_PASSWORD
    },
    tls: {
      rejectUnauthorized: process.env.NODE_ENV === 'production'
    },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000
  });
};

export const sendEmail = async (to, subject, html, text = null) => {
  try {
    const provider = process.env.EMAIL_PROVIDER || process.env.EMAIL_SERVICE || 'smtp'; // e.g. 'resend', 'smtp', or 'gmail'
    let fromEmail = process.env.EMAIL_FROM || process.env.EMAIL_USER || 'noreply@gymos.com';
    const cleanText = text || html.replace(/<[^>]*>/g, ''); // Strip HTML for text version

    // RESEND PROVIDER
    if (provider === 'resend' || provider === 'RESEND') {
      if (!resend) {
        console.log(`\n[Email Service - DEV MODE] Resend API Key not configured.`);

        // Extract OTP from HTML for console logging
        const otpMatch = html.match(/<div class="otp-code">(\d+)<\/div>/);
        if (otpMatch) {
          console.log(`\n👉 [OTP CODE]: ${otpMatch[1]} 👈\n`);
        }
        return { success: true };
      }

      // Resend free tier usually requires onboarding@resend.dev unless domain is verified
      if (!process.env.EMAIL_FROM) {
        fromEmail = 'onboarding@resend.dev';
      }

      const { data, error } = await resend.emails.send({
        from: fromEmail,
        to,
        subject,
        html,
        text: cleanText
      });

      if (error) {
        console.error('❌ Resend API Error:', error);
        throw error;
      }

      console.log(`✅ Email sent successfully to ${to} via Resend: ${data.id}`);
      return { success: true, messageId: data.id };

      // SMTP PROVIDER
    } else {
      if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
        console.log(`\n[Email Service - DEV MODE] SMTP Email credentials not configured.`);

        // Extract OTP from HTML for console logging 
        const otpMatch = html.match(/<div class="otp-code">(\d+)<\/div>/);
        if (otpMatch) {
          console.log(`\n👉 [OTP CODE]: ${otpMatch[1]} 👈\n`);
        }
        return { success: true };
      }

      const transporter = createTransporter();
      const mailOptions = {
        from: fromEmail,
        to,
        subject,
        html,
        text: cleanText
      };

      const info = await transporter.sendMail(mailOptions);
      console.log(`✅ Email sent successfully to ${to} via SMTP: ${info.messageId}`);
      return { success: true, messageId: info.messageId };
    }
  } catch (error) {
    console.error('❌ Email sending error:', error.message);
    console.error('Full error:', error);

    // Extract OTP from HTML for console logging if email fails
    const otpMatch = html.match(/<div class="otp-code">(\d+)<\/div>/);
    if (otpMatch) {
      console.log(`\n\n[URGENT] Email delivery failed, but here is the requested OTP Code: ${otpMatch[1]}\n\n`);
    }

    // Swallow error for frontend continuity
    console.log(`[Email Service] Warning: Email failed to send due to API/Network error. User can proceed via OTP printed in console logs.`);
    return { success: false, message: 'Email failed to send. OTP printed to server console.' };
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
