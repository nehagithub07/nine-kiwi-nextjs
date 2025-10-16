// lib/email.ts
import nodemailer from "nodemailer";

type InlineOpts = {
  cidLogoPath?: string;      // e.g., path.join(process.cwd(), "public", "logo.png")
  cidLogoName?: string;      // default: "logo.png"
  cidName?: string;          // default: "ninekiwi-logo"
  attachments?: Array<{
    filename?: string;
    path?: string;
    content?: Buffer | string;
    contentType?: string;
    cid?: string;
  }>;
};

export async function sendEmail(
  to: string,
  subject: string,
  text: string,
  html?: string,
  inline?: InlineOpts
) {
  // Prefer SMTP_* (GoDaddy), else EMAIL_*; last resort: Gmail service
  const host =
    process.env.SMTP_HOST ||
    process.env.EMAIL_HOST ||
    "smtpout.secureserver.net";
  const portStr =
    process.env.SMTP_PORT ||
    process.env.EMAIL_PORT ||
    "465";
  const port = Number(portStr);
  const user =
    process.env.SMTP_USER ||
    process.env.EMAIL_USER;
  const pass =
    process.env.SMTP_PASS ||
    process.env.EMAIL_PASS;

  try {
    const useSmtp = !!user && !!pass;
    const transporter = useSmtp
      ? nodemailer.createTransport({
          host,
          port,
          secure: port === 465, // SSL on 465 for GoDaddy
          auth: { user, pass },
          // Some hosts behind proxies can need this; harmless otherwise:
          tls: { rejectUnauthorized: false },
        })
      : nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
          },
        });

    const fromHeader =
      process.env.EMAIL_FROM ||
      (user ? `"Nine Kiwi" <${user}>` : "no-reply@ninekiwi.app");

    const attachments: NonNullable<InlineOpts["attachments"]> = [];
    if (inline?.cidLogoPath) {
      attachments.push({
        filename: inline.cidLogoName || "logo.png",
        path: inline.cidLogoPath,
        cid: inline.cidName || "ninekiwi-logo",
      });
    }
    if (inline?.attachments?.length) attachments.push(...inline.attachments);

    // Optional but very useful while debugging SMTP creds/port:
    try {
      await transporter.verify();
      console.log("[email] SMTP verified:", host, port);
    } catch (vErr) {
      console.warn("[email] SMTP verify warning:", vErr);
    }

    const info = await transporter.sendMail({
      from: fromHeader,
      to,
      subject,
      text,
      html,
      attachments: attachments.length ? attachments : undefined,
    });

    console.log("[email] sent:", info.messageId);
    return info;
  } catch (error) {
    console.error("[email] send error:", error);
    throw error;
  }
}
