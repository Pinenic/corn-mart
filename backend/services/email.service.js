import { transporter } from "../config/mailer.js";

export async function sendEmail({ to, subject, html }) {
  return transporter.sendMail({
    from: `"Corn Mart" <cornmart@pinapps.net>`,
    to,
    subject,
    html
  });
}
