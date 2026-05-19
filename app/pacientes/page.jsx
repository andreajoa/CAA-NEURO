"use client";
import { useState, useEffect } from "react";
import AppShell from "../components/AppShell";
import Link from "next/link";

export default function PacientesPage() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/patients").then(r=>r.json())
      .then(d => setPatients(d.patients || d || []))
      .finally(() => setLoading(false));
  }, []);

  const shown = patients.filter(p =>
    (p.nome||p.name||"").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AppShell>
      <div style={{ padding:"28px 32px", maxWidth:"900px" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"28px", flexWrap:"wrap", gap:"12px" }}>
          <div>
            <h1 style={{ margin:0, fontSize:"26px", fontWeight:"800", color:"#071b2c" }}>👥 Pacientes</h1>
            <p style={{ margin:"4px 0 0", color:"#6b7280", fontSize:"14px" }}>{patients.length} paciente{patients.length!==1?"s":""} cadastrado{patients.length!==1?"s":""}</p>
          </div>
          <Link href="/app" style={{ background:"#00885f", color:"white", padding:"10px 20px", borderRadius:"10px", fontWeight:"700", textDecoration:"none", fontSize:"14px" }}>
            + Nova sessão
          </Link>
        </div>

        <input value={search} onChange={e=>setSearch(e.target.value)}
          placeholder="🔍 Buscar paciente..."
          style={{ width:"100%", border:"1px solid #e5e7eb", borderRadius:"10px", padding:"12px 16px", fontSize:"14px", marginBottom:"20px", boxSizing:"border-box", outline:"none" }} />

        {loading ? (
          <div style={{ textAlign:"center", padding:"60px", color:"#9ca3af" }}>Carregando...</div>
        ) : shown.length === 0 ? (
          <div style={{ textAlign:"center", padding:"60px", background:"white", borderRadius:"16px", border:"1px solid #e5e7eb" }}>
            <div style={{ fontSize:"48px", marginBottom:"12px" }}>👥</div>
            <p style={{ fontWeight:"700", color:"#374151", margin:"0 0 8px" }}>{search ? "Nenhum resultado" : "Nenhum paciente ainda"}</p>
            <p style={{ color:"#9ca3af", fontSize:"14px", margin:"0 0 20px" }}>Crie uma sessão no app para registrar o primeiro paciente.</p>
            <Link href="/app" style={{ background:"#00885f", color:"white", padding:"10px 22px", borderRadius:"10px", fontWeight:"700", textDecoration:"none", fontSize:"14px" }}>Ir para a Prancha</Link>
          </div>
        ) : (
          <div style={{ display:"flex", flexDirection:"column", gap:"10px" }}>
            {shown.map(p => (
              <div key={p.id} style={{ background:"white", border:"1px solid #e5e7eb", borderRadius:"14px", padding:"18px 20px", display:"flex", alignItems:"center", justifyContent:"space-between", gap:"12px", flexWrap:"wrap" }}>
                <div style={{ display:"flex", alignItems:"center", gap:"14px" }}>
                  <div style={{ width:"44px", height:"44px", borderRadius:"50%", background:"#f0fdf4", border:"2px solid #bbf7d0", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"20px", flexShrink:0 }}>
                    {p.diagnóstico === "TEA" ? "🧩" : p.diagnóstico === "AVC" ? "🧠" : "👤"}
                  </div>
                  <div>
                    <div style={{ fontWeight:"800", color:"#071b2c", fontSize:"15px" }}>{p.nome || p.name || "Sem nome"}</div>
                    <div style={{ fontSize:"12px", color:"#9ca3af", marginTop:"2px" }}>
                      {p.diagnostico && <span style={{ background:"#eff6ff", color:"#2563eb", padding:"2px 8px", borderRadius:"20px", fontWeight:"600", marginRight:"6px" }}>{p.diagnostico}</span>}
                      {p.data_nascimento && <span>Nasc. {new Date(p.data_nascimento).toLocaleDateString("pt-BR")}</span>}
                    </div>
                  </div>
                </div>
                <Link href={`/app?patient=${p.id}`}
                  style={{ background:"#f0fdf4", color:"#00885f", border:"1px solid #bbf7d0", padding:"8px 16px", borderRadius:"8px", fontWeight:"700", textDecoration:"none", fontSize:"13px" }}>
                  Abrir sessão →
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
