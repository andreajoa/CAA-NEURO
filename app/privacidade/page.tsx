import PublicShell from "../../components/PublicShell";
export const metadata = { title: "Política de Privacidade — CAA Neuro" };

export default function PrivacidadePage() {
  return (
    <PublicShell>
      <div className="max-w-3xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-semibold text-gray-900 mb-2">Política de Privacidade</h1>
      <p className="text-sm text-gray-500 mb-8">Última atualização: maio de 2025</p>

      {[
        { title: "1. Quem somos", content: "CAA Neuro é uma plataforma de comunicação aumentativa e alternativa (CAA) desenvolvida para profissionais de saúde e educação. Operamos em conformidade com a Lei Geral de Proteção de Dados (LGPD — Lei nº 13.709/2018)." },
        { title: "2. Dados que coletamos", content: "Coletamos: nome e e-mail do profissional (via autenticação Clerk); dados clínicos de pacientes inseridos pelo profissional (nome, diagnóstico, histórico de sessões); imagens enviadas para o banco de cards; logs de uso e erros técnicos. Não coletamos dados de menores diretamente — os dados de pacientes são inseridos exclusivamente pelo profissional responsável." },
        { title: "3. Como usamos os dados", content: "Os dados são usados exclusivamente para: permitir o funcionamento da plataforma; salvar e recuperar prontuários clínicos; gerar relatórios de evolução; melhorar a experiência do produto. Não vendemos, alugamos ou compartilhamos seus dados com terceiros para fins comerciais." },
        { title: "4. Armazenamento e segurança", content: "Todos os dados são armazenados em infraestrutura da Cloudflare (D1 e R2), com criptografia em trânsito (TLS 1.3) e em repouso. O acesso é autenticado via Clerk com separação total por usuário — nenhum profissional acessa dados de outro." },
        { title: "5. Seus direitos (LGPD)", content: "Você tem direito a: acessar seus dados; corrigir dados incorretos; solicitar exclusão de todos os seus dados; exportar seus dados; revogar o consentimento a qualquer momento. Para exercer qualquer direito, entre em contato: privacidade@caa-neuro.com.br" },
        { title: "6. Retenção de dados", content: "Seus dados são mantidos enquanto sua conta estiver ativa. Ao excluir sua conta, todos os dados são removidos permanentemente em até 30 dias." },
        { title: "7. Cookies", content: "Usamos apenas cookies essenciais para autenticação (Clerk). Não usamos cookies de rastreamento ou publicidade." },
        { title: "8. Contato", content: "Para dúvidas sobre esta política: privacidade@caa-neuro.com.br" },
      ].map(s => (
        <div key={s.title} className="mb-6">
          <h2 className="text-base font-semibold text-gray-800 mb-2">{s.title}</h2>
          <p className="text-sm text-gray-600 leading-relaxed">{s.content}</p>
        </div>
      ))}
      </div>
    </PublicShell>
  );
}
