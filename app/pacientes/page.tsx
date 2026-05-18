"use client";
import { useState, useEffect } from "react";

type Patient = {
  id: number; nome: string; data_nascimento?: string; diagnostico?: string;
  responsavel?: string; escola?: string; medicamentos?: string;
  objetivos_terapeuticos?: string; observacoes?: string; created_at?: string;
};

type Insights = {
  progresso: string; pontos_fortes: string[]; areas_atencao: string[];
  sugestoes: string[]; tendencia: string; proximos_passos: string;
  total_sessoes: number; media_duracao: number;
};

const emptyForm = { nome:"", data_nascimento:"", diagnostico:"", responsavel:"", escola:"", medicamentos:"", objetivos_terapeuticos:"", observacoes:"" };

export default function PacientesPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState<Patient|null>(null);
  const [selected, setSelected] = useState<Patient|null>(null);
  const [sessions, setSessions] = useState<any[]>([]);
  const [sessionForm, setSessionForm] = useState({ evolucao_observada:"", notas:"", objetivos_sessao:"", duracao_minutos:"" });
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<"list"|"form"|"prontuario">("list");
  const [insights, setInsights] = useState<Insights|null>(null);
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [insightsError, setInsightsError] = useState("");
  const [showInsights, setShowInsights] = useState(false);

  const load = async () => {
    const r = await fetch("/api/patients");
    const d = await r.json();
    setPatients(d.patients || []);
  };

  const loadSessions = async (pid: number) => {
    const r = await fetch(`/api/sessions?patient_id=${pid}`);
    const d = await r.json();
    setSessions(d.sessions || []);
  };

  useEffect(() => { load(); }, []);

  const save = async () => {
    setLoading(true);
    const method = editing ? "PUT" : "POST";
    const body = editing ? { ...form, id: editing.id } : form;
    await fetch("/api/patients", { method, headers:{"Content-Type":"application/json"}, body: JSON.stringify(body) });
    setForm(emptyForm); setEditing(null); setView("list");
    await load(); setLoading(false);
  };

  const del = async (id: number) => {
    if (!confirm("Excluir paciente e todo seu histórico?")) return;
    await fetch(`/api/patients?id=${id}`, { method:"DELETE" });
    await load();
  };

  const openProntuario = async (p: Patient) => {
    setSelected(p);
    setInsights(null);
    setShowInsights(false);
    await loadSessions(p.id);
    setView("prontuario");
    await fetch("/api/audit", {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify({ acao: "abriu_prontuario", recurso: "patient", recurso_id: String(p.id), detalhes: p.nome }),
    }).catch(() => {});
  };

  const saveSession = async () => {
    if (!selected) return;
    setLoading(true);
    await fetch("/api/sessions", {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify({ patient_id: selected.id, ...sessionForm, duracao_minutos: sessionForm.duracao_minutos ? Number(sessionForm.duracao_minutos) : null })
    });
    setSessionForm({ evolucao_observada:"", notas:"", objetivos_sessao:"", duracao_minutos:"" });
    await loadSessions(selected.id);
    setLoading(false);
  };

  const loadInsights = async () => {
    if (!selected) return;
    setInsightsLoading(true);
    setInsightsError("");
    setShowInsights(true);
    try {
      const r = await fetch(`/api/insights?patient_id=${selected.id}`);
      const d = await r.json();
      if (d.message) { setInsightsError(d.message); setInsights(null); }
      else if (d.insights) { setInsights(d.insights); }
      else { setInsightsError(d.error || "Erro ao gerar insights."); }
    } catch { setInsightsError("Erro de conexão. Tente novamente."); }
    finally { setInsightsLoading(false); }
  };

  const tendenciaCor: Record<string, string> = {
    crescente: "#16a34a",
    estável: "#2563eb",
    requer_atenção: "#dc2626",
  };

  const tendenciaLabel: Record<string, string> = {
    crescente: "📈 Crescente",
    estável: "➡️ Estável",
    requer_atenção: "⚠️ Requer atenção",
  };

  const inp = "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";
  const lbl = "block text-xs font-medium text-gray-600 mb-1";
  const btn = "px-4 py-2 rounded-lg text-sm font-medium cursor-pointer";

  if (view === "form") return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={()=>{setView("list");setEditing(null);setForm(emptyForm);}} className="text-gray-500 hover:text-gray-800 text-sm">← Voltar</button>
        <h1 className="text-xl font-semibold">{editing ? "Editar Paciente" : "Novo Paciente"}</h1>
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2"><label className={lbl}>Nome completo *</label><input className={inp} value={form.nome} onChange={e=>setForm({...form,nome:e.target.value})} placeholder="Nome do paciente" /></div>
          <div><label className={lbl}>Data de nascimento</label><input type="date" className={inp} value={form.data_nascimento} onChange={e=>setForm({...form,data_nascimento:e.target.value})} /></div>
          <div><label className={lbl}>Diagnóstico</label><input className={inp} value={form.diagnostico} onChange={e=>setForm({...form,diagnostico:e.target.value})} placeholder="Ex: TEA, PCI..." /></div>
          <div><label className={lbl}>Responsável</label><input className={inp} value={form.responsavel} onChange={e=>setForm({...form,responsavel:e.target.value})} placeholder="Nome do responsável" /></div>
          <div><label className={lbl}>Escola</label><input className={inp} value={form.escola} onChange={e=>setForm({...form,escola:e.target.value})} placeholder="Nome da escola" /></div>
          <div className="col-span-2"><label className={lbl}>Medicamentos</label><input className={inp} value={form.medicamentos} onChange={e=>setForm({...form,medicamentos:e.target.value})} placeholder="Medicamentos em uso" /></div>
          <div className="col-span-2"><label className={lbl}>Objetivos terapêuticos</label><textarea className={inp} rows={3} value={form.objetivos_terapeuticos} onChange={e=>setForm({...form,objetivos_terapeuticos:e.target.value})} placeholder="Descreva os objetivos da terapia..." /></div>
          <div className="col-span-2"><label className={lbl}>Observações</label><textarea className={inp} rows={3} value={form.observacoes} onChange={e=>setForm({...form,observacoes:e.target.value})} placeholder="Observações gerais..." /></div>
        </div>
        <div className="flex gap-3 pt-2">
          <button onClick={save} disabled={loading||!form.nome} className={`${btn} bg-blue-600 text-white disabled:opacity-50`}>{loading?"Salvando...":"Salvar Paciente"}</button>
          <button onClick={()=>{setView("list");setEditing(null);setForm(emptyForm);}} className={`${btn} border border-gray-200 text-gray-600`}>Cancelar</button>
        </div>
      </div>
    </div>
  );

  if (view === "prontuario" && selected) return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <button onClick={()=>setView("list")} className="text-gray-500 hover:text-gray-800 text-sm">← Pacientes</button>
        <h1 className="text-xl font-semibold">{selected.nome}</h1>
        <div className="ml-auto flex gap-2 flex-wrap">
          <a href={`/api/report?patient_id=${selected.id}`} target="_blank" className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 font-medium">PDF</a>
          <a href={`/api/export?patient_id=${selected.id}&format=xlsx`} className="text-xs border border-gray-200 text-gray-600 px-3 py-1.5 rounded-lg hover:bg-gray-50 font-medium">Excel</a>
          <a href={`/api/export?patient_id=${selected.id}&format=csv`} className="text-xs border border-gray-200 text-gray-600 px-3 py-1.5 rounded-lg hover:bg-gray-50 font-medium">CSV</a>
          <button onClick={()=>{setEditing(selected);setForm({nome:selected.nome,data_nascimento:selected.data_nascimento||"",diagnostico:selected.diagnostico||"",responsavel:selected.responsavel||"",escola:selected.escola||"",medicamentos:selected.medicamentos||"",objetivos_terapeuticos:selected.objetivos_terapeuticos||"",observacoes:selected.observacoes||""});setView("form");}} className="text-xs border border-gray-200 px-3 py-1.5 rounded-lg text-gray-600">Editar</button>
        </div>
      </div>

      {/* Dados clínicos */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {([["Diagnóstico",selected.diagnostico],["Responsável",selected.responsavel],["Escola",selected.escola],["Medicamentos",selected.medicamentos]] as [string,string|undefined][]).map(([k,v])=> v ? (
          <div key={k} className="bg-white rounded-xl border border-gray-100 p-4">
            <div className="text-xs text-gray-500 mb-1">{k}</div>
            <div className="text-sm font-medium text-gray-800">{v}</div>
          </div>
        ) : null)}
        {selected.objetivos_terapeuticos && (
          <div className="col-span-2 bg-blue-50 rounded-xl border border-blue-100 p-4">
            <div className="text-xs text-blue-600 mb-1">Objetivos terapêuticos</div>
            <div className="text-sm text-blue-800">{selected.objetivos_terapeuticos}</div>
          </div>
        )}
      </div>

      {/* Painel de Insights IA */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-sm font-semibold">Análise clínica com IA</h2>
            <p className="text-xs text-gray-400 mt-0.5">Baseada no histórico de sessões registradas</p>
          </div>
          <button
            onClick={loadInsights}
            disabled={insightsLoading}
            className="text-xs bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 font-medium disabled:opacity-50"
          >
            {insightsLoading ? "Analisando..." : showInsights ? "Atualizar análise" : "✨ Gerar insights"}
          </button>
        </div>

        {insightsLoading && (
          <div className="flex items-center gap-3 py-6 justify-center">
            <div className="w-5 h-5 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-sm text-gray-500">A IA está analisando as sessões...</span>
          </div>
        )}

        {insightsError && !insightsLoading && (
          <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 text-sm text-amber-700">{insightsError}</div>
        )}

        {insights && !insightsLoading && (
          <div className="space-y-4">
            {/* Tendência + progresso */}
            <div className="flex items-start gap-4">
              <div className="flex-1 bg-gray-50 rounded-xl p-4">
                <div className="text-xs text-gray-500 mb-1">Progresso geral</div>
                <div className="text-sm text-gray-800 font-medium">{insights.progresso}</div>
              </div>
              <div className="text-center bg-gray-50 rounded-xl p-4 min-w-[100px]">
                <div className="text-xs text-gray-500 mb-1">Tendência</div>
                <div className="text-sm font-semibold" style={{color: tendenciaCor[insights.tendencia] || "#374151"}}>
                  {tendenciaLabel[insights.tendencia] || insights.tendencia}
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-blue-50 rounded-xl p-3 text-center">
                <div className="text-2xl font-semibold text-blue-700">{insights.total_sessoes}</div>
                <div className="text-xs text-blue-500">sessões registradas</div>
              </div>
              <div className="bg-green-50 rounded-xl p-3 text-center">
                <div className="text-2xl font-semibold text-green-700">{insights.media_duracao || "—"}</div>
                <div className="text-xs text-green-500">min por sessão (média)</div>
              </div>
            </div>

            {/* Pontos fortes */}
            {insights.pontos_fortes?.length > 0 && (
              <div>
                <div className="text-xs font-semibold text-green-700 mb-2">✅ Pontos fortes</div>
                <ul className="space-y-1">
                  {insights.pontos_fortes.map((p,i) => <li key={i} className="text-sm text-gray-700 flex gap-2"><span className="text-green-500">•</span>{p}</li>)}
                </ul>
              </div>
            )}

            {/* Áreas de atenção */}
            {insights.areas_atencao?.length > 0 && (
              <div>
                <div className="text-xs font-semibold text-amber-700 mb-2">⚠️ Áreas de atenção</div>
                <ul className="space-y-1">
                  {insights.areas_atencao.map((a,i) => <li key={i} className="text-sm text-gray-700 flex gap-2"><span className="text-amber-500">•</span>{a}</li>)}
                </ul>
              </div>
            )}

            {/* Sugestões */}
            {insights.sugestoes?.length > 0 && (
              <div>
                <div className="text-xs font-semibold text-purple-700 mb-2">💡 Sugestões para próximas sessões</div>
                <ul className="space-y-1">
                  {insights.sugestoes.map((s,i) => <li key={i} className="text-sm text-gray-700 flex gap-2"><span className="text-purple-500">•</span>{s}</li>)}
                </ul>
              </div>
            )}

            {/* Próximos passos */}
            {insights.proximos_passos && (
              <div className="bg-purple-50 border border-purple-100 rounded-xl p-4">
                <div className="text-xs font-semibold text-purple-700 mb-1">🎯 Próximos passos recomendados</div>
                <div className="text-sm text-purple-800">{insights.proximos_passos}</div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Registrar sessão */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-5">
        <h2 className="text-sm font-semibold mb-4">Registrar sessão</h2>
        <div className="space-y-3">
          <div><label className={lbl}>Evolução observada</label><textarea className={inp} rows={2} value={sessionForm.evolucao_observada} onChange={e=>setSessionForm({...sessionForm,evolucao_observada:e.target.value})} placeholder="Como foi a sessão? O que o paciente fez?" /></div>
          <div><label className={lbl}>Objetivos da sessão</label><input className={inp} value={sessionForm.objetivos_sessao} onChange={e=>setSessionForm({...sessionForm,objetivos_sessao:e.target.value})} placeholder="O que foi trabalhado hoje?" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className={lbl}>Duração (min)</label><input type="number" className={inp} value={sessionForm.duracao_minutos} onChange={e=>setSessionForm({...sessionForm,duracao_minutos:e.target.value})} placeholder="45" /></div>
            <div><label className={lbl}>Notas</label><input className={inp} value={sessionForm.notas} onChange={e=>setSessionForm({...sessionForm,notas:e.target.value})} placeholder="Observações da sessão" /></div>
          </div>
          <button onClick={saveSession} disabled={loading||!sessionForm.evolucao_observada} className={`${btn} bg-green-600 text-white disabled:opacity-50`}>{loading?"Salvando...":"Salvar sessão"}</button>
        </div>
      </div>

      {/* Histórico */}
      <div>
        <h2 className="text-sm font-semibold mb-3">Histórico de sessões ({sessions.length})</h2>
        {sessions.length === 0 ? (
          <div className="text-sm text-gray-400 py-4 text-center">Nenhuma sessão registrada ainda.</div>
        ) : sessions.map((s,i) => (
          <div key={s.id} className="bg-white rounded-xl border border-gray-100 p-4 mb-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-gray-500">Sessão #{sessions.length - i}</span>
              <span className="text-xs text-gray-400">{new Date(s.created_at).toLocaleDateString("pt-BR")}{s.duracao_minutos ? ` · ${s.duracao_minutos} min` : ""}</span>
            </div>
            {s.evolucao_observada && <p className="text-sm text-gray-700 mb-1">{s.evolucao_observada}</p>}
            {s.objetivos_sessao && <p className="text-xs text-blue-600">Objetivo: {s.objetivos_sessao}</p>}
            {s.notas && <p className="text-xs text-gray-400 mt-1">Nota: {s.notas}</p>}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold">Pacientes</h1>
        <div className="flex gap-3">
          <a href="/admin" className="text-xs border border-gray-200 px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-50">Painel admin</a>
          <button onClick={()=>setView("form")} className={`${btn} bg-blue-600 text-white`}>+ Novo Paciente</button>
        </div>
      </div>
      {patients.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <div className="text-4xl mb-3">👤</div>
          <p className="text-sm">Nenhum paciente cadastrado ainda.</p>
          <button onClick={()=>setView("form")} className="mt-3 text-blue-600 text-sm underline">Cadastrar primeiro paciente</button>
        </div>
      ) : patients.map(p => (
        <div key={p.id} className="bg-white rounded-2xl border border-gray-100 p-4 mb-3 flex items-center gap-4 hover:border-blue-200 transition-colors cursor-pointer" onClick={()=>openProntuario(p)}>
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-semibold text-sm">{p.nome.charAt(0).toUpperCase()}</div>
          <div className="flex-1">
            <div className="font-medium text-sm text-gray-800">{p.nome}</div>
            <div className="text-xs text-gray-400">{p.diagnostico||"Sem diagnóstico"}{p.escola ? ` · ${p.escola}` : ""}</div>
          </div>
          <div className="flex gap-2" onClick={e=>e.stopPropagation()}>
            <button onClick={()=>openProntuario(p)} className="text-xs border border-gray-200 px-3 py-1 rounded-lg text-gray-600 hover:bg-gray-50">Prontuário</button>
            <button onClick={()=>del(p.id)} className="text-xs border border-red-100 px-3 py-1 rounded-lg text-red-500 hover:bg-red-50">Excluir</button>
          </div>
        </div>
      ))}
    </div>
  );
}
