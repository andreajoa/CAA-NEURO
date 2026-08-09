import { Resend } from "resend";

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, character => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[character]);
}

export async function sendAlertEmail({ subject, message, to }) {
  if (!process.env.RESEND_API_KEY) return;

  const resend = new Resend(process.env.RESEND_API_KEY);

  const recipients = to ? [to] : [process.env.ADMIN_EMAIL || "tdahma2@gmail.com"];
  const safeSubject = String(subject || "Alerta CAA Neuro").slice(0, 160);
  const safeMessage = escapeHtml(String(message || "").slice(0, 5000)).replace(/\n/g, "<br>");

  await resend.emails.send({
    from: "CAA Neuro <info@adhdautism.online>",
    to: recipients,
    subject: safeSubject,
    html: `
      <h2>${escapeHtml(safeSubject)}</h2>
      <p>${safeMessage}</p>
      <p><strong>Data:</strong> ${new Date().toLocaleString("pt-BR")}</p>
    `,
  });
}
