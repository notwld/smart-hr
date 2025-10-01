import nodemailer from "nodemailer";

export interface CredentialsEmail {
  to: string;
  firstName: string;
  lastName: string;
  username: string;
  password: string;
}

export function getTransport() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    throw new Error("SMTP configuration missing (SMTP_HOST, SMTP_USER, SMTP_PASS)");
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
}

export async function sendCredentialsEmail({ to, firstName, lastName, username, password }: CredentialsEmail) {
  const transporter = getTransport();

  const from = process.env.SMTP_FROM || `HR <${process.env.SMTP_USER}>`;
  const portalUrl = process.env.PORTAL_URL || "http://localhost:3000";

  const html = `
  <div style="font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial; line-height:1.6;">
    <h2 style="margin:0 0 12px">Welcome to Mize Technologies</h2>
    <p>Hi ${firstName} ${lastName},</p>
    <p>Your employee account has been created. Use the credentials below to log in:</p>
    <ul>
      <li><strong>Email</strong>: ${to}</li>
      <li><strong>Password</strong>: ${password}</li>
    </ul>
    <p>Portal: <a href="${portalUrl}">${portalUrl}</a></p>
    <p>You can sign in using your email address. For security, please change your password after first login.</p>
    <p>— HR</p>
  </div>`;

  await transporter.sendMail({
    from,
    to,
    subject: `Your Mize Technologies account credentials`,
    html,
  });
}


