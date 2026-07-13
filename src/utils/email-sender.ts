import nodemailer from "nodemailer";
import CustomErrorHandler from "../error/error";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GOOGLE_EMAIL,
    pass: process.env.GOOGLE_PASS,
  },
});

export default async function sendEmail(email: string, code: string) {
  try {
    await transporter.sendMail({
      subject: "Exclusive",
      text: "Tasdiqlash kodi",
      from: process.env.GOOGLE_EMAIL,
      to: email,
      html: `<b style="color: #DB4444; font-size: 36px;">${code}</b>`,
    });
  } catch (error: any) {
    throw CustomErrorHandler.BadRequest(error.message);
  }
}

export async function sendPlainEmail(to: string, subject: string, text: string) {
  try {
    await transporter.sendMail({
      subject,
      text,
      from: process.env.GOOGLE_EMAIL,
      to,
    });
  } catch (error: any) {
    throw CustomErrorHandler.BadRequest(error.message);
  }
}
