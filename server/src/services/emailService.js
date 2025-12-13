// Email service - basic structure
// Can be extended with nodemailer, SendGrid, etc.

export const sendEmail = async (to, subject, html) => {
  // Placeholder for email service
  // In production, integrate with:
  // - Nodemailer
  // - SendGrid
  // - AWS SES
  // - etc.
  
  console.log(`[Email Service] Would send email to ${to}`);
  console.log(`Subject: ${subject}`);
  console.log(`Body: ${html}`);
  
  return { success: true };
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

