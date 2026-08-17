# CAA Neuro

Aplicação web de Comunicação Aumentativa e Alternativa (CAA) para criação de pranchas, síntese de voz, acompanhamento de pacientes, sessões clínicas, relatórios, equipes e compartilhamento por link.

## Stack

- Next.js 16 e React 19
- Clerk para autenticação e webhooks de usuários
- Cloudflare D1 como banco relacional, acessado pela API REST em produção
- Cloudflare R2 para imagens enviadas
- Google Cloud TTS e tradução, com fallback para a voz do navegador
- Stripe Checkout incorporado para assinaturas
- Resend para emails transacionais
- Vercel para hospedagem e backup diário por Cron

## Desenvolvimento local

Requisitos: Node.js 20.9 ou superior e uma conta Cloudflare com um banco D1.

```bash
npm ci
cp .env.local.example .env.local
npm run dev
```

Preencha as variáveis em `.env.local`. Para criar as tabelas em um banco novo:

```bash
npx wrangler d1 execute caa-neuro-db --remote --file=schema.sql
```

Validação antes de publicar:

```bash
npm run build
npm audit --omit=dev
```

## Configuração de produção

Cadastre na Vercel todas as variáveis descritas em `.env.local.example`. Os pontos que não podem faltar são:

- `ENCRYPTION_KEY` com exatamente 32 bytes em hexadecimal; sem ela, novos dados clínicos não são gravados em texto aberto.
- `CLERK_WEBHOOK_SECRET` nos endpoints Clerk configurados.
- `STRIPE_WEBHOOK_SECRET` no endpoint `/api/stripe/webhook`.
- `CRON_SECRET` para o backup diário definido em `vercel.json`.
- As três credenciais D1 e as quatro credenciais R2.

Configure `NEXT_PUBLIC_APP_URL` com a origem canônica, por exemplo `https://caa-neuro.vercel.app`, sem barra final.

## Estrutura principal

- `app/app/page.jsx`: prancha clínica principal e recursos de acessibilidade.
- `app/api`: APIs autenticadas, compartilhamento público, cobrança e integrações.
- `lib/d1.js`: adaptador D1 compatível com Vercel e binding nativo.
- `app/lib/crypto.js`: criptografia AES-256-GCM dos campos clínicos.
- `schema.sql`: esquema completo para novos bancos.
- `public/sw.js`: PWA; armazena apenas assets estáticos e pictogramas, nunca respostas clínicas.

## Segurança e dados clínicos

As rotas de pacientes, sessões, relatórios e exportação validam propriedade ou vínculo ativo com a mesma organização. Webhooks Stripe e Clerk exigem assinatura. Pranchas públicas usam tokens aleatórios e expõem apenas os dados necessários para comunicação.

O endpoint `/api/health` verifica a disponibilidade do D1 e a presença das configurações críticas sem retornar segredos.
