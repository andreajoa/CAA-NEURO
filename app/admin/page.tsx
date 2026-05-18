"use client";
import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

export default function AdminPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isLoaded && !user) { router.push("/sign-in"); return; }
    if (user) fetch("/api/admin-stats").then(r=>r.json()).then(d=>{ setStats(d); setLoading(false); });
  }, [isLoaded, user]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-sm text-gray-400">Carregando dados...</div>
    </div>
  );

  const t = stats?.totals || {};
  const recent = stats?.recentSessions || [];
  const perDay = stats?.sessionsPerDay || [];
  const maxDay = Math.max(...perDay.map((d:any)=>d.total), 1);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Painel administrativo</h1>
            <p className="text-sm text-gray-500 mt-1">Bem-vindo, {user?.firstName || user?.emailAddresses[0]?.emailAddress}</p>
          </div>
          <button onClick={()=>router.push("/app")} className="text-sm border border-gray-200 px-4 py-2 rounded-lg text-gray-600 bg-white hover:bg-gray-50">← Voltar ao app</button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          {[
            {label:"Pacientes",value:t.patients,color:"bg-blue-50 text-blue-700",icon:"👤"},
            {label:"Sessões realizadas",value:t.sessions,color:"bg-green-50 text-green-700",icon:"📋"},
            {label:"Cards criados",value:t.cards,color:"bg-purple-50 text-purple-700",icon:"🃏"},
            {label:"Imagens no banco",value:t.images,color:"bg-orange-50 text-orange-700",icon:"🖼️"},
            {label:"Duração média (min)",value:t.avg_duration||"—",color:"bg-teal-50 text-teal-700",icon:"⏱️"},
            {label:"Erros (7 dias)",value:t.errors_7d,color:t.errors_7d>0?"bg-red-50 text-red-700":"bg-gray-50 text-gray-600",icon:"⚠️"},
          ].map(c=>(
            <div key={c.label} className="bg-white rounded-2xl border border-gray-100 p-5">
              <div className={`inline-flex items-center gap-2 text-xs font-medium px-2 py-1 rounded-lg mb-3 ${c.color}`}>
                <span>{c.icon}</span>{c.label}
              </div>
              <div className="text-3xl font-semibold text-gray-900">{c.value}</div>
            </div>
          ))}
        </div>

        {perDay.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-6">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">Sessões nos últimos 30 dias</h2>
            <div className="flex items-end gap-1 h-24">
              {perDay.map((d:any)=>(
                <div key={d.dia} className="flex-1 flex flex-col items-center gap-1 group relative">
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap z-10">{d.dia}: {d.total}</div>
                  <div className="w-full bg-blue-500 rounded-sm transition-all" style={{height:`${Math.max((d.total/maxDay)*80,4)}px`}}></div>
                </div>
              ))}
            </div>
            <div className="flex justify-between text-xs text-gray-400 mt-2">
              <span>{perDay[0]?.dia}</span>
              <span>{perDay[perDay.length-1]?.dia}</span>
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Últimas sessões</h2>
          {recent.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">Nenhuma sessão registrada ainda.</p>
          ) : (
            <table className="w-full text-sm">
              <thead><tr className="border-b border-gray-100">
                <th className="text-left text-xs font-medium text-gray-500 pb-2">Paciente</th>
                <th className="text-left text-xs font-medium text-gray-500 pb-2">Data</th>
                <th className="text-left text-xs font-medium text-gray-500 pb-2">Duração</th>
                <th className="text-left text-xs font-medium text-gray-500 pb-2">Evolução</th>
              </tr></thead>
              <tbody>{recent.map((s:any)=>(
                <tr key={s.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-2 font-medium text-gray-800">{s.paciente_nome||"—"}</td>
                  <td className="py-2 text-gray-500">{new Date(s.created_at).toLocaleDateString("pt-BR")}</td>
                  <td className="py-2 text-gray-500">{s.duracao_minutos ? `${s.duracao_minutos} min` : "—"}</td>
                  <td className="py-2 text-gray-600 max-w-xs truncate">{s.evolucao_observada||"—"}</td>
                </tr>
              ))}</tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
