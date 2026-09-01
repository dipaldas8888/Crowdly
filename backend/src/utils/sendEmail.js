import nodemailer from "nodemailer";

/**
 * Sends an email using the configured transport.
 * In production, reads EMAIL_USER / EMAIL_PASS (Gmail App Password) from .env.
 * In development with no credentials, logs to console as fallback.
 */
export const sendEmail = async ({ to, subject, html, text }) => {
  const emailUser =
    process.env.EMAIL_USER ||
    process.env.SMTP_USER ||
    process.env.MAIL_USER;

  const emailPass =
    process.env.EMAIL_PASS ||
    process.env.SMTP_PASS ||
    process.env.MAIL_PASS;

  const smtpHost = process.env.SMTP_HOST; // optional – if not set, default to Gmail

  // If no credentials configured, log to console and return (dev fallback)
  if (!emailUser || !emailPass) {
    console.log("==========================================");
    console.log("[DEV MAIL - no credentials] To:", to);
    console.log("[DEV MAIL] Subject:", subject);
    console.log("[DEV MAIL] Text:", text || "(HTML email)");
    console.log("==========================================");
    return { messageId: "dev-simulated-no-creds" };
  }

  try {
    // Build transport — if SMTP_HOST is provided, use it; otherwise default to Gmail
    const transportConfig = smtpHost
      ? {
          host: smtpHost,
          port: parseInt(process.env.SMTP_PORT || "587", 10),
          secure: process.env.SMTP_SECURE === "true",
          auth: { user: emailUser, pass: emailPass },
        }
      : {
          // Gmail shorthand — works with App Passwords
          service: "gmail",
          auth: { user: emailUser, pass: emailPass },
        };

    const transporter = nodemailer.createTransport(transportConfig);

    // Verify connection before sending (throws if credentials are wrong)
    await transporter.verify();

    const fromName =
      process.env.SMTP_FROM_NAME ||
      process.env.EMAIL_FROM_NAME ||
      "Crowdly";

    const fromEmail =
      process.env.SMTP_FROM_EMAIL ||
      process.env.EMAIL_FROM ||
      emailUser;

    const info = await transporter.sendMail({
      from: `"${fromName}" <${fromEmail}>`,
      to,
      subject,
      text,
      html,
    });

    console.log(`[EMAIL SENT] MessageId: ${info.messageId}  →  ${to}`);
    return info;
  } catch (error) {
    console.error("[EMAIL ERROR] Failed to send email:", error.message);

    // In development, don't crash the request — just warn
    if (process.env.NODE_ENV !== "production") {
      console.warn("[EMAIL WARN] Falling back to console log (dev mode)");
      console.log("==========================================");
      console.log("[DEV MAIL FALLBACK] To:", to);
      console.log("[DEV MAIL FALLBACK] Subject:", subject);
      console.log("[DEV MAIL FALLBACK] Text:", text || "(HTML email)");
      console.log("==========================================");
      return { messageId: "dev-fallback", error: error.message };
    }

    // In production, rethrow so the caller can return a 500
    throw error;
  }
};
