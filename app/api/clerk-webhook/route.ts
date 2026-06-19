import { NextResponse, NextRequest } from 'next/server';
import { verifyWebhook } from '@clerk/nextjs/webhooks';

export async function POST(req: NextRequest) {
  try {
    const evt = await verifyWebhook(req);

    if (evt.type === 'user.created') {
      const { email_addresses, first_name } = evt.data;
      const email = email_addresses[0]?.email_address;
      const nome = first_name || 'amigo(a)';

      console.log('Novo usuario: ' + email + '. Disparando automacao no Resend...');

      const response = await fetch('https://api.resend.com/automations/events', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + process.env.RESEND_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          event: 'usuario_cadastrado',
          to: email,
          properties: {
            first_name: nome
          }
        }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Erro ao disparar automacao do Resend:', errorData);
      } else {
        console.log('Automacao do Resend disparada com sucesso para ' + email + '!');
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Erro no webhook:', err);
    return NextResponse.json({ error: 'Erro no webhook' }, { status: 400 });
  }
}
