import { Resend } from "resend";

export async function sendAlertEmail({ subject, message }) {
  if (!process.env.RESEND_API_KEY) return;

  const resend = new Resend(process.env.RESEND_API_KEY);

  await resend.emails.send({
    from: "CAA Neuro <info@adhdautism.online>",
    to: ["tdahma2@gmail.com"],
    subject,
    html: `
      <h2>Alerta CAA Neuro</h2>
      <p>${message}</p>
      <p><strong>Data:</strong> ${new Date().toLocaleString("pt-BR")}</p>
    `,
  });
}
