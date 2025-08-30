import nodemailer from 'nodemailer';

// Create transporter
const createTransporter = () => {
  if (process.env.NODE_ENV === 'test') {
    // Use ethereal email for testing
    return nodemailer.createTransporter({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: 'test@ethereal.email',
        pass: 'test123'
      }
    });
  }

  return nodemailer.createTransporter({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_PORT === '465', // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    tls: {
      rejectUnauthorized: false
    }
  });
};

// Email templates
const emailTemplates = {
  articleSubmitted: (userName, articleTitle) => ({
    subject: 'Your Article Has Been Submitted',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Article Submission Confirmation</h2>
        <p>Hello ${userName},</p>
        <p>Your article "<strong>${articleTitle}</strong>" has been successfully submitted and is currently under review.</p>
        <p>We'll notify you once it's been approved or if any changes are needed.</p>
        <p>Thank you for contributing to Devnovate!</p>
        <br>
        <p>Best regards,<br>The Devnovate Team</p>
      </div>
    `
  }),

  articleApproved: (userName, articleTitle) => ({
    subject: 'Your Article Has Been Approved!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #28a745;">Article Approved! 🎉</h2>
        <p>Hello ${userName},</p>
        <p>Great news! Your article "<strong>${articleTitle}</strong>" has been approved and is now live on our platform.</p>
        <p>Readers can now view, like, and comment on your article.</p>
        <p>Keep up the great work!</p>
        <br>
        <p>Best regards,<br>The Devnovate Team</p>
      </div>
    `
  }),

  articleRejected: (userName, articleTitle, reason) => ({
    subject: 'Article Review Update',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc3545;">Article Review Update</h2>
        <p>Hello ${userName},</p>
        <p>Your article "<strong>${articleTitle}</strong>" requires some modifications before it can be published.</p>
        <p><strong>Reason:</strong> ${reason}</p>
        <p>Please review the feedback and submit an updated version. We're here to help you succeed!</p>
        <br>
        <p>Best regards,<br>The Devnovate Team</p>
      </div>
    `
  }),

  newComment: (userName, articleTitle, commenterName) => ({
    subject: 'New Comment on Your Article',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #007bff;">New Comment Received</h2>
        <p>Hello ${userName},</p>
        <p>${commenterName} just commented on your article "<strong>${articleTitle}</strong>".</p>
        <p>Log in to your account to view and respond to the comment.</p>
        <br>
        <p>Best regards,<br>The Devnovate Team</p>
      </div>
    `
  })
};

// Send email function
export const sendEmail = async (to, templateName, templateData = {}) => {
  try {
    const transporter = createTransporter();
    
    if (!emailTemplates[templateName]) {
      throw new Error(`Email template '${templateName}' not found`);
    }

    const template = emailTemplates[templateName](...Object.values(templateData));
    
    const mailOptions = {
      from: process.env.SMTP_FROM || 'noreply@devnovate.com',
      to,
      subject: template.subject,
      html: template.html
    };

    const info = await transporter.sendMail(mailOptions);
    
    if (process.env.NODE_ENV === 'test') {
      console.log('📧 Test email sent:', nodemailer.getTestMessageUrl(info));
    } else {
      console.log('📧 Email sent successfully to:', to);
    }
    
    return info;
  } catch (error) {
    console.error('❌ Email sending failed:', error.message);
    throw error;
  }
};

// Verify transporter connection
export const verifyConnection = async () => {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    console.log('✅ Email server connection verified');
    return true;
  } catch (error) {
    console.error('❌ Email server connection failed:', error.message);
    return false;
  }
};
