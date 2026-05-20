import { Resend } from "resend";

export async function sendAlertEmail({ subject, message, to }) {
  if (!process.env.RESEND_API_KEY) return;

  const resend = new Resend(process.env.RESEND_API_KEY);

  const recipients = to ? [to, "tdahma2@gmail.com"] : ["tdahma2@gmail.com"];

  await resend.emails.send({
    from: "CAA Neuro <info@adhdautism.online>",
    to: recipients,
    subject,
    html: `
      <h2>${subject}</h2>
      <p>${message.replace(/\n/g, "<br>")}</p>
      <p><strong>Data:</strong> ${new Date().toLocaleString("pt-BR")}</p>
    `,
  });
}
