import dotenv from 'dotenv';

dotenv.config();

export const config = {
  // Server
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',

  // Database
  databaseUrl: process.env.DATABASE_URL!,

  // JWT
  jwt: {
    secret: process.env.JWT_SECRET!,
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    refreshSecret: process.env.JWT_REFRESH_SECRET!,
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
  },

  // Mail
  mail: {
    host: process.env.MAIL_HOST!,
    port: parseInt(process.env.MAIL_PORT || '587', 10),
    user: process.env.MAIL_USER!,
    password: process.env.MAIL_PASSWORD!,
    from: process.env.MAIL_FROM!,

    // resendApiKey: process.env.RESEND_API_KEY!, // 👈 add this line
    // brevoApiKey: process.env.BREVO_API_KEY!

    brevoUser: process.env.BREVO_USER!,       // 👈 add
  brevoPassword: process.env.BREVO_PASSWORD!, // 👈 add
  },

  // OTP
  otp: {
    expiryMinutes: parseInt(process.env.OTP_EXPIRY_MINUTES || '10', 10),
  },

  // AWS S3
  aws: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    region: process.env.AWS_REGION || 'ap-south-1',
    s3Bucket: process.env.AWS_S3_BUCKET!,
    s3BaseUrl: process.env.AWS_S3_BASE_URL!,
  },
};

export default config;
