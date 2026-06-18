import { NextResponse } from 'next/server';
import { verifyWebhook } from '@clerk/nextjs/webhooks';
import { Resend } from 'resend';

// Inicializa o Resend com a chave do ambiente
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    // Verifica se a requisição realmente veio do Clerk
    const evt = await verifyWebhook(req);

    // Se o evento for "usuário criado"
    if (evt.type === 'user.created') {
      const { email_addresses, first_name } = evt.data;
      const email = email_addresses[0]?.email_address;
      const nome = first_name || 'there'; // Caso não tenha nome, usa "there"

      console.log(`Novo usuário inscrito: ${email}. Enviando e-mail...`);

      // Envia o e-mail via Resend
      await resend.emails.send({
        from: 'CAA-NEURO <noreply@adhdautism.online>', // IMPORTANTE: Use um e-mail do seu domínio
        to: email,
        subject: 'Bem-vindo ao CAA-NEURO! 🎉 Tudo pronto para você começar.',
        html: `
          <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto;">
            <h1>Olá ${nome}!</h1>
            <p>Muito obrigado por se inscrever no <strong>CAA-NEURO</strong>. Estamos muito felizes em ter você conosco!</p>
            
            <p>Queremos lembrar que <strong>todo o nosso aplicativo é 100% gratuito</strong>. Você tem acesso a todas as ferramentas sem nenhum custo.</p>
            
            <h3>O que você encontra por aqui:</h3>
            <ul>
              <li>Ferramenta X para ajudar em Y</li>
              <li>Biblioteca completa de recursos</li>
              <li>Interface intuitiva e fácil de usar</li>
              <!-- Adicione ou remova os recursos do seu app aqui -->
            </ul>

            <p>Já pode começar a explorar tudo agora mesmo:</p>
            <a href="https://www.adhdautism.online/" style="display: inline-block; background-color: #0070f3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0;">
              Acessar o App
            </a>

            <p>Se tiver qualquer dúvida, basta responder a este e-mail.</p>
            <p>Abraços,<br>Equipe CAA-NEURO</p>
          </div>
        `,
      });

      console.log(`E-mail enviado com sucesso para ${email}!`);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Erro ao verificar webhook ou enviar e-mail:', err);
    return NextResponse.json({ error: 'Erro no webhook' }, { status: 400 });
  }
}
