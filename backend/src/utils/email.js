import nodemailer from "nodemailer";

// Create a transporter configured for Gmail or other SMTP services
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT) || 465,
  secure: process.env.SMTP_PORT == "465", // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const APP_NAME = "Eduverse Coaching";
const PRIMARY_COLOR = "#6366f1";

export const sendApprovalEmailToAdmin = async (studentName, studentEmail) => {
  const mailOptions = {
    from: `"${APP_NAME}" <noreply@coaching-erp.com>`,
    to: process.env.ADMIN_EMAIL || "admin@coaching-erp.com",
    subject: `Action Required: New Registration - ${studentName}`,
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.1); border: 1px solid #e2e8f0;">
        <div style="background: linear-gradient(135deg, ${PRIMARY_COLOR}, #4f46e5); padding: 40px 20px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px; letter-spacing: -0.5px;">New Approval Request</h1>
        </div>
        <div style="padding: 40px; background-color: white;">
          <p style="color: #475569; font-size: 18px; line-height: 1.6; margin-bottom: 24px;">
            Hello Admin,
          </p>
          <p style="color: #1e293b; font-size: 16px; line-height: 1.6;">
            A new user is waiting for your approval. Please review their details and grant access to the portal.
          </p>
          
          <div style="background-color: #f8fafc; border-radius: 16px; padding: 24px; margin: 32px 0; border: 1px solid #edf2f7;">
            <p style="margin: 0 0 8px 0; color: #64748b; font-size: 12px; text-transform: uppercase; font-weight: 700; letter-spacing: 1px;">User Details</p>
            <p style="margin: 0; color: #1e293b; font-size: 20px; font-weight: 800;">${studentName}</p>
            <p style="margin: 4px 0 0 0; color: #6366f1; font-size: 16px; font-weight: 500;">${studentEmail}</p>
          </div>

          <p style="color: #64748b; font-size: 15px; text-align: center; font-style: italic;">
            "Kindly approve them to complete the registration process."
          </p>

          <div style="text-align: center; margin-top: 40px;">
            <a href="${process.env.CLIENT_URL || "http://localhost:5173"}/login" 
               style="background-color: ${PRIMARY_COLOR}; color: white; padding: 16px 32px; border-radius: 12px; text-decoration: none; font-weight: 700; display: inline-block; transition: all 0.3s ease; box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);">
              Open Admin Dashboard
            </a>
          </div>
        </div>
        <div style="background-color: #f8fafc; padding: 24px; text-align: center; font-size: 13px; color: #94a3b8; border-top: 1px solid #f1f5f9;">
          &copy; ${new Date().getFullYear()} ${APP_NAME} &bull; Managed Excellence
        </div>
      </div>
    `,
  };

  try {
    if (!process.env.SMTP_USER || process.env.SMTP_USER === "your-email@gmail.com" || process.env.SMTP_USER === "user") {
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
    subject: "Welcome to Eduverse Coaching - Account Approved!",
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.1); border: 1px solid #e2e8f0;">
        <div style="background: linear-gradient(135deg, ${PRIMARY_COLOR}, #4f46e5); padding: 50px 20px; text-align: center;">
          <div style="background: white; width: 80px; height: 80px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 20px; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
            <span style="font-size: 40px;">✅</span>
          </div>
          <h1 style="color: white; margin: 0; font-size: 32px; letter-spacing: -0.5px;">Account Approved!</h1>
        </div>
        <div style="padding: 40px; background-color: white;">
          <h2 style="color: #1e293b; margin-top: 0; font-size: 22px; font-weight: 800;">Hello ${studentName},</h2>
          <p style="color: #475569; font-size: 17px; line-height: 1.7;">
            We are excited to inform you that your registration has been <strong>approved</strong>. Your gateway to excellence at <strong>${APP_NAME}</strong> is now open!
          </p>
          <p style="color: #475569; font-size: 16px; line-height: 1.6; margin-top: 16px;">
            You can now log in to your dashboard to access your study materials, track your progress, and manage your academic journey.
          </p>
          
          <div style="text-align: center; margin-top: 40px; margin-bottom: 40px;">
            <a href="${process.env.CLIENT_URL || "http://localhost:5173"}/login" 
               style="background-color: ${PRIMARY_COLOR}; color: white; padding: 18px 36px; border-radius: 14px; text-decoration: none; font-weight: 800; display: inline-block; box-shadow: 0 6px 20px rgba(99, 102, 241, 0.4); transition: transform 0.2s ease;">
              Access Your Dashboard
            </a>
          </div>

          <div style="background-color: #f8fafc; border-radius: 16px; padding: 24px; border: 1px solid #edf2f7;">
            <p style="margin: 0; color: #1e293b; font-size: 15px; line-height: 1.6;">
              <strong>Need help?</strong> If you have any trouble logging in or have questions about your classes, our support team is just an email away.
            </p>
          </div>

          <p style="color: #475569; font-size: 14px; font-weight: 700; margin-top: 40px; margin-bottom: 0;">Warm Welcome,</p>
          <p style="color: ${PRIMARY_COLOR}; font-size: 15px; font-weight: 800; margin-top: 4px;">The ${APP_NAME} Team</p>
        </div>
        <div style="background-color: #f8fafc; padding: 24px; text-align: center; font-size: 13px; color: #94a3b8; border-top: 1px solid #f1f5f9;">
          &copy; ${new Date().getFullYear()} ${APP_NAME} &bull; Your Success, Our Mission
        </div>
      </div>
    `,
  };

  try {
    if (!process.env.SMTP_USER || process.env.SMTP_USER === "your-email@gmail.com" || process.env.SMTP_USER === "user") {
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
    subject: "Registration Successful - Eduverse Coaching",
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.1); border: 1px solid #e2e8f0;">
        <div style="background: linear-gradient(135deg, #10b981, #059669); padding: 40px 20px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px; letter-spacing: -0.5px;">Registration Successful!</h1>
        </div>
        <div style="padding: 40px; background-color: white;">
          <h2 style="color: #1e293b; margin-top: 0; font-size: 22px; font-weight: 800;">Welcome, ${studentName}!</h2>
          <p style="color: #475569; font-size: 16px; line-height: 1.6;">
            You have successfully registered to <strong>${APP_NAME}</strong>. We are thrilled to have you join our academic community!
          </p>
          
          <div style="background-color: #fffbeb; border-left: 5px solid #f59e0b; padding: 24px; margin: 32px 0; border-radius: 4px 12px 12px 4px;">
            <p style="margin: 0; color: #92400e; font-weight: 800; font-size: 18px; margin-bottom: 8px;">
              Wait for Admin Approval
            </p>
            <p style="margin: 0; color: #b45309; font-size: 15px; line-height: 1.5;">
              Your account is currently under review by our administration. You will receive another notification once your access is activated.
            </p>
          </div>

          <p style="color: #64748b; font-size: 14px; margin-top: 32px; text-align: center;">
            While you wait, feel free to explore our website or contact support if you have any urgent queries.
          </p>

          <hr style="border: 0; border-top: 1px solid #f1f5f9; margin: 32px 0;" />

          <p style="color: #475569; font-size: 14px; font-weight: 700; margin-bottom: 0;">Best Regards,</p>
          <p style="color: ${PRIMARY_COLOR}; font-size: 15px; font-weight: 800; margin-top: 4px;">The ${APP_NAME} Team</p>
        </div>
        <div style="background-color: #f8fafc; padding: 24px; text-align: center; font-size: 13px; color: #94a3b8; border-top: 1px solid #f1f5f9;">
          &copy; ${new Date().getFullYear()} ${APP_NAME} &bull; Empowering Your Future
        </div>
      </div>
    `,
  };

  try {
    if (!process.env.SMTP_USER || process.env.SMTP_USER === "your-email@gmail.com" || process.env.SMTP_USER === "user") {
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


