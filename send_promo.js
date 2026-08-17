const { Resend } = require('resend');
const fs = require('fs');
const path = require('path');

const envPath = path.join(process.env.HOME, 'downloads/CAA-NEURO/.env.local');
const envFile = fs.readFileSync(envPath, 'utf8');
const envVars = {};
envFile.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) envVars[match[1].trim()] = match[2].trim();
});

const resend = new Resend(envVars.RESEND_API_KEY);

async function run() {
  // Usando URLs diretas da pasta public (funciona 100% no Gmail)
  const urls = [
    'https://caa-neuro.vercel.app/1.jpg',
    'https://caa-neuro.vercel.app/2.jpg',
    'https://caa-neuro.vercel.app/3.jpg'
  ];

  const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #0f172a; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #333333;">

  <!-- Wrapper -->
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #0f172a; padding: 32px 15px;">
    <tr>
      <td align="center">
        
        <!-- Container Principal -->
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; max-width: 600px; width: 100%; box-shadow: 0 10px 25px rgba(0,0,0,0.2);">
          
          <!-- Header -->
          <tr>
            <td style="background-color: #1B2D5B; padding: 30px 40px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 26px; letter-spacing: 1px;">
                🧠 <span style="color: #C76B4A;">CAA</span> Neuro
              </h1>
            </td>
          </tr>

          <!-- Hero Image -->
          <tr>
            <td style="padding: 0; display: block;">
              <img src="${urls[0]}" alt="Plataforma CAA Neuro" width="600" style="width: 100%; max-width: 600px; height: auto; display: block; border-bottom: 4px solid #C76B4A;">
            </td>
          </tr>

          <!-- Hook & Story (Russell Brunson) -->
          <tr>
            <td style="padding: 40px 50px 20px 50px;">
              <h2 style="margin: 0 0 20px 0; color: #1B2D5B; font-size: 24px; line-height: 1.3; text-align: left;">
                A frustração de ver alguém preso na própria mente.
              </h2>
              <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 1.6; color: #4a5568;">
                Você sabe exatamente como é. O olhar de quem quer dizer algo, mas não consegue. As horas perdidas tentando montar pranchas de comunicação em softwares travados, caros e complicados. A sensação de que a tecnologia está trabalhando contra você, em vez de a favor.
              </p>
              <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 1.6; color: #4a5568;">
                Eu via isso todos os dias na minha clínica. Como psicopedagoga, a dor das famílias e dos profissionais me consumia. Eu sabia que tinha que existir um jeito melhor. Um jeito de usar a inteligência artificial não para substituir o humano, mas para <strong>dar voz a ele</strong>.
              </p>
              <p style="margin: 0; font-size: 16px; line-height: 1.6; color: #4a5568;">
                Foi aí que tive a epifania que se tornou o <strong style="color: #C76B4A;">CAA Neuro</strong>.
              </p>
            </td>
          </tr>

          <!-- Image Break 2 -->
          <tr>
            <td style="padding: 10px 50px 30px 50px;">
              <img src="${urls[1]}" alt="Funcionalidades" width="500" style="width: 100%; max-width: 500px; border-radius: 12px; display: block; margin: 0 auto; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
            </td>
          </tr>

          <!-- The Offer / Stack -->
          <tr>
            <td style="padding: 10px 50px 30px 50px; background-color: #F8FAFC;">
              <h3 style="margin: 0 0 20px 0; color: #1B2D5B; font-size: 20px; text-align: center;">
                A ferramenta que grandes clínicas usam. Simplificada. Gratuita.
              </h3>
              <p style="margin: 0 0 25px 0; font-size: 15px; line-height: 1.6; color: #4a5568; text-align: center;">
                Não é apenas mais um app. É um movimento de inclusão real. Veja o que você desbloqueia hoje:
              </p>
              
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="padding-bottom: 15px; vertical-align: top; width: 30px;">
                    <span style="color: #1d9e75; font-size: 20px; font-weight: bold;">✓</span>
                  </td>
                  <td style="padding-bottom: 15px; font-size: 15px; line-height: 1.5; color: #2d3748;">
                    <strong>IA de Pictogramas:</strong> Não achou a imagem? A Inteligência Artificial cria um pictograma exclusivo para você em segundos.
                  </td>
                </tr>
                <tr>
                  <td style="padding-bottom: 15px; vertical-align: top; width: 30px;">
                    <span style="color: #1d9e75; font-size: 20px; font-weight: bold;">✓</span>
                  </td>
                  <td style="padding-bottom: 15px; font-size: 15px; line-height: 1.5; color: #2d3748;">
                    <strong>Pranchoteca Inteligente:</strong> Crie, adapte e organize pranchas em minutos, não em horas.
                  </td>
                </tr>
                <tr>
                  <td style="padding-bottom: 15px; vertical-align: top; width: 30px;">
                    <span style="color: #1d9e75; font-size: 20px; font-weight: bold;">✓</span>
                  </td>
                  <td style="padding-bottom: 15px; font-size: 15px; line-height: 1.5; color: #2d3748;">
                    <strong>Voz que Traduz:</strong> Toque no card e ouça em 6 idiomas diferentes. Derrube fronteiras na comunicação.
                  </td>
                </tr>
                <tr>
                  <td style="vertical-align: top; width: 30px;">
                    <span style="color: #1d9e75; font-size: 20px; font-weight: bold;">✓</span>
                  </td>
                  <td style="font-size: 15px; line-height: 1.5; color: #2d3748;">
                    <strong>Gestão Completa:</strong> Acompanhe pacientes, registre sessões e gere PDFs profissionais para a equipe.
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Image Break 3 -->
          <tr>
            <td style="padding: 30px 50px 10px 50px;">
              <img src="${urls[2]}" alt="Resultados Reais" width="500" style="width: 100%; max-width: 500px; border-radius: 12px; display: block; margin: 0 auto; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
            </td>
          </tr>

          <!-- Urgency & CTA -->
          <tr>
            <td style="padding: 30px 50px 50px 50px;">
              <h3 style="margin: 0 0 15px 0; color: #1B2D5B; font-size: 22px; text-align: center; line-height: 1.3;">
                Cada dia sem a ferramenta certa é um dia de silêncio.
              </h3>
              <p style="margin: 0 0 30px 0; font-size: 16px; line-height: 1.6; color: #4a5568; text-align: center;">
                Não espere o amanhã para fazer a diferença. O CAA Neuro é e sempre será <strong>100% gratuito</strong>. Sem taxas, sem cartão de crédito. É a nossa forma de devolver a voz a quem precisa.
              </p>
              
              <!-- Button -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center">
                    <a href="https://caa-neuro.vercel.app/" target="_blank" style="display: inline-block; background-color: #C76B4A; color: #ffffff; text-decoration: none; padding: 18px 45px; border-radius: 8px; font-weight: bold; font-size: 17px; letter-spacing: 0.5px; box-shadow: 0 4px 15px rgba(199, 107, 74, 0.4);">
                      🚀 QUERO LIBERAR A VOZ AGORA
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #1B2D5B; padding: 30px 40px; text-align: center;">
              <p style="margin: 0 0 10px 0; color: #ffffff; font-size: 15px; font-weight: bold;">
                Margareth Almeida
              </p>
              <p style="margin: 0; color: #94a3b8; font-size: 13px;">
                Psicopedagoga · Idealizadora do CAA Neuro
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

  console.log('Enviando email irressitível para andremuseu@gmail.com...');
  await resend.emails.send({
    from: 'CAA Neuro <noreply@caa-neuro.vercel.app>',
    to: 'andremuseu@gmail.com',
    subject: 'O erro que está sabotando a comunicação (e como resolver)',
    html: html
  });
  console.log('✅ Email enviado! Verifique seu Gmail.');
}

run().catch(e => console.error('Erro:', e));
