import PublicShell from "../../components/PublicShell";
export const metadata = { title: "Termos de Uso — CAA Neuro" };

export default function TermosPage() {
  return (
    <PublicShell>
      <div className="max-w-3xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-semibold text-gray-900 mb-2">Termos de Uso</h1>
      <p className="text-sm text-gray-500 mb-8">Última atualização: maio de 2025</p>

      {[
        { title: "1. Aceitação", content: "Ao criar uma conta no CAA Neuro, você concorda com estes Termos de Uso e com nossa Política de Privacidade. Se não concordar, não utilize a plataforma." },
        { title: "2. Sobre o serviço", content: "CAA Neuro é uma plataforma digital para profissionais de saúde e educação que trabalham com comunicação aumentativa e alternativa (CAA). A plataforma permite criar cards de comunicação, gerenciar pacientes e registrar sessões clínicas." },
        { title: "3. Responsabilidade profissional", content: "O CAA Neuro é uma ferramenta de apoio e não substitui o julgamento clínico do profissional. O profissional é integralmente responsável pelo uso da plataforma com seus pacientes, pelo consentimento dos responsáveis e pela adequação das intervenções realizadas." },
        { title: "4. Uso permitido", content: "A plataforma pode ser usada por: fonoaudiólogos, terapeutas ocupacionais, psicólogos, pedagogos, professores de educação especial e demais profissionais habilitados. É proibido: compartilhar credenciais, usar a plataforma para fins não clínicos ou educacionais, inserir dados falsos de pacientes." },
        { title: "5. Dados de pacientes", content: "O profissional é o controlador dos dados de seus pacientes conforme a LGPD. O CAA Neuro atua como operador. O profissional é responsável por obter o consentimento adequado dos pacientes ou seus responsáveis legais antes de inserir dados na plataforma." },
        { title: "6. Propriedade intelectual", content: "O software, design e conteúdo do CAA Neuro são de propriedade exclusiva da empresa. Os dados inseridos pelo profissional (cards personalizados, prontuários) pertencem ao profissional." },
        { title: "7. Disponibilidade", content: "Nos comprometemos com 99,5% de disponibilidade mensal. Manutenções programadas serão comunicadas com antecedência. Não nos responsabilizamos por interrupções causadas por terceiros (Cloudflare, Clerk, etc.)." },
        { title: "8. Cancelamento", content: "Você pode cancelar sua conta a qualquer momento. Após o cancelamento, seus dados serão mantidos por 30 dias para possível reativação e então excluídos permanentemente." },
        { title: "9. Contato", content: "contato@caa-neuro.com.br" },
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
