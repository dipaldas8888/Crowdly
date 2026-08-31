import nodemailer from "nodemailer";

export const sendEmail = async ({ to, subject, html, text }) => {
  try {
    // If SMTP host is configured in process.env, use real nodemailer transporter
    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || "587", 10),
        secure: process.env.SMTP_SECURE === "true",
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      const info = await transporter.sendMail({
        from: `"${process.env.SMTP_FROM_NAME || "Crowdly App"}" <${process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER}>`,
        to,
        subject,
        text,
        html,
      });

      console.log(`[EMAIL SENT] MessageId: ${info.messageId} to ${to}`);
      return info;
    }

    // Development fallback: Log email content to server console safely
    console.log("==========================================");
    console.log(`[DEV MAIL SENDER] To: ${to}`);
    console.log(`[DEV MAIL SENDER] Subject: ${subject}`);
    console.log(`[DEV MAIL SENDER] Body Snippet: ${text || "HTML Email"}`);
    console.log("==========================================");

    return { messageId: "dev-simulated-mail-id" };
  } catch (error) {
    console.error("[EMAIL ERROR] Failed to send email:", error);
    // Don't crash request in dev fallback mode
    return { error: error.message };
  }
};
