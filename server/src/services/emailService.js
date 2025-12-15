import nodemailer from 'nodemailer';

// Create transporter (configure with your email service)
const createTransporter = () => {
  const emailService = process.env.EMAIL_SERVICE || 'gmail';
  
  // Gmail configuration
  if (emailService === 'gmail') {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      host: 'smtp.gmail.com',
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD // Use App Password for Gmail
      }
    });
    return transporter;
  }
  
  // Generic SMTP configuration
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER || process.env.EMAIL_USER,
      pass: process.env.SMTP_PASS || process.env.EMAIL_PASSWORD
    }
  });

  return transporter;
};

export const sendEmail = async (to, subject, html, text = null) => {
  try {
    // Check if email credentials are configured
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      console.log(`[Email Service] Email credentials not configured. Would send email to ${to}`);
      console.log(`Subject: ${subject}`);
      console.log(`Body: ${html}`);
      // Extract OTP from HTML for console logging
      const otpMatch = html.match(/<div class="otp-code">(\d+)<\/div>/);
      if (otpMatch) {
        console.log(`[OTP Code]: ${otpMatch[1]}`);
      }
      return { success: true };
    }

    const transporter = createTransporter();
    
    // Parse EMAIL_FROM format: "Name <email@domain.com>" or just "email@domain.com"
    let fromEmail = process.env.EMAIL_FROM || process.env.EMAIL_USER || 'noreply@gymos.com';
    
    const mailOptions = {
      from: fromEmail,
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, '') // Strip HTML for text version
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent successfully to ${to}: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Email sending error:', error.message);
    console.error('Full error:', error);
    
    // Extract OTP from HTML for console logging if email fails
    const otpMatch = html.match(/<div class="otp-code">(\d+)<\/div>/);
    if (otpMatch) {
      console.log(`[OTP Code for manual entry]: ${otpMatch[1]}`);
    }
    
    // In development, log OTP but don't throw if email fails
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Email Service] Email failed but continuing in dev mode`);
      return { success: true };
    }
    throw error;
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

