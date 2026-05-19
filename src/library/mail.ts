import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.BREVO_SMTP_HOST,
  port: Number(process.env.BREVO_SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.BREVO_SMTP_USER,
    pass: process.env.BREVO_SMTP_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

interface MailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

export const verifyMailConnection = async (): Promise<boolean> => {
  try {
    await transporter.verify();
    console.log('✅ Brevo SMTP connection verified');
    return true;
  } catch (error) {
    console.error('❌ Brevo SMTP connection failed:', error);
    return false;
  }
};

export const sendMail = async (options: MailOptions): Promise<boolean> => {
  try {
    await transporter.sendMail({
      from: process.env.MAIL_FROM,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    });
    return true;
  } catch (error) {
    console.error('Failed to send email:', JSON.stringify(error, null, 2));
    return false;
  }
};

export const generateOTP = (length: number = 6): string => {
  const digits = '0123456789';
  let otp = '';
  for (let i = 0; i < length; i++) {
    otp += digits[Math.floor(Math.random() * 10)];
  }
  return otp;
};

export const sendOTPEmail = async (
  to: string,
  otp: string,
  name?: string
): Promise<boolean> => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        .container { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; }
        .otp-box { background: #f4f4f4; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px; }
        .otp-code { font-size: 32px; font-weight: bold; color: #333; letter-spacing: 8px; }
        .footer { color: #666; font-size: 12px; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <h2>Email Verification</h2>
        <p>Hello${name ? ` ${name}` : ''},</p>
        <p>Your OTP for email verification is:</p>
        <div class="otp-box">
          <span class="otp-code">${otp}</span>
        </div>
        <p>This OTP will expire in 10 minutes.</p>
        <p>If you didn't request this, please ignore this email.</p>
        <div class="footer">
          <p>This is an automated email, please do not reply.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendMail({
    to,
    subject: 'Email Verification OTP',
    html,
    text: `Your OTP is: ${otp}. It will expire in 10 minutes.`,
  });
};

export default { sendMail, sendOTPEmail, generateOTP, verifyMailConnection };