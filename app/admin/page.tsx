"use client";
import { useEffect, useState, useRef } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

const ADMIN_IDS = ["user_3DvegBUwXFlVIwWgjv34NrQI7bF"];

function LineChart({ data, color, label }: { data: any[], color: string, label: string }) {
  if (!data?.length) return <div style={{color:"rgba(255,255,255,0.3)",fontSize:"13px",padding:"20px",textAlign:"center"}}>Sem dados ainda</div>;
  const max = Math.max(...data.map((d:any) => d.total), 1);
  const W = 600, H = 120, pad = 20;
  const pts = data.map((d:any, i:number) => ({
    x: pad + (i / Math.max(data.length-1,1)) * (W - pad*2),
    y: H - pad - (d.total / max) * (H - pad*2),
    v: d.total, dia: d.dia
  }));
  const path = pts.map((p,i) => `${i===0?"M":"L"}${p.x},${p.y}`).join(" ");
  const area = `${path} L${pts[pts.length-1].x},${H-pad} L${pts[0].x},${H-pad} Z`;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{width:"100%",height:"100px"}}>
      <defs>
        <linearGradient id={`g${color.replace("#","")}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3"/>
          <stop offset="100%" stopColor={color} stopOpacity="0"/>
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#g${color.replace("#","")})`}/>
      <path d={path} fill="none" stroke={color} strokeWidth="2"/>
      {pts.map((p,i) => <circle key={i} cx={p.x} cy={p.y} r="3" fill={color}><title>{p.dia}: {p.v}</title></circle>)}
    </svg>
  );
}

