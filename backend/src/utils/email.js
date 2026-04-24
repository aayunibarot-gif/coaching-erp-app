import nodemailer from "nodemailer";

// Create a transporter. For demo purposes, we will just log if no credentials are provided.
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.mailtrap.io",
  port: process.env.SMTP_PORT || 2525,
  auth: {
    user: process.env.SMTP_USER || "user",
    pass: process.env.SMTP_PASS || "pass",
  },
});

const APP_NAME = "Eduverse Coaching";
const PRIMARY_COLOR = "#6366f1";

export const sendApprovalEmailToAdmin = async (studentName, studentEmail) => {
  const mailOptions = {
    from: `"${APP_NAME}" <noreply@coaching-erp.com>`,
    to: process.env.ADMIN_EMAIL || "admin@coaching-erp.com",
    subject: `New Student Registration: ${studentName}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden;">
        <div style="background-color: ${PRIMARY_COLOR}; padding: 32px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">New Registration</h1>
        </div>
        <div style="padding: 32px; background-color: white;">
          <p style="color: #475569; font-size: 16px; line-height: 1.6;">A new student has registered on the portal and is awaiting your approval.</p>
          <div style="background-color: #f8fafc; border-radius: 12px; padding: 24px; margin: 24px 0;">
            <p style="margin: 0 0 8px 0; color: #64748b; font-size: 14px; text-transform: uppercase; font-weight: bold;">Student Details</p>
            <p style="margin: 0; color: #1e293b; font-size: 18px; font-weight: bold;">${studentName}</p>
            <p style="margin: 4px 0 0 0; color: #64748b; font-size: 16px;">${studentEmail}</p>
          </div>
          <p style="color: #475569; font-size: 14px;">Please log in to the admin dashboard to review and approve this application.</p>
          <div style="text-align: center; margin-top: 32px;">
            <a href="${process.env.CLIENT_URL || "http://localhost:5173"}/login" 
               style="background-color: ${PRIMARY_COLOR}; color: white; padding: 14px 28px; border-radius: 12px; text-decoration: none; font-weight: bold; display: inline-block;">
              Go to Dashboard
            </a>
          </div>
        </div>
        <div style="background-color: #f1f5f9; padding: 16px; text-align: center; font-size: 12px; color: #94a3b8;">
          &copy; ${new Date().getFullYear()} ${APP_NAME}. All rights reserved.
        </div>
      </div>
    `,
  };

  try {
    if (!process.env.SMTP_USER || process.env.SMTP_USER === "user") {
      console.log("-------------------------------------------------------");
      console.log("EMAIL MOCK: Sending email to admin...");
      console.log(`To: ${mailOptions.to}`);
      console.log(`Subject: ${mailOptions.subject}`);
      console.log("-------------------------------------------------------");
      return;
    }

    await transporter.sendMail(mailOptions);
    console.log("Approval notification sent to admin.");
  } catch (error) {
    console.error("Error sending admin notification:", error);
  }
};

