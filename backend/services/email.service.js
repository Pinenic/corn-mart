import { transporter } from "../config/mailer.js";

export async function sendEmail({ to, subject, html }) {
  return transporter.sendMail({
    from: `"Corn Mart" <no-reply@test-vz9dlem75eq4kj50.mlsender.net>`,
    to,
    subject,
    html
  });
}