function Funnel({ total, pro, sessions }: { total:number, pro:number, sessions:number }) {
  const steps = [
    { label:"Cadastros", value:total, color:"#4ec9a0", pct:100 },
    { label:"Usaram sessões", value:Math.min(sessions,total), color:"#60a5fa", pct:total>0?Math.round(Math.min(sessions,total)/total*100):0 },
    { label:"Assinantes Pro", value:pro, color:"#f59e0b", pct:total>0?Math.round(pro/total*100):0 },
  ];
  return (
    <div style={{display:"flex",flexDirection:"column",gap:"8px"}}>
      {steps.map((s,i) => (
        <div key={i}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:"4px"}}>
            <span style={{fontSize:"12px",color:"rgba(255,255,255,0.6)"}}>{s.label}</span>
            <span style={{fontSize:"12px",fontWeight:"700",color:s.color}}>{s.value} ({s.pct}%)</span>
          </div>
          <div style={{background:"rgba(255,255,255,0.1)",borderRadius:"4px",height:"8px"}}>
            <div style={{background:s.color,borderRadius:"4px",height:"8px",width:`${s.pct}%`,transition:"width 0.5s"}}/>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function AdminPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [activeTab, setActiveTab] = useState("overview");
  const intervalRef = useRef<any>(null);

  const isAdmin = isLoaded && user && ADMIN_IDS.includes(user.id);

  async function loadData() {
    try {
      const [sRes, uRes] = await Promise.all([
        fetch("/api/admin-stats"),
        fetch("/api/admin/users"),
      ]);
      if (sRes.ok) setStats(await sRes.json());
      if (uRes.ok) setUsers((await uRes.json()).users || []);
      setLastUpdate(new Date());
    } catch {}
    setLoading(false);
  }

  async function exportExcel() {
    const res = await fetch("/api/export?format=xlsx&admin=true");
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `caa-neuro-relatorio-${new Date().toISOString().split("T")[0]}.xlsx`;
    a.click();
  }

  useEffect(() => {
    if (!isLoaded) return;
    if (!isAdmin) { router.push("/app"); return; }
    loadData();
    intervalRef.current = setInterval(loadData, 30000);
    return () => clearInterval(intervalRef.current);
  }, [isLoaded, isAdmin]);

  if (!isLoaded || loading) return (
    <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:"#071b2c"}}>
      <div style={{textAlign:"center"}}>
        <div style={{color:"#4ec9a0",fontSize:"20px",fontWeight:"900",marginBottom:"8px"}}>CAA Neuro</div>
        <div style={{color:"rgba(255,255,255,0.4)",fontSize:"14px"}}>Carregando painel administrativo...</div>
      </div>
    </div>
  );

  if (!isAdmin) return null;

  const t = stats?.totals || {};
  const tabs = ["overview","usuarios","sessoes","receita","exportar"];
  const tabStyle = (id:string) => ({
    padding:"10px 20px", border:"none", cursor:"pointer", fontSize:"13px", fontWeight:"600",
    background: activeTab===id ? "rgba(78,201,160,0.2)" : "transparent",
    color: activeTab===id ? "#4ec9a0" : "rgba(255,255,255,0.4)",
    borderBottom: activeTab===id ? "2px solid #4ec9a0" : "2px solid transparent",
  });

  return (
    <div style={{minHeight:"100vh",background:"#071b2c",fontFamily:"system-ui",color:"white"}}>
      {/* Header */}
      <div style={{borderBottom:"1px solid rgba(255,255,255,0.1)",padding:"16px 24px",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:"12px"}}>
        <div style={{display:"flex",alignItems:"center",gap:"16px"}}>
          <span style={{color:"#4ec9a0",fontWeight:"900",fontSize:"22px"}}>CAA Neuro</span>
          <span style={{background:"rgba(78,201,160,0.15)",border:"1px solid #4ec9a0",color:"#4ec9a0",padding:"3px 12px",borderRadius:"6px",fontSize:"11px",fontWeight:"700",letterSpacing:"0.1em"}}>PROPRIETÁRIO</span>
        </div>
        <div style={{display:"flex",gap:"10px",alignItems:"center",flexWrap:"wrap"}}>
          <div style={{display:"flex",alignItems:"center",gap:"6px"}}>
            <div style={{width:"8px",height:"8px",borderRadius:"50%",background:"#4ec9a0",animation:"pulse 2s infinite"}}/>
            <span style={{fontSize:"12px",color:"rgba(255,255,255,0.4)"}}>Ao vivo · {lastUpdate.toLocaleTimeString("pt-BR")}</span>
          </div>
          <button onClick={loadData} style={{background:"rgba(255,255,255,0.08)",border:"1px solid rgba(255,255,255,0.15)",color:"white",padding:"7px 16px",borderRadius:"8px",cursor:"pointer",fontSize:"13px"}}>↻ Atualizar</button>
          <a href="/app" style={{background:"#00885f",color:"white",padding:"8px 18px",borderRadius:"8px",fontSize:"13px",fontWeight:"700",textDecoration:"none"}}>← Prancha</a>
        </div>
      </div>

      {/* Tabs */}
      <div style={{borderBottom:"1px solid rgba(255,255,255,0.08)",display:"flex",overflowX:"auto"}}>
        {[["overview","📊 Visão geral"],["usuarios","👥 Usuários"],["sessoes","📋 Sessões"],["receita","💰 Receita"],["exportar","📤 Exportar"]].map(([id,label]) => (
          <button key={id} onClick={() => setActiveTab(id)} style={tabStyle(id)}>{label}</button>
        ))}
      </div>

      <div style={{maxWidth:"1200px",margin:"0 auto",padding:"32px 24px"}}>

        {/* OVERVIEW */}
        {activeTab === "overview" && <>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))",gap:"16px",marginBottom:"32px"}}>
            {[
              ["Usuários totais", t.users, "#4ec9a0", "👥"],
              ["Novos esta semana", t.new_users_week, "#60a5fa", "📈"],
              ["Plano Pro", t.pro, "#f59e0b", "⭐"],
              ["Plano Gratuito", t.free, "rgba(255,255,255,0.5)", "🆓"],
              ["Pacientes criados", t.patients, "#a78bfa", "🧑‍⚕️"],
              ["Sessões registradas", t.sessions, "#34d399", "📋"],
              ["MRR", `R$${t.mrr||0}`, "#f59e0b", "💰"],
              ["Taxa conversão", `${t.conversion_rate||0}%`, "#fb7185", "🎯"],
            ].map(([label,value,color,icon]) => (
              <div key={label as string} style={{background:"rgba(255,255,255,0.04)",borderRadius:"14px",border:"1px solid rgba(255,255,255,0.08)",padding:"18px"}}>
                <div style={{fontSize:"20px",marginBottom:"8px"}}>{icon}</div>
                <div style={{fontSize:"11px",color:"rgba(255,255,255,0.4)",fontWeight:"600",marginBottom:"6px",textTransform:"uppercase",letterSpacing:"0.05em"}}>{label}</div>
                <div style={{fontSize:"28px",fontWeight:"900",color: color as string}}>{value ?? "—"}</div>
              </div>
            ))}
          </div>

          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"20px",marginBottom:"24px"}}>
            <div style={{background:"rgba(255,255,255,0.04)",borderRadius:"16px",border:"1px solid rgba(255,255,255,0.08)",padding:"24px"}}>
              <h3 style={{fontSize:"14px",fontWeight:"700",color:"rgba(255,255,255,0.6)",margin:"0 0 16px",textTransform:"uppercase",letterSpacing:"0.05em"}}>📈 Crescimento de usuários (30 dias)</h3>
              <LineChart data={stats?.usersPerDay || []} color="#4ec9a0" label="Usuários" />
            </div>
            <div style={{background:"rgba(255,255,255,0.04)",borderRadius:"16px",border:"1px solid rgba(255,255,255,0.08)",padding:"24px"}}>
              <h3 style={{fontSize:"14px",fontWeight:"700",color:"rgba(255,255,255,0.6)",margin:"0 0 16px",textTransform:"uppercase",letterSpacing:"0.05em"}}>📋 Sessões por dia (30 dias)</h3>
              <LineChart data={stats?.sessionsPerDay || []} color="#60a5fa" label="Sessões" />
            </div>
          </div>

          <div style={{background:"rgba(255,255,255,0.04)",borderRadius:"16px",border:"1px solid rgba(255,255,255,0.08)",padding:"24px"}}>
            <h3 style={{fontSize:"14px",fontWeight:"700",color:"rgba(255,255,255,0.6)",margin:"0 0 20px",textTransform:"uppercase",letterSpacing:"0.05em"}}>🔽 Funil de conversão</h3>
            <Funnel total={t.users||0} pro={t.pro||0} sessions={t.sessions||0} />
          </div>
        </>}

        {/* USUÁRIOS */}
        {activeTab === "usuarios" && <>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"20px",flexWrap:"wrap",gap:"12px"}}>
            <h2 style={{fontSize:"20px",fontWeight:"800",margin:0}}>👥 Todos os usuários ({users.length})</h2>
            <div style={{display:"flex",gap:"12px",fontSize:"13px"}}>
              <span style={{color:"#4ec9a0"}}>✅ Pro: {users.filter((u:any)=>u.plano==="pro").length}</span>
              <span style={{color:"rgba(255,255,255,0.4)"}}>🆓 Free: {users.filter((u:any)=>u.plano!=="pro"&&u.plano!=="admin").length}</span>
            </div>
          </div>
          <div style={{background:"rgba(255,255,255,0.04)",borderRadius:"16px",border:"1px solid rgba(255,255,255,0.08)",overflow:"hidden"}}>
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:"13px"}}>
              <thead>
                <tr style={{background:"rgba(255,255,255,0.05)"}}>
                  {["#","Email","Plano","Pacientes","Sessões","Cadastro"].map(h => (
                    <th key={h} style={{textAlign:"left",padding:"12px 16px",color:"rgba(255,255,255,0.4)",fontWeight:"600",fontSize:"11px",textTransform:"uppercase"}}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(stats?.topUsers?.length ? stats.topUsers : users).map((u:any, i:number) => (
                  <tr key={u.id||i} style={{borderTop:"1px solid rgba(255,255,255,0.05)"}}>
                    <td style={{padding:"12px 16px",color:"rgba(255,255,255,0.3)",fontSize:"12px"}}>{i+1}</td>
                    <td style={{padding:"12px 16px",color:"white",fontWeight:"500"}}>{u.email||"—"}</td>
                    <td style={{padding:"12px 16px"}}>
                      <span style={{background:u.plano==="pro"?"rgba(245,158,11,0.2)":u.plano==="admin"?"rgba(78,201,160,0.2)":"rgba(255,255,255,0.08)",
                        color:u.plano==="pro"?"#f59e0b":u.plano==="admin"?"#4ec9a0":"rgba(255,255,255,0.4)",
                        padding:"2px 10px",borderRadius:"6px",fontSize:"11px",fontWeight:"700"}}>
                        {(u.plano||"free").toUpperCase()}
                      </span>
                    </td>
                    <td style={{padding:"12px 16px",color:"rgba(255,255,255,0.6)"}}>{u.total_pacientes??"—"}</td>
                    <td style={{padding:"12px 16px",color:"rgba(255,255,255,0.6)"}}>{u.total_sessoes??"—"}</td>
                    <td style={{padding:"12px 16px",color:"rgba(255,255,255,0.3)",fontSize:"12px"}}>
                      {u.created_at ? new Date(u.created_at).toLocaleDateString("pt-BR") : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>}

        {/* SESSÕES */}
        {activeTab === "sessoes" && <>
          <h2 style={{fontSize:"20px",fontWeight:"800",margin:"0 0 20px"}}>📋 Sessões recentes</h2>
          <div style={{background:"rgba(255,255,255,0.04)",borderRadius:"16px",border:"1px solid rgba(255,255,255,0.08)",overflow:"hidden"}}>
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:"13px"}}>
              <thead>
                <tr style={{background:"rgba(255,255,255,0.05)"}}>
                  {["Profissional","Paciente","Data","Duração","Evolução"].map(h => (
                    <th key={h} style={{textAlign:"left",padding:"12px 16px",color:"rgba(255,255,255,0.4)",fontWeight:"600",fontSize:"11px",textTransform:"uppercase"}}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(stats?.recentSessions || []).map((s:any, i:number) => (
                  <tr key={i} style={{borderTop:"1px solid rgba(255,255,255,0.05)"}}>
                    <td style={{padding:"12px 16px",color:"rgba(255,255,255,0.6)",fontSize:"12px"}}>{s.profissional_email||"—"}</td>
                    <td style={{padding:"12px 16px",color:"white",fontWeight:"500"}}>{s.paciente_nome||"—"}</td>
                    <td style={{padding:"12px 16px",color:"rgba(255,255,255,0.4)",fontSize:"12px"}}>{s.created_at ? new Date(s.created_at).toLocaleDateString("pt-BR") : "—"}</td>
                    <td style={{padding:"12px 16px",color:"#4ec9a0"}}>{s.duracao_minutos ? `${s.duracao_minutos}min` : "—"}</td>
                    <td style={{padding:"12px 16px",color:"rgba(255,255,255,0.5)",maxWidth:"200px",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{s.evolucao_observada||"—"}</td>
                  </tr>
                ))}
                {!stats?.recentSessions?.length && (
                  <tr><td colSpan={5} style={{padding:"40px",textAlign:"center",color:"rgba(255,255,255,0.3)"}}>Nenhuma sessão registrada ainda</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </>}

        {/* RECEITA */}
        {activeTab === "receita" && <>
          <h2 style={{fontSize:"20px",fontWeight:"800",margin:"0 0 24px"}}>💰 Dashboard financeiro</h2>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:"20px",marginBottom:"32px"}}>
            {[
              ["MRR", `R$ ${t.mrr||0}`, "Receita mensal recorrente", "#f59e0b"],
              ["ARR", `R$ ${t.arr||0}`, "Receita anual projetada", "#4ec9a0"],
              ["Assinantes Pro", t.pro||0, "Usuários pagantes ativos", "#60a5fa"],
              ["Ticket médio", "R$ 35", "Por assinante por mês", "#a78bfa"],
              ["Taxa conversão", `${t.conversion_rate||0}%`, "Free → Pro", "#fb7185"],
              ["Usuários free", t.free||0, "Potencial de conversão", "rgba(255,255,255,0.4)"],
            ].map(([label,value,sub,color]) => (
              <div key={label as string} style={{background:"rgba(255,255,255,0.04)",borderRadius:"16px",border:"1px solid rgba(255,255,255,0.08)",padding:"24px"}}>
                <div style={{fontSize:"12px",color:"rgba(255,255,255,0.4)",fontWeight:"600",marginBottom:"8px",textTransform:"uppercase",letterSpacing:"0.05em"}}>{label}</div>
                <div style={{fontSize:"32px",fontWeight:"900",color: color as string,marginBottom:"4px"}}>{value}</div>
                <div style={{fontSize:"12px",color:"rgba(255,255,255,0.3)"}}>{sub}</div>
              </div>
            ))}
          </div>
          <div style={{background:"rgba(245,158,11,0.08)",borderRadius:"16px",border:"1px solid rgba(245,158,11,0.2)",padding:"24px"}}>
            <h3 style={{fontSize:"14px",fontWeight:"700",color:"#f59e0b",margin:"0 0 16px"}}>📈 Projeção de crescimento</h3>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))",gap:"16px"}}>
              {[10,50,100,500].map(n => (
                <div key={n} style={{textAlign:"center",padding:"16px",background:"rgba(255,255,255,0.04)",borderRadius:"12px"}}>
                  <div style={{fontSize:"12px",color:"rgba(255,255,255,0.4)",marginBottom:"8px"}}>{n} assinantes Pro</div>
                  <div style={{fontSize:"22px",fontWeight:"900",color:"#f59e0b"}}>R$ {(n*35).toLocaleString("pt-BR")}</div>
                  <div style={{fontSize:"11px",color:"rgba(255,255,255,0.3)",marginTop:"4px"}}>por mês</div>
                </div>
              ))}
            </div>
          </div>
        </>}

        {/* EXPORTAR */}
        {activeTab === "exportar" && <>
          <h2 style={{fontSize:"20px",fontWeight:"800",margin:"0 0 8px"}}>📤 Exportar dados</h2>
          <p style={{color:"rgba(255,255,255,0.4)",margin:"0 0 32px",fontSize:"14px"}}>Exporte dados reais para apresentar a prefeituras, secretarias e investidores.</p>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:"20px"}}>
            {[
              {icon:"👥",title:"Relatório de usuários",desc:"Total de cadastros, planos, datas de adesão e atividade",format:"XLSX"},
              {icon:"📋",title:"Relatório de sessões",desc:"Todas as sessões clínicas registradas na plataforma",format:"XLSX"},
              {icon:"💰",title:"Relatório financeiro",desc:"MRR, ARR, assinantes Pro e projeções de crescimento",format:"XLSX"},
              {icon:"📊",title:"Relatório executivo",desc:"Visão geral completa para apresentação institucional",format:"PDF"},
            ].map(r => (
              <div key={r.title} style={{background:"rgba(255,255,255,0.04)",borderRadius:"16px",border:"1px solid rgba(255,255,255,0.08)",padding:"24px",display:"flex",flexDirection:"column",gap:"12px"}}>
                <div style={{fontSize:"32px"}}>{r.icon}</div>
                <div>
                  <div style={{fontSize:"16px",fontWeight:"700",marginBottom:"4px"}}>{r.title}</div>
                  <div style={{fontSize:"13px",color:"rgba(255,255,255,0.4)",lineHeight:"1.5"}}>{r.desc}</div>
                </div>
                <button onClick={exportExcel}
                  style={{marginTop:"auto",padding:"10px",background:"#00885f",color:"white",border:"none",borderRadius:"10px",cursor:"pointer",fontWeight:"700",fontSize:"13px"}}>
                  Exportar {r.format}
                </button>
              </div>
            ))}
          </div>
          <div style={{marginTop:"24px",background:"rgba(78,201,160,0.08)",borderRadius:"16px",border:"1px solid rgba(78,201,160,0.2)",padding:"20px"}}>
            <div style={{fontSize:"14px",fontWeight:"700",color:"#4ec9a0",marginBottom:"8px"}}>💡 Para apresentações institucionais</div>
            <div style={{fontSize:"13px",color:"rgba(255,255,255,0.5)",lineHeight:"1.6"}}>
              Os dados exportados mostram métricas reais da plataforma. Use para demonstrar impacto clínico, alcance e viabilidade financeira para prefeituras, secretarias de saúde e educação, e investidores.
            </div>
          </div>
        </>}

      </div>

      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>
    </div>
  );
}
