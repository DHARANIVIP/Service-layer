const nodemailer = require('nodemailer');

/**
 * Send email using Nodemailer
 * @param {Object} options - Email options
 * @param {string} options.email - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.message - Email message (text)
 * @param {string} options.html - Email message (HTML)
 */
const sendEmail = async (options) => {
    // Create transporter
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        secure: false, // true for 465, false for other ports
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    // Email options
    const mailOptions = {
        from: `${process.env.EMAIL_FROM || 'Your App'} <${process.env.EMAIL_USER}>`,
        to: options.email,
        subject: options.subject,
        text: options.message,
        html: options.html || options.message,
    };

    // Send email
    try {
        const info = await transporter.sendMail(mailOptions);
        console.log(`✅ Email sent to ${options.email}: ${info.messageId}`);
        return info;
    } catch (error) {
        console.error(`❌ Error sending email to ${options.email}:`, error.message);
        throw new Error('Email could not be sent');
    }
};

/**
 * Send OTP email template
 * @param {string} email - Recipient email
 * @param {string} otp - OTP code
 * @param {string} name - User's name
 */
const sendOTPEmail = async (email, otp, name = 'User') => {
    const message = `
    Hello ${name},

    Your OTP for verification is: ${otp}

    This OTP will expire in ${process.env.OTP_EXPIRE_MINUTES || 10} minutes.

    If you did not request this, please ignore this email.

    Best regards,
    Your App Team
  `;

    const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Email Verification</h2>
      <p>Hello <strong>${name}</strong>,</p>
      <p>Your OTP for verification is:</p>
      <div style="background-color: #f4f4f4; padding: 15px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #007bff;">
        ${otp}
      </div>
      <p style="color: #666; margin-top: 20px;">
        This OTP will expire in <strong>${process.env.OTP_EXPIRE_MINUTES || 10} minutes</strong>.
      </p>
      <p style="color: #666;">
        If you did not request this, please ignore this email.
      </p>
      <hr style="margin-top: 30px; border: none; border-top: 1px solid #eee;">
      <p style="color: #999; font-size: 12px;">Best regards,<br>Your App Team</p>
    </div>
  `;

    await sendEmail({
        email,
        subject: 'Email Verification - OTP',
        message,
        html,
    });
};

/**
 * Send password reset email
 * @param {string} email - Recipient email
 * @param {string} otp - Reset OTP
 * @param {string} name - User's name
 */
const sendPasswordResetEmail = async (email, otp, name = 'User') => {
    const message = `
    Hello ${name},

    You requested to reset your password. Your OTP is: ${otp}

    This OTP will expire in ${process.env.OTP_EXPIRE_MINUTES || 10} minutes.

    If you did not request this, please ignore this email and your password will remain unchanged.

    Best regards,
    Your App Team
  `;

    const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Password Reset Request</h2>
      <p>Hello <strong>${name}</strong>,</p>
      <p>You requested to reset your password. Your OTP is:</p>
      <div style="background-color: #f4f4f4; padding: 15px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #dc3545;">
        ${otp}
      </div>
      <p style="color: #666; margin-top: 20px;">
        This OTP will expire in <strong>${process.env.OTP_EXPIRE_MINUTES || 10} minutes</strong>.
      </p>
      <p style="color: #666;">
        If you did not request this, please ignore this email and your password will remain unchanged.
      </p>
      <hr style="margin-top: 30px; border: none; border-top: 1px solid #eee;">
      <p style="color: #999; font-size: 12px;">Best regards,<br>Your App Team</p>
    </div>
  `;

    await sendEmail({
        email,
        subject: 'Password Reset Request - OTP',
        message,
        html,
    });
};

module.exports = {
    sendEmail,
    sendOTPEmail,
    sendPasswordResetEmail,
};
