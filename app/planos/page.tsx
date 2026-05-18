"use client";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

export default function PlanosPage() {
  const { user } = useUser();
  const router = useRouter();

  const planos = [
    {
      nome: "Gratuito",
      preco: "R$ 0",
      periodo: "para sempre",
      cor: "border-gray-200",
      badge: null,
      recursos: [
        "✅ Até 3 pacientes",
        "✅ Cards da biblioteca padrão",
        "✅ Histórico de sessões",
        "✅ Exportação CSV",
        "❌ Geração de imagens com IA",
        "❌ Relatório PDF",
        "❌ Exportação Excel",
        "❌ Insights clínicos com IA",
      ],
      cta: "Plano atual",
      disabled: true,
    },
    {
      nome: "Pro",
      preco: "R$ 49",
      periodo: "por mês",
      cor: "border-blue-500",
      badge: "Mais popular",
      recursos: [
        "✅ Pacientes ilimitados",
        "✅ Cards da biblioteca padrão",
        "✅ Histórico de sessões",
        "✅ Exportação CSV",
        "✅ Geração de imagens com IA",
        "✅ Relatório PDF profissional",
        "✅ Exportação Excel",
        "✅ Insights clínicos com IA",
      ],
      cta: "Assinar Pro",
      disabled: false,
    },
    {
      nome: "Institucional",
      preco: "Sob consulta",
      periodo: "por instituição",
      cor: "border-purple-400",
      badge: "Para prefeituras e clínicas",
      recursos: [
        "✅ Tudo do plano Pro",
        "✅ Múltiplos profissionais",
        "✅ Painel gestor centralizado",
        "✅ Relatórios por unidade",
        "✅ Onboarding dedicado",
        "✅ Suporte prioritário",
        "✅ Contrato e NF",
        "✅ Conformidade LGPD completa",
      ],
      cta: "Falar com equipe",
      disabled: false,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-semibold text-gray-900 mb-3">Planos CAA Neuro</h1>
          <p className="text-gray-500 text-base">Comece grátis. Escale quando precisar.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {planos.map((p) => (
            <div key={p.nome} className={`bg-white rounded-2xl border-2 ${p.cor} p-6 flex flex-col`}>
              {p.badge && (
                <div className={`text-xs font-medium px-3 py-1 rounded-full mb-4 self-start ${p.nome === "Pro" ? "bg-blue-50 text-blue-700" : "bg-purple-50 text-purple-700"}`}>
                  {p.badge}
                </div>
              )}
              <h2 className="text-lg font-semibold text-gray-900 mb-1">{p.nome}</h2>
              <div className="mb-6">
                <span className="text-3xl font-semibold text-gray-900">{p.preco}</span>
                <span className="text-sm text-gray-400 ml-1">{p.periodo}</span>
              </div>
              <ul className="space-y-2 mb-8 flex-1">
                {p.recursos.map((r) => (
                  <li key={r} className="text-sm text-gray-600">{r}</li>
                ))}
              </ul>
              <button
                disabled={p.disabled}
                onClick={() => {
                  if (p.nome === "Institucional") {
                    window.location.href = "mailto:contato@caa-neuro.com.br?subject=Plano Institucional";
                  } else if (!p.disabled) {
                    alert("Em breve: integração com pagamento. Entre em contato: contato@caa-neuro.com.br");
                  }
                }}
                className={`w-full py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  p.disabled
                    ? "bg-gray-100 text-gray-400 cursor-default"
                    : p.nome === "Pro"
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "border border-purple-300 text-purple-700 hover:bg-purple-50"
                }`}
              >
                {p.cta}
              </button>
            </div>
          ))}
        </div>

        <p className="text-center text-xs text-gray-400 mt-8">
          Dúvidas? <a href="mailto:contato@caa-neuro.com.br" className="text-blue-600 underline">contato@caa-neuro.com.br</a>
        </p>
      </div>
    </div>
  );
}
