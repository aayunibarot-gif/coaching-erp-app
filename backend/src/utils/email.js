import nodemailer from "nodemailer";
import "dotenv/config";

console.log("[DEBUG] email.js utility loaded (REAL GMAIL MODE)");

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

const APP_NAME = "Eduverse Coaching";
const PRIMARY_COLOR = "#6366f1";

export const sendApprovalEmailToAdmin = async (studentName, studentEmail, userId) => {
  const backendUrl = process.env.BACKEND_URL || "http://localhost:5000";
  const adminEmail = process.env.ADMIN_EMAIL || "aayunibarot@gmail.com";
  
  const mailOptions = {
    from: `"${APP_NAME}" <${process.env.SMTP_USER}>`,
    to: adminEmail,
    subject: `Action Required: New Registration - ${studentName}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px; background-color: #ffffff;">
        <div style="text-align: center; margin-bottom: 20px;">
           <h2 style="color: ${PRIMARY_COLOR}; margin: 0;">New Student Registration</h2>
        </div>
        <div style="padding: 20px; background-color: #f8fafc; border-radius: 8px;">
          <p style="margin: 5px 0;"><strong>Student Name:</strong> ${studentName}</p>
          <p style="margin: 5px 0;"><strong>Email Address:</strong> ${studentEmail}</p>
        </div>
        <p style="margin-top: 20px; text-align: center; color: #475569;">This student is waiting for your approval to access the portal.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${backendUrl}/api/users/approve-direct/${userId}" 
             style="background-color: #10b981; color: white; padding: 16px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 18px; display: inline-block; box-shadow: 0 4px 6px -1px rgba(16, 185, 129, 0.2);">
            Approve Student Now
          </a>
        </div>
        <hr style="border: 0; border-top: 1px solid #eee;" />
        <p style="color: #94a3b8; font-size: 12px; text-align: center;">This is an automated notification from ${APP_NAME} ERP System.</p>
      </div>
    `,
  };

  try {
    console.log(`[EMAIL] Sending REAL email to admin: ${adminEmail}`);
    await transporter.sendMail(mailOptions);
    console.log("[EMAIL] SUCCESS: Email delivered to your Gmail inbox!");
  } catch (error) {
    console.error("[EMAIL] FAILED: Google still rejects your password. Error:", error.message);
  }
};

export const sendApprovalSuccessEmailToStudent = async (studentName, studentEmail) => {
  const mailOptions = {
    from: `"${APP_NAME}" <${process.env.SMTP_USER}>`,
    to: studentEmail,
    subject: "Welcome to Eduverse Coaching - Account Approved!",
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #10b981;">Congratulations ${studentName}!</h2>
        <p>Your account at <strong>Eduverse Coaching</strong> has been approved by the admin.</p>
        <p>You can now log in to access your courses, marks, and fees information.</p>
        <br />
        <p>Welcome to the family!</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`[EMAIL] SUCCESS: Approval email sent to student.`);
  } catch (error) {
    console.error("[EMAIL] Student email failed:", error.message);
  }
};

export const sendRegistrationPendingEmailToStudent = async (studentName, studentEmail) => {
  const mailOptions = {
    from: `"${APP_NAME}" <${process.env.SMTP_USER}>`,
    to: studentEmail,
    subject: "Registration Successful - Eduverse Coaching",
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: ${PRIMARY_COLOR};">Registration Successful!</h2>
        <p>Hello ${studentName},</p>
        <p>Wait for admin approval. You are successfully registered to Eduverse Coaching.</p>
      </div>
    `,
  };

    try {
      await transporter.sendMail(mailOptions);
      console.log(`[EMAIL] SUCCESS: Registration pending email sent to student.`);
    } catch (error) {
      console.error("[EMAIL] Registration email failed:", error.message);
    }
  };
  
  export const sendPasswordResetEmail = async (userName, userEmail, resetUrl) => {
    const mailOptions = {
      from: `"${APP_NAME}" <${process.env.SMTP_USER}>`,
      to: userEmail,
      subject: "Password Reset Request - Eduverse Coaching",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px; background-color: #ffffff;">
          <h2 style="color: ${PRIMARY_COLOR}; text-align: center;">Password Reset Request</h2>
          <p>Hello ${userName},</p>
          <p>We received a request to reset your password. You can do this by clicking the button below:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" 
               style="background-color: ${PRIMARY_COLOR}; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px; display: inline-block; box-shadow: 0 4px 6px -1px rgba(99, 102, 241, 0.2);">
              Reset Password
            </a>
          </div>
          <p>If you didn't request a password reset, please ignore this email. The link will expire in 10 minutes.</p>
          <hr style="border: 0; border-top: 1px solid #eee; margin-top: 30px;" />
          <p style="color: #94a3b8; font-size: 12px; text-align: center;">This is an automated message from ${APP_NAME}.</p>
        </div>
      `,
    };
  
    try {
      await transporter.sendMail(mailOptions);
      console.log(`[EMAIL] SUCCESS: Password reset email sent to ${userEmail}.`);
    } catch (error) {
      console.error("[EMAIL] Password reset email failed:", error.message);
    }
  };
