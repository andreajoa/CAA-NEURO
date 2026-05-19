"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import PublicShell from "../../components/PublicShell";

const ESPECIALIDADES = [
  { id: "all", label: "Todas" },
  { id: "fonoaudiologo", label: "Fonoaudiólogo(a)" },
  { id: "psicologo", label: "Psicólogo(a)" },
  { id: "terapeuta_ocupacional", label: "Terapeuta Ocupacional" },
  { id: "neuropsicopedagogo", label: "Neuropsicopedagogo(a)" },
  { id: "educador_especial", label: "Educador(a) Especial" },
  { id: "medico", label: "Médico(a)" },
];

const ESTADOS = ["Todos","AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"];

export default function Profissionais() {
  const [profissionais, setProfissionais] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroEsp, setFiltroEsp] = useState("all");
  const [filtroEstado, setFiltroEstado] = useState("Todos");
  const [busca, setBusca] = useState("");

  useEffect(() => {
    fetch("/api/profissionais")
      .then(r => r.json())
      .then(d => { setProfissionais(d.profissionais || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filtered = profissionais.filter(p => {
    if (filtroEsp !== "all" && p.profissao !== filtroEsp) return false;
    if (filtroEstado !== "Todos" && p.estado !== filtroEstado) return false;
    if (busca && !p.nome_profissional?.toLowerCase().includes(busca.toLowerCase()) &&
        !p.cidade?.toLowerCase().includes(busca.toLowerCase())) return false;
    return true;
  });

  return (
    <PublicShell>
    <div style={{minHeight:"100vh",background:"#f9fafb",fontFamily:"system-ui,sans-serif"}}>

      {/* Hero */}
      {/* Hero */}
      <div style={{background:"linear-gradient(135deg,#071b2c,#0d2d3e)",color:"white",padding:"48px 24px",textAlign:"center"}}>
        <h1 style={{fontSize:"32px",fontWeight:"800",margin:"0 0 12px",color:"#4ec9a0"}}>Encontre um Especialista em CAA</h1>
        <p style={{fontSize:"16px",color:"rgba(255,255,255,0.7)",margin:"0 0 32px"}}>Fonoaudiólogos, Terapeutas Ocupacionais, Psicólogos e outros profissionais especializados</p>
        <div style={{maxWidth:"500px",margin:"0 auto"}}>
          <input
            value={busca}
            onChange={e => setBusca(e.target.value)}
            placeholder="Buscar por nome ou cidade..."
            style={{width:"100%",padding:"14px 20px",borderRadius:"12px",border:"none",fontSize:"16px",outline:"none",boxShadow:"0 4px 20px rgba(0,0,0,0.3)"}}
          />
        </div>
      </div>

      <div style={{maxWidth:"1200px",margin:"0 auto",padding:"24px"}}>
        {/* Filtros */}
        <div style={{display:"flex",gap:"10px",flexWrap:"wrap",marginBottom:"24px",alignItems:"center"}}>
          <div style={{display:"flex",gap:"6px",flexWrap:"wrap"}}>
            {ESPECIALIDADES.map(e => (
              <button key={e.id} onClick={() => setFiltroEsp(e.id)}
                style={{padding:"8px 14px",borderRadius:"20px",border:"1px solid",fontSize:"13px",fontWeight:"700",cursor:"pointer",
                  background:filtroEsp===e.id?"#071b2c":"white",color:filtroEsp===e.id?"white":"#374151",borderColor:filtroEsp===e.id?"#071b2c":"#e5e7eb"}}>
                {e.label}
              </button>
            ))}
          </div>
          <select value={filtroEstado} onChange={e=>setFiltroEstado(e.target.value)}
            style={{padding:"8px 12px",borderRadius:"20px",border:"1px solid #e5e7eb",fontSize:"13px",background:"white",cursor:"pointer"}}>
            {ESTADOS.map(e => <option key={e}>{e}</option>)}
          </select>
        </div>

        {/* Resultados */}
        {loading ? (
          <div style={{textAlign:"center",padding:"60px",color:"#6b7280"}}>Carregando profissionais...</div>
        ) : filtered.length === 0 ? (
          <div style={{textAlign:"center",padding:"60px"}}>
            <div style={{fontSize:"48px",marginBottom:"16px"}}>🔍</div>
            <h3 style={{color:"#374151",margin:"0 0 8px"}}>Nenhum profissional encontrado</h3>
            <p style={{color:"#6b7280",margin:"0 0 24px"}}>Tente outros filtros ou seja o primeiro da sua região!</p>
            <Link href="/perfil" style={{background:"#00885f",color:"white",padding:"12px 24px",borderRadius:"10px",textDecoration:"none",fontWeight:"700"}}>
              Cadastrar meu perfil
            </Link>
          </div>
        ) : (
          <>
            <p style={{color:"#6b7280",fontSize:"14px",marginBottom:"16px"}}>{filtered.length} profissional{filtered.length!==1?"is":""} encontrado{filtered.length!==1?"s":""}</p>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(320px,1fr))",gap:"16px"}}>
              {filtered.map(p => <CardProfissional key={p.id} p={p} />)}
            </div>
          </>
        )}

        {/* CTA para cadastro */}
        <div style={{background:"linear-gradient(135deg,#071b2c,#0d2d3e)",borderRadius:"20px",padding:"40px",textAlign:"center",marginTop:"48px",color:"white"}}>
          <h2 style={{fontSize:"24px",fontWeight:"800",margin:"0 0 12px",color:"#4ec9a0"}}>Você é profissional de CAA?</h2>
          <p style={{color:"rgba(255,255,255,0.7)",margin:"0 0 24px"}}>Apareça no diretório, amplie sua visibilidade e conecte-se com famílias e colegas.</p>
          <Link href="/perfil" style={{background:"#00885f",color:"white",padding:"14px 32px",borderRadius:"12px",textDecoration:"none",fontWeight:"800",fontSize:"16px",display:"inline-block"}}>
            Cadastrar meu perfil gratuitamente
          </Link>
        </div>
      </div>
    </div>
    </PublicShell>
  );
}

function CardProfissional({ p }) {
  const PROF_LABELS = {
    fonoaudiologo: "Fonoaudiólogo(a)",
    psicologo: "Psicólogo(a)",
    terapeuta_ocupacional: "Terapeuta Ocupacional",
    neuropsicopedagogo: "Neuropsicopedagogo(a)",
    educador_especial: "Educador(a) Especial",
    medico: "Médico(a)",
  };
  const PROF_COLORS = {
    fonoaudiologo: "#2563eb",
    psicologo: "#7c3aed",
    terapeuta_ocupacional: "#059669",
    neuropsicopedagogo: "#d97706",
    educador_especial: "#dc2626",
    medico: "#0891b2",
  };
  const cor = PROF_COLORS[p.profissao] || "#6b7280";

  return (
    <div style={{background:"white",borderRadius:"16px",padding:"24px",border:"1px solid #e5e7eb",boxShadow:"0 2px 8px rgba(0,0,0,0.06)",display:"flex",flexDirection:"column",gap:"12px"}}>
      <div style={{display:"flex",gap:"16px",alignItems:"flex-start"}}>
        {p.foto_url ? (
          <img src={p.foto_url} alt={p.nome_profissional} style={{width:"64px",height:"64px",borderRadius:"50%",objectFit:"cover",flexShrink:0,border:`3px solid ${cor}`}} />
        ) : (
          <div style={{width:"64px",height:"64px",borderRadius:"50%",background:`${cor}15`,border:`3px solid ${cor}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"24px",flexShrink:0}}>
            👤
          </div>
        )}
        <div style={{flex:1,minWidth:0}}>
          <div style={{fontWeight:"800",fontSize:"16px",color:"#071b2c",marginBottom:"4px"}}>{p.nome_profissional || "Profissional CAA"}</div>
          <div style={{fontSize:"13px",fontWeight:"700",color:cor,marginBottom:"4px"}}>{PROF_LABELS[p.profissao] || p.profissao}</div>
          {p.conselho_regional && (
            <div style={{fontSize:"12px",color:"#6b7280"}}>{p.conselho_regional}</div>
          )}
        </div>
      </div>

      {(p.cidade || p.estado) && (
        <div style={{display:"flex",alignItems:"center",gap:"6px",color:"#6b7280",fontSize:"13px"}}>
          <span>📍</span>
          <span>{[p.cidade, p.estado].filter(Boolean).join(", ")}</span>
        </div>
      )}

      {p.bio && (
        <p style={{fontSize:"13px",color:"#374151",lineHeight:"1.6",margin:0,display:"-webkit-box",WebkitLineClamp:3,WebkitBoxOrient:"vertical",overflow:"hidden"}}>
          {p.bio}
        </p>
      )}

      {p.atende_online && (
        <div style={{display:"inline-flex",alignItems:"center",gap:"6px",background:"#f0fdf4",border:"1px solid #bbf7d0",borderRadius:"20px",padding:"4px 12px",fontSize:"12px",fontWeight:"700",color:"#15803d",width:"fit-content"}}>
          🌐 Atende online
        </div>
      )}

      {p.telefone && (
        <a href={`https://wa.me/55${p.telefone.replace(/\D/g,"")}`} target="_blank" rel="noopener noreferrer"
          style={{background:"#25d366",color:"white",border:"none",borderRadius:"10px",padding:"10px",textAlign:"center",fontWeight:"700",fontSize:"14px",textDecoration:"none",display:"block"}}>
          💬 WhatsApp
        </a>
      )}
    </div>
  );
}
