import "dotenv/config";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT),
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

async function test() {
  console.log("Testing email with Mailtrap...");

  try {
    const info = await transporter.sendMail({
      from: `"Test" <test@eduverse.com>`,
      to: "aayunibarot@gmail.com",
      subject: "Mailtrap Test Email",
      text: "This is a test email using Mailtrap. It works!",
    });
    console.log("Email sent successfully to Mailtrap Inbox!");
  } catch (error) {
    console.error("Email failed:", error.message);
  }
}

test();