export const sendApprovalSuccessEmailToStudent = async (studentName, studentEmail) => {
  const mailOptions = {
    from: `"${APP_NAME}" <noreply@coaching-erp.com>`,
    to: studentEmail,
    subject: "Welcome to Eduverse Coaching!",
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden;">
        <div style="background-color: ${PRIMARY_COLOR}; padding: 40px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Account Approved!</h1>
        </div>
        <div style="padding: 32px; background-color: white;">
          <h2 style="color: #1e293b; margin-top: 0;">Hello ${studentName},</h2>
          <p style="color: #475569; font-size: 16px; line-height: 1.6;">
            We are excited to inform you that your registration has been <strong>approved</strong> by the admin.
          </p>
          <p style="color: #475569; font-size: 16px; line-height: 1.6;">
            You can now log in to your student dashboard to access your study materials, marks, and more.
          </p>
          <div style="text-align: center; margin-top: 40px;">
            <a href="${process.env.CLIENT_URL || "http://localhost:5173"}/login" 
               style="background-color: ${PRIMARY_COLOR}; color: white; padding: 14px 28px; border-radius: 12px; text-decoration: none; font-weight: bold; display: inline-block;">
              Access Dashboard
            </a>
          </div>
          <p style="color: #475569; font-size: 14px; margin-top: 40px;">
            If you have any questions, please feel free to contact our support team.
          </p>
          <p style="color: #475569; font-size: 14px; font-weight: bold; margin-bottom: 0;">Best Regards,</p>
          <p style="color: #6366f1; font-size: 14px; font-weight: bold; margin-top: 4px;">The ${APP_NAME} Team</p>
        </div>
        <div style="background-color: #f1f5f9; padding: 16px; text-align: center; font-size: 12px; color: #94a3b8;">
          &copy; ${new Date().getFullYear()} ${APP_NAME}. All rights reserved.
        </div>
      </div>
    `,
  };

  try {
    if (!process.env.SMTP_USER || process.env.SMTP_USER === "user") {
      console.log("-------------------------------------------------------");
      console.log("EMAIL MOCK: Sending approval success email to STUDENT...");
      console.log(`To: ${mailOptions.to}`);
      console.log(`Subject: ${mailOptions.subject}`);
      console.log("-------------------------------------------------------");
      return;
    }

    await transporter.sendMail(mailOptions);
    console.log(`Approval email sent to student: ${studentEmail}`);
  } catch (error) {
    console.error("Error sending student approval email:", error);
  }
};

export const sendRegistrationPendingEmailToStudent = async (studentName, studentEmail) => {
  const mailOptions = {
    from: `"${APP_NAME}" <noreply@coaching-erp.com>`,
    to: studentEmail,
    subject: "Registration Successful - Pending Approval",
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden;">
        <div style="background-color: ${PRIMARY_COLOR}; padding: 40px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Registration Received!</h1>
        </div>
        <div style="padding: 32px; background-color: white;">
          <h2 style="color: #1e293b; margin-top: 0;">Hello ${studentName},</h2>
          <p style="color: #475569; font-size: 16px; line-height: 1.6;">
            Thank you for registering with <strong>${APP_NAME}</strong>.
          </p>
          <div style="background-color: #fff7ed; border-left: 4px solid #f97316; padding: 16px; margin: 24px 0;">
            <p style="margin: 0; color: #9a3412; font-weight: bold; font-size: 16px;">
              Your account is pending admin approval.
            </p>
            <p style="margin: 8px 0 0 0; color: #c2410c; font-size: 14px;">
              We have notified the administrator. You will receive another email as soon as your account is activated.
            </p>
          </div>
          <p style="color: #475569; font-size: 14px; margin-top: 32px;">
            In the meantime, if you have any questions, feel free to contact us.
          </p>
          <p style="color: #475569; font-size: 14px; font-weight: bold; margin-bottom: 0;">Best Regards,</p>
          <p style="color: #6366f1; font-size: 14px; font-weight: bold; margin-top: 4px;">The ${APP_NAME} Team</p>
        </div>
        <div style="background-color: #f1f5f9; padding: 16px; text-align: center; font-size: 12px; color: #94a3b8;">
          &copy; ${new Date().getFullYear()} ${APP_NAME}. All rights reserved.
        </div>
      </div>
    `,
  };

  try {
    if (!process.env.SMTP_USER || process.env.SMTP_USER === "user") {
      console.log("-------------------------------------------------------");
      console.log("EMAIL MOCK: Sending registration pending email to STUDENT...");
      console.log(`To: ${mailOptions.to}`);
      console.log(`Subject: ${mailOptions.subject}`);
      console.log("-------------------------------------------------------");
      return;
    }

    await transporter.sendMail(mailOptions);
    console.log(`Registration pending email sent to student: ${studentEmail}`);
  } catch (error) {
    console.error("Error sending registration pending email:", error);
  }
};


