"use client";
import { useEffect, useState, useRef } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

const ADMIN_IDS = ["user_3DvegBUwXFlVIwWgjv34NrQI7bF"];

export default function AdminPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const intervalRef = useRef<any>(null);

  const isAdmin = isLoaded && user && ADMIN_IDS.includes(user.id);

  async function loadData() {
    try {
      const [statsRes, usersRes] = await Promise.all([
        fetch("/api/admin-stats"),
        fetch("/api/admin/users"),
      ]);
      if (statsRes.ok) setStats(await statsRes.json());
      if (usersRes.ok) setUsers((await usersRes.json()).users || []);
      setLastUpdate(new Date());
    } catch {}
    setLoading(false);
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
      <div style={{color:"#4ec9a0",fontSize:"16px",fontWeight:"700"}}>Carregando painel admin...</div>
    </div>
  );

  if (!isAdmin) return null;

  const t = stats?.totals || {};
  const perDay = stats?.sessionsPerDay || [];
  const maxDay = Math.max(...perDay.map((d:any) => d.total), 1);

  const card = (label: string, value: any, color: string, icon: string, sub?: string) => (
    <div style={{background:"rgba(255,255,255,0.05)",borderRadius:"16px",border:"1px solid rgba(255,255,255,0.1)",padding:"20px"}}>
      <div style={{display:"flex",alignItems:"center",gap:"10px",marginBottom:"12px"}}>
        <span style={{fontSize:"24px"}}>{icon}</span>
        <span style={{fontSize:"12px",fontWeight:"700",color:"rgba(255,255,255,0.5)",textTransform:"uppercase",letterSpacing:"0.05em"}}>{label}</span>
      </div>
      <div style={{fontSize:"36px",fontWeight:"900",color}}>{value ?? "—"}</div>
      {sub && <div style={{fontSize:"12px",color:"rgba(255,255,255,0.4)",marginTop:"4px"}}>{sub}</div>}
    </div>
  );

  return (
    <div style={{minHeight:"100vh",background:"#071b2c",fontFamily:"system-ui",color:"white"}}>
      {/* Header */}
      <div style={{borderBottom:"1px solid rgba(255,255,255,0.1)",padding:"16px 24px",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:"12px"}}>
        <div style={{display:"flex",alignItems:"center",gap:"16px"}}>
          <span style={{color:"#4ec9a0",fontWeight:"900",fontSize:"20px"}}>CAA Neuro</span>
          <span style={{background:"rgba(78,201,160,0.2)",border:"1px solid #4ec9a0",color:"#4ec9a0",padding:"3px 10px",borderRadius:"6px",fontSize:"11px",fontWeight:"700"}}>ADMIN</span>
        </div>
        <div style={{display:"flex",gap:"10px",alignItems:"center",flexWrap:"wrap"}}>
          <span style={{fontSize:"12px",color:"rgba(255,255,255,0.4)"}}>Atualizado: {lastUpdate.toLocaleTimeString("pt-BR")}</span>
          <button onClick={loadData} style={{background:"rgba(255,255,255,0.1)",border:"1px solid rgba(255,255,255,0.2)",color:"white",padding:"6px 14px",borderRadius:"8px",cursor:"pointer",fontSize:"13px"}}>↻ Atualizar</button>
          <a href="/app" style={{background:"#00885f",color:"white",padding:"8px 16px",borderRadius:"8px",fontSize:"13px",fontWeight:"700",textDecoration:"none"}}>← Ir para a prancha</a>
        </div>
      </div>

      <div style={{maxWidth:"1200px",margin:"0 auto",padding:"32px 24px"}}>
        <div style={{marginBottom:"32px"}}>
          <h1 style={{fontSize:"28px",fontWeight:"900",margin:"0 0 4px"}}>Painel do proprietário</h1>
          <p style={{color:"rgba(255,255,255,0.4)",margin:0,fontSize:"14px"}}>Métricas em tempo real · Atualiza a cada 30 segundos</p>
        </div>

        {/* Métricas principais */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:"16px",marginBottom:"32px"}}>
          {card("Usuários cadastrados", t.patients !== undefined ? users.length : "—", "#4ec9a0", "👥", "total na plataforma")}
          {card("Plano Pro", users.filter((u:any) => u.plano === "pro").length, "#f59e0b", "⭐", "assinantes ativos")}
          {card("Pacientes criados", t.patients, "#60a5fa", "🧑‍⚕️", "em todos os perfis")}
          {card("Sessões registradas", t.sessions, "#a78bfa", "📋", "histórico clínico")}
          {card("Cards criados", t.cards, "#34d399", "🃏", "personalizações")}
          {card("Duração média", t.avg_duration ? `${t.avg_duration}min` : "—", "#fb7185", "⏱️", "por sessão")}
        </div>

        {/* Gráfico de sessões */}
        {perDay.length > 0 && (
          <div style={{background:"rgba(255,255,255,0.05)",borderRadius:"16px",border:"1px solid rgba(255,255,255,0.1)",padding:"24px",marginBottom:"24px"}}>
            <h2 style={{fontSize:"16px",fontWeight:"700",margin:"0 0 20px",color:"rgba(255,255,255,0.8)"}}>📈 Sessões nos últimos 30 dias</h2>
            <div style={{display:"flex",alignItems:"flex-end",gap:"4px",height:"80px"}}>
              {perDay.map((d:any) => (
                <div key={d.dia} title={`${d.dia}: ${d.total} sessões`}
                  style={{flex:1,background:"#4ec9a0",borderRadius:"3px 3px 0 0",height:`${Math.max((d.total/maxDay)*80,4)}px`,opacity:0.8,cursor:"default",transition:"opacity 0.2s"}}
                  onMouseEnter={e=>(e.currentTarget.style.opacity="1")}
                  onMouseLeave={e=>(e.currentTarget.style.opacity="0.8")}
                />
              ))}
            </div>
            <div style={{display:"flex",justifyContent:"space-between",marginTop:"8px",fontSize:"11px",color:"rgba(255,255,255,0.3)"}}>
              <span>{perDay[0]?.dia}</span>
              <span>{perDay[perDay.length-1]?.dia}</span>
            </div>
          </div>
        )}

        {/* Lista de usuários */}
        <div style={{background:"rgba(255,255,255,0.05)",borderRadius:"16px",border:"1px solid rgba(255,255,255,0.1)",padding:"24px",marginBottom:"24px"}}>
          <h2 style={{fontSize:"16px",fontWeight:"700",margin:"0 0 20px",color:"rgba(255,255,255,0.8)"}}>👥 Usuários cadastrados ({users.length})</h2>
          <div style={{overflowX:"auto"}}>
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:"13px"}}>
              <thead>
                <tr style={{borderBottom:"1px solid rgba(255,255,255,0.1)"}}>
                  {["Email","Plano","Cadastro"].map(h => (
                    <th key={h} style={{textAlign:"left",padding:"8px 12px",color:"rgba(255,255,255,0.4)",fontWeight:"600",fontSize:"11px",textTransform:"uppercase"}}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map((u:any, i:number) => (
                  <tr key={u.id} style={{borderBottom:"1px solid rgba(255,255,255,0.05)",background:i%2===0?"transparent":"rgba(255,255,255,0.02)"}}>
                    <td style={{padding:"10px 12px",color:"white"}}>{u.email || "—"}</td>
                    <td style={{padding:"10px 12px"}}>
                      <span style={{background: u.plano==="pro"?"rgba(245,158,11,0.2)":u.plano==="admin"?"rgba(78,201,160,0.2)":"rgba(255,255,255,0.1)",
                        color: u.plano==="pro"?"#f59e0b":u.plano==="admin"?"#4ec9a0":"rgba(255,255,255,0.5)",
                        padding:"2px 10px",borderRadius:"6px",fontSize:"11px",fontWeight:"700"}}>
                        {u.plano?.toUpperCase() || "GRATUITO"}
                      </span>
                    </td>
                    <td style={{padding:"10px 12px",color:"rgba(255,255,255,0.4)",fontSize:"12px"}}>
                      {u.created_at ? new Date(u.created_at).toLocaleDateString("pt-BR") : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Receita estimada */}
        <div style={{background:"rgba(245,158,11,0.1)",borderRadius:"16px",border:"1px solid rgba(245,158,11,0.3)",padding:"24px"}}>
          <h2 style={{fontSize:"16px",fontWeight:"700",margin:"0 0 16px",color:"#f59e0b"}}>💰 Receita estimada</h2>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))",gap:"16px"}}>
            {[
              ["MRR", `R$ ${users.filter((u:any)=>u.plano==="pro").length * 35}`, "Receita mensal recorrente"],
              ["ARR", `R$ ${users.filter((u:any)=>u.plano==="pro").length * 35 * 12}`, "Receita anual projetada"],
              ["Assinantes Pro", users.filter((u:any)=>u.plano==="pro").length, "Usuários pagantes"],
              ["Ticket médio", "R$ 35", "Por assinante/mês"],
            ].map(([label, value, sub]) => (
              <div key={label as string}>
                <div style={{fontSize:"11px",color:"rgba(245,158,11,0.7)",fontWeight:"700",marginBottom:"4px"}}>{label}</div>
                <div style={{fontSize:"24px",fontWeight:"900",color:"#f59e0b"}}>{value}</div>
                <div style={{fontSize:"11px",color:"rgba(255,255,255,0.3)",marginTop:"2px"}}>{sub}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
