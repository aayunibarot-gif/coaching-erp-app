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

export const sendApprovalEmailToAdmin = async (studentName, studentEmail) => {
  const mailOptions = {
    from: '"Coaching ERP" <noreply@coaching-erp.com>',
    to: process.env.ADMIN_EMAIL || "admin@coaching-erp.com", // Assuming an admin email
    subject: "New Student Registration - Pending Approval",
    text: `A new student has registered and is pending approval.\n\nName: ${studentName}\nEmail: ${studentEmail}\n\nPlease log in to the admin dashboard to approve them.`,
    html: `<p>A new student has registered and is pending approval.</p>
           <ul>
             <li><strong>Name:</strong> ${studentName}</li>
             <li><strong>Email:</strong> ${studentEmail}</li>
           </ul>
           <p>Please log in to the admin dashboard to approve them.</p>`,
  };

  try {
    if (!process.env.SMTP_USER || process.env.SMTP_USER === "user") {
      console.log("-------------------------------------------------------");
      console.log("EMAIL MOCK: Sending email to admin...");
      console.log(`Subject: ${mailOptions.subject}`);
      console.log(`To: ${mailOptions.to}`);
      console.log(`Body: ${mailOptions.text}`);
      console.log("-------------------------------------------------------");
      return;
    }

    await transporter.sendMail(mailOptions);
    console.log("Approval email sent to admin.");
  } catch (error) {
    console.error("Error sending email:", error);
  }
};

export const sendApprovalSuccessEmailToStudent = async (studentName, studentEmail) => {
  const mailOptions = {
    from: '"Coaching ERP" <noreply@coaching-erp.com>',
    to: studentEmail,
    subject: "Account Approved - Welcome to Eduverse Coaching!",
    text: `Hello ${studentName},\n\nYour account has been approved by the admin. You can now log in to your dashboard.\n\nThank you!`,
    html: `<p>Hello ${studentName},</p>
           <p>Your account has been <strong>approved</strong> by the admin.</p>
           <p>You can now log in to your dashboard and access all features.</p>
           <p>Welcome to Eduverse Coaching!</p>`,
  };

  try {
    if (!process.env.SMTP_USER || process.env.SMTP_USER === "user") {
      console.log("-------------------------------------------------------");
      console.log("EMAIL MOCK: Sending approval success email to STUDENT...");
      console.log(`Subject: ${mailOptions.subject}`);
      console.log(`To: ${mailOptions.to}`);
      console.log(`Body: ${mailOptions.text}`);
      console.log("-------------------------------------------------------");
      return;
    }

    await transporter.sendMail(mailOptions);
    console.log(`Approval success email sent to student: ${studentEmail}`);
  } catch (error) {
    console.error("Error sending approval success email:", error);
  }
};
