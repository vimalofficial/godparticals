// import sgMail from '@sendgrid/mail';
// import dotenv from 'dotenv';

// dotenv.config();

// sgMail.setApiKey(process.env.SENDGRID_API_KEY || '');

// interface MailOptions {
//   to: string;
//   subject: string;
//   text?: string;
//   html?: string;
// }

// export const verifyMailConnection = async (): Promise<boolean> => {
//   try {
//     if (!process.env.SENDGRID_API_KEY) throw new Error('SENDGRID_API_KEY missing');
//     console.log('✅ SendGrid mail service ready');
//     return true;
//   } catch (error) {
//     console.error('❌ SendGrid setup failed:', error);
//     return false;
//   }
// };

// // export const sendMail = async (options: MailOptions): Promise<boolean> => {
// //   try {
// //     await sgMail.send({
// //       from: process.env.MAIL_FROM || '',
// //       to: options.to,
// //       subject: options.subject,
// //       text: options.text || '',
// //       html: options.html || '',
// //     });
// //     return true;
// //   } catch (error) {
// //     console.error('Failed to send email:', JSON.stringify(error, null, 2));
// //     return false;
// //   }
// // };

// export const sendMail = async (options: MailOptions): Promise<boolean> => {
//   try {
//     await sgMail.send({
//       to: options.to,
//       from: {
//         email: process.env.MAIL_FROM!,
//         name: "God Particals",
//       },
//       replyTo: process.env.MAIL_FROM!,
//       subject: options.subject,
//       text: options.text || "Please view this email in HTML format.",
//       html: options.html || "",
//       trackingSettings: {
//         clickTracking: {
//           enable: false,
//           enableText: false,
//         },
//         openTracking: {
//           enable: false,
//         },
//       },
//       mailSettings: {
//         sandboxMode: {
//           enable: false,
//         },
//       },
//     });

//     return true;
//   } catch (error) {
//     console.error("Failed to send email:", error);
//     return false;
//   }
// };


// export const generateOTP = (length: number = 6): string => {
//   const digits = '0123456789';
//   let otp = '';
//   for (let i = 0; i < length; i++) {
//     otp += digits[Math.floor(Math.random() * 10)];
//   }
//   return otp;
// };

// export const sendOTPEmail = async (
//   to: string,
//   otp: string,
//   name?: string
// ): Promise<boolean> => {
//   const html = `
//     <!DOCTYPE html>
//     <html>
//     <head>
//       <style>
//         .container { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; }
//         .otp-box { background: #f4f4f4; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px; }
//         .otp-code { font-size: 32px; font-weight: bold; color: #333; letter-spacing: 8px; }
//         .footer { color: #666; font-size: 12px; margin-top: 20px; }
//       </style>
//     </head>
//     <body>
//       <div class="container">
//         <h2>Email Verification</h2>
//         <p>Hello${name ? ` ${name}` : ''},</p>
//         <p>Your OTP for email verification is:</p>
//         <div class="otp-box">
//           <span class="otp-code">${otp}</span>
//         </div>
//         <p>This OTP will expire in 10 minutes.</p>
//         <p>If you didn't request this, please ignore this email.</p>
//         <div class="footer">
//           <p>This is an automated email, please do not reply.</p>
//         </div>
//       </div>
//     </body>
//     </html>
//   `;

//   return sendMail({
//     to,
//     subject: 'Email Verification OTP',
//     html,
//     text: `Your OTP is: ${otp}. It will expire in 10 minutes.`,
//   });
// };

// export default { sendMail, sendOTPEmail, generateOTP, verifyMailConnection };

import sgMail from "@sendgrid/mail";
import dotenv from "dotenv";

dotenv.config();

sgMail.setApiKey(process.env.SENDGRID_API_KEY || "");

interface MailOptions {
  to: string;
  subject: string;
  text: string;
}

export const verifyMailConnection = async (): Promise<boolean> => {
  try {
    if (!process.env.SENDGRID_API_KEY) {
      throw new Error("SENDGRID_API_KEY missing");
    }

    if (!process.env.MAIL_FROM) {
      throw new Error("MAIL_FROM missing");
    }

    console.log("✅ SendGrid mail service ready");
    return true;
  } catch (error) {
    console.error("❌ SendGrid setup failed:", error);
    return false;
  }
};

export const sendMail = async (
  options: MailOptions
): Promise<boolean> => {
  try {
    await sgMail.send({
      to: options.to,

      from: {
        email: process.env.MAIL_FROM!,
        name: "God Particals",
      },

      replyTo: process.env.MAIL_FROM!,

      subject: options.subject,

      text: options.text,

      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <p>${options.text}</p>
        </div>
      `,

      trackingSettings: {
        clickTracking: {
          enable: false,
          enableText: false,
        },
        openTracking: {
          enable: false,
        },
      },

      headers: {
        "X-Mailer": "God Particals",
      },
    });

    console.log("✅ Email sent successfully");
    return true;
  } catch (error) {
    console.error("❌ Failed to send email:", error);
    return false;
  }
};

export const generateOTP = (length: number = 6): string => {
  const digits = "0123456789";

  let otp = "";

  for (let i = 0; i < length; i++) {
    otp += digits[Math.floor(Math.random() * 10)];
  }

  return otp;
};

export const sendOTPEmail = async (
  to: string,
  otp: string
): Promise<boolean> => {
  const text = `
Your verification code is: ${otp}

This code expires in 10 minutes.

If you did not request this email, please ignore it.

- God Particals
`;

  return sendMail({
    to,
    subject: "Your Verification Code",
    text,
  });
};

export default {
  sendMail,
  sendOTPEmail,
  generateOTP,
  verifyMailConnection,
};