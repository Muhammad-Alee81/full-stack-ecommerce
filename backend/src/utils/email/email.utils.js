import nodemailer from "nodemailer";
import { verificationTemplate } from "./templates/verification.template.js";
import { sendEmail } from "../../config/mail.config.js";

export const transporter = nodemailer.createTransport(
  process.env.NODE_ENV === "production"
    ? {
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT),
        secure: false,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      }
    : {
        host: process.env.MAILTRAP_HOST,
        port: Number(process.env.MAILTRAP_PORT),
        secure: false,
        auth: {
          user: process.env.MAILTRAP_USER,
          pass: process.env.MAILTRAP_PASS,
        },
      },
);

export const sendVerificationEmail = async (email, otp) => {
  try {
    const template = verificationTemplate(otp);

    await sendEmail({ to: email, ...template });
  } catch (err) {
    throw err;
  }
};
