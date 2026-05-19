"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";

function AceitarConviteContent() {
  const params = useSearchParams();
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const token = params.get("token");
  const [status, setStatus] = useState("loading");
  const [mensagem, setMensagem] = useState("");

  useEffect(() => {
    if (!isLoaded) return;
    if (!user) { router.push(`/sign-in?redirect=/aceitar-convite?token=${token}`); return; }
    if (!token) { setStatus("erro"); setMensagem("Token inválido."); return; }

    fetch("/api/org/aceitar", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ token }) })
      .then(r => r.json())
      .then(d => {
        if (d.success) { setStatus("sucesso"); setMensagem(d.org_nome || "organização"); }
        else { setStatus("erro"); setMensagem(d.error || "Erro ao aceitar convite."); }
      })
      .catch(() => { setStatus("erro"); setMensagem("Erro de conexão."); });
  }, [isLoaded, user, token]);

  return (
    <div style={{minHeight:"100vh",background:"#f0fdf4",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"system-ui",padding:"24px"}}>
      <div style={{background:"white",borderRadius:"24px",padding:"48px",maxWidth:"440px",width:"100%",textAlign:"center",boxShadow:"0 8px 40px rgba(0,136,95,0.15)"}}>
        {status==="loading" && <><div style={{fontSize:"48px",marginBottom:"16px"}}>⏳</div><h1 style={{fontSize:"20px",fontWeight:"700",color:"#071b2c"}}>Verificando convite...</h1></>}
        {status==="sucesso" && (<>
          <div style={{fontSize:"64px",marginBottom:"16px"}}>🎉</div>
          <h1 style={{fontSize:"22px",fontWeight:"900",color:"#071b2c",marginBottom:"8px"}}>Convite aceito!</h1>
          <p style={{color:"#6b7280",marginBottom:"24px"}}>Você agora faz parte de <strong>{mensagem}</strong> no CAA Neuro.</p>
          <button onClick={()=>router.push("/app")} style={{background:"#00885f",color:"white",border:"none",padding:"14px 28px",borderRadius:"12px",fontWeight:"700",cursor:"pointer",width:"100%",fontSize:"15px"}}>
            Ir para a prancha →
          </button>
        </>)}
        {status==="erro" && (<>
          <div style={{fontSize:"48px",marginBottom:"16px"}}>❌</div>
          <h1 style={{fontSize:"20px",fontWeight:"700",color:"#071b2c",marginBottom:"8px"}}>Convite inválido</h1>
          <p style={{color:"#6b7280",marginBottom:"24px"}}>{mensagem}</p>
          <button onClick={()=>router.push("/app")} style={{background:"#f3f4f6",color:"#374151",border:"none",padding:"12px 24px",borderRadius:"12px",fontWeight:"600",cursor:"pointer"}}>
            Ir para o app
          </button>
        </>)}
      </div>
    </div>
  );
}

export default function AceitarConvite() {
  return <Suspense fallback={<div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center"}}>Carregando...</div>}><AceitarConviteContent /></Suspense>;
}
