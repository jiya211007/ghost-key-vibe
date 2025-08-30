import nodemailer from 'nodemailer';
import { readFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = join(__filename, '..');

class EmailService {
  constructor() {
    this.transporter = null;
    this.initializeTransporter();
  }

  async initializeTransporter() {
    if (process.env.SMTP_HOST) {
      this.transporter = nodemailer.createTransporter({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: process.env.SMTP_PORT === '465',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      // Verify connection
      try {
        await this.transporter.verify();
        console.log('✅ Email service connected successfully');
      } catch (error) {
        console.error('❌ Email service connection failed:', error);
        this.transporter = null;
      }
    }
  }

  // Load email templates
  loadTemplate(templateName, data) {
    try {
      const templatePath = join(__dirname, '..', 'templates', 'emails', `${templateName}.html`);
      let template = readFileSync(templatePath, 'utf8');
      
      // Replace placeholders with actual data
      Object.keys(data).forEach(key => {
        const regex = new RegExp(`{{${key}}}`, 'g');
        template = template.replace(regex, data[key]);
      });
      
      return template;
    } catch (error) {
      console.error(`Error loading email template ${templateName}:`, error);
      return this.getFallbackTemplate(templateName, data);
    }
  }

  // Fallback template if file loading fails
  getFallbackTemplate(templateName, data) {
    const templates = {
      welcome: `
        <h2>Welcome to Devnovate!</h2>
        <p>Hello ${data.firstName},</p>
        <p>Welcome to Devnovate! We're excited to have you on board.</p>
        <p>Start exploring and sharing your knowledge with the community.</p>
        <p>Best regards,<br>The Devnovate Team</p>
      `,
      articleApproved: `
        <h2>Article Approved!</h2>
        <p>Hello ${data.authorName},</p>
        <p>Great news! Your article "${data.articleTitle}" has been approved and is now live on the platform.</p>
        <p>You can view it here: <a href="${data.articleUrl}">${data.articleUrl}</a></p>
        <p>Keep up the great work!</p>
        <p>Best regards,<br>The Devnovate Team</p>
      `,
      articleRejected: `
        <h2>Article Review Feedback</h2>
        <p>Hello ${data.authorName},</p>
        <p>We've reviewed your article "${data.articleTitle}" and unfortunately it doesn't meet our current guidelines.</p>
        <p><strong>Feedback:</strong> ${data.feedback}</p>
        <p>Please review the feedback and feel free to submit a revised version.</p>
        <p>Best regards,<br>The Devnovate Team</p>
      `,
      newComment: `
        <h2>New Comment on Your Article</h2>
        <p>Hello ${data.authorName},</p>
        <p>${data.commenterName} commented on your article "${data.articleTitle}":</p>
        <blockquote>${data.commentText}</blockquote>
        <p>View the comment: <a href="${data.articleUrl}">${data.articleUrl}</a></p>
        <p>Best regards,<br>The Devnovate Team</p>
      `,
      passwordReset: `
        <h2>Password Reset Request</h2>
        <p>Hello ${data.firstName},</p>
        <p>You requested a password reset for your Devnovate account.</p>
        <p>Click the link below to reset your password:</p>
        <p><a href="${data.resetUrl}">Reset Password</a></p>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this, please ignore this email.</p>
        <p>Best regards,<br>The Devnovate Team</p>
      `
    };

    return templates[templateName] || templates.welcome;
  }

  // Send email
  async sendEmail(to, subject, html, text = null) {
    if (!this.transporter) {
      console.warn('Email service not configured, skipping email send');
      return false;
    }

    try {
      const mailOptions = {
        from: process.env.SMTP_FROM || 'noreply@devnovate.com',
        to,
        subject,
        html,
        text: text || this.htmlToText(html),
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log(`✅ Email sent successfully to ${to}: ${subject}`);
      return result;
    } catch (error) {
      console.error('❌ Failed to send email:', error);
      return false;
    }
  }

  // Convert HTML to plain text
  htmlToText(html) {
    return html
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  // Send welcome email
  async sendWelcomeEmail(user) {
    const data = {
      firstName: user.firstName,
      username: user.username,
      email: user.email
    };

    const html = this.loadTemplate('welcome', data);
    const subject = 'Welcome to Devnovate! 🎉';

    return this.sendEmail(user.email, subject, html);
  }

  // Send article approval email
  async sendArticleApprovedEmail(article, author) {
    const data = {
      authorName: author.firstName,
      articleTitle: article.title,
      articleUrl: `${process.env.CLIENT_URL}/articles/${article.slug}`
    };

    const html = this.loadTemplate('articleApproved', data);
    const subject = '🎉 Your Article Has Been Approved!';

    return this.sendEmail(author.email, subject, html);
  }

  // Send article rejection email
  async sendArticleRejectedEmail(article, author, feedback) {
    const data = {
      authorName: author.firstName,
      articleTitle: article.title,
      feedback: feedback || 'Please review our content guidelines and try again.'
    };

    const html = this.loadTemplate('articleRejected', data);
    const subject = 'Article Review Feedback';

    return this.sendEmail(author.email, subject, html);
  }

  // Send new comment notification
  async sendNewCommentEmail(comment, article, author) {
    const data = {
      authorName: author.firstName,
      commenterName: comment.author.firstName || comment.author.username,
      articleTitle: article.title,
      commentText: comment.content,
      articleUrl: `${process.env.CLIENT_URL}/articles/${article.slug}`
    };

    const html = this.loadTemplate('newComment', data);
    const subject = '💬 New Comment on Your Article';

    return this.sendEmail(author.email, subject, html);
  }

  // Send password reset email
  async sendPasswordResetEmail(user, resetToken) {
    const data = {
      firstName: user.firstName,
      resetUrl: `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`
    };

    const html = this.loadTemplate('passwordReset', data);
    const subject = '🔐 Password Reset Request';

    return this.sendEmail(user.email, subject, html);
  }

  // Send bulk notification (for admin announcements)
  async sendBulkNotification(users, subject, message) {
    if (!this.transporter) return false;

    const results = [];
    for (const user of users) {
      const html = `
        <h2>${subject}</h2>
        <p>Hello ${user.firstName},</p>
        <p>${message}</p>
        <p>Best regards,<br>The Devnovate Team</p>
      `;

      const result = await this.sendEmail(user.email, subject, html);
      results.push({ user: user.email, success: !!result });
    }

    return results;
  }
}

export default new EmailService();
