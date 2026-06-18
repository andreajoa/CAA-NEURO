import { NextResponse, NextRequest } from 'next/server';
import { verifyWebhook } from '@clerk/nextjs/webhooks';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const evt = await verifyWebhook(req);

    if (evt.type === 'user.created') {
      const { email_addresses, first_name } = evt.data;
      const email = email_addresses[0]?.email_address;
      const nome = first_name || 'amigo(a)';

      console.log(`Novo usuário inscrito: ${email}. Enviando e-mail...`);

      await resend.emails.send({
        from: 'CAA Neuro <noreply@adhdautism.online>',
        to: email,
        subject: 'Toda pessoa merece ser compreendida. Sua jornada começa agora.',
        html: `
          <div style="font-family: Arial, sans-serif; color: #1B2D5B; max-width: 600px; margin: 0 auto; background-color: #F2E8E1; padding: 24px;">
            <div style="background-color: #ffffff; padding: 40px;">
              
              <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #C76B4A; padding-bottom: 20px;">
                <h1 style="font-size: 28px; margin: 0; color: #1B2D5B; letter-spacing: 1px;">
                  🧠 <span style="color: #C76B4A;">CAA</span> Neuro
                </h1>
              </div>

              <h2 style="font-size: 22px; line-height: 1.4; color: #1B2D5B;">Toda pessoa merece ser compreendida. E a sua jornada para garantir isso começa agora.</h2>

              <p style="font-size: 16px; line-height: 1.6; color: #405047;">
                Olá ${nome},
              </p>

              <p style="font-size: 16px; line-height: 1.6; color: #405047;">
                Se você é como a maioria dos profissionais e familiares que chegam até aqui, você sabe a frustração de ver alguém querendo se expressar, mas não conseguindo. Você sabe a dor de procurar ferramentas de Comunicação Alternativa e Ampliada (CAA) que sejam boas, adaptáveis e que não custem uma fortuna.
              </p>

              <p style="font-size: 16px; line-height: 1.6; color: #405047;">
                Foi exatamente por enxergar essa lacuna que a <strong>Margareth Almeida</strong> (Psicopedagoga) decidiu criar o CAA Neuro. Não como mais um software corporativo frio, mas como um movimento de inclusão real.
              </p>

              <p style="font-size: 16px; line-height: 1.6; color: #405047;">
                E eu tenho uma excelente notícia para você: <strong style="color: #1d9e75;">O CAA Neuro é e sempre será 100% gratuito para você usar.</strong> Sem taxas escondidas, sem "teste de 7 dias". É a nossa forma de devolver a voz a quem precisa.
              </p>

              <div style="background-color: #F2E8E1; border-left: 4px solid #C76B4A; padding: 20px; margin: 24px 0; border-radius: 4px;">
                <p style="font-size: 16px; margin-top: 0; color: #1B2D5B;"><strong>O que você acaba de desbloquear com sua conta:</strong></p>
                <ul style="font-size: 15px; line-height: 1.8; color: #405047; padding-left: 20px; margin-bottom: 0;">
                  <li><strong>Pranchoteca Inteligente:</strong> Crie e adapte pranchas em minutos, não em horas.</li>
                  <li><strong>Voz que Traduz:</strong> Toque no card e ouça em 6 idiomas diferentes. Abarre fronteiras na comunicação.</li>
                  <li><strong>IA de Pictogramas:</strong> Não encontrou a imagem certa? Nossa Inteligência Artificial cria um pictograma exclusivo para você na hora.</li>
                  <li><strong>Gestão Completa:</strong> Acompanhe pacientes, registre sessões e gere PDFs profissionais para a equipe ou família.</li>
                </ul>
              </div>

              <p style="font-size: 16px; line-height: 1.6; color: #405047;">
                Você tem agora nas mãos a mesma tecnologia que grandes clínicas usam, mas simplificada e gratuita. 
              </p>

              <div style="text-align: center; margin: 36px 0;">
                <a href="https://www.adhdautism.online/" style="display: inline-block; background-color: #1d9e75; color: white; padding: 16px 36px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 18px;">
                  🚀 Entrar no App e Começar Agora
                </a>
              </div>

              <p style="font-size: 16px; line-height: 1.6; color: #405047;">
                Não espere o amanhã para fazer a diferença. Sua primeira prancha está a apenas um clique de distância.
              </p>

              <p style="font-size: 16px; line-height: 1.6; color: #405047;">
                Com propósito e gratidão por você estar aqui,<br><br>
                <strong>Margareth Almeida</strong><br>
                <span style="font-size: 14px; color: #888;">Psicopedagoga · Idealizadora do CAA Neuro</span>
              </p>
            </div>
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
