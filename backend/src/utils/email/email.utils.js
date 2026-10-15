import nodemailer from "nodemailer";
import { verificationTemplate } from "./templates/verification.template.js";
import { funTemplate } from "./templates/fun.template.js";

const transporter = nodemailer.createTransport(
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

    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: email,
      ...template,
    });
  } catch (err) {
    throw err;
  }
};

export const funEmail = async (email) => {
  try {
    const template = funTemplate();

    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: email,
      ...template,
    });
  } catch (err) {
    throw err;
  }
};


