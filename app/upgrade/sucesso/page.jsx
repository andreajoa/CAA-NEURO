"use client";
import { useEffect, useState, Suspense } from "react";
import { useRouter } from "next/navigation";

function SucessoContent() {
  const router = useRouter();
  const [contador, setContador] = useState(5);

  useEffect(() => {
    const t = setInterval(() => {
      setContador(c => {
        if (c <= 1) { clearInterval(t); router.push("/app"); }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <div style={{minHeight:"100vh",background:"#f0fdf4",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"system-ui"}}>
      <div style={{background:"white",borderRadius:"24px",padding:"48px",maxWidth:"480px",width:"90%",textAlign:"center",boxShadow:"0 8px 40px rgba(0,136,95,0.15)"}}>
        <div style={{fontSize:"72px",marginBottom:"16px"}}>🎉</div>
        <h1 style={{fontSize:"28px",fontWeight:"900",color:"#071b2c",marginBottom:"8px"}}>Bem-vindo ao Pro!</h1>
        <p style={{color:"#6b7280",fontSize:"16px",marginBottom:"24px",lineHeight:"1.6"}}>
          Sua assinatura CAA Neuro Pro está ativa. Agora você tem acesso a geração de imagens com IA, análise clínica automática e muito mais.
        </p>
        <div style={{background:"#f0fdf4",borderRadius:"12px",padding:"16px",marginBottom:"24px"}}>
          <div style={{fontSize:"14px",fontWeight:"700",color:"#00885f",marginBottom:"8px"}}>✅ O que foi desbloqueado:</div>
          <ul style={{listStyle:"none",padding:0,margin:0,textAlign:"left"}}>
            {["✨ Geração de imagens com IA (fal.ai)","🤖 Análise clínica com IA (GLM)","📄 Relatórios PDF profissionais","📊 Exportação Excel e CSV","🔗 Compartilhamento ilimitado por link"].map(item => (
              <li key={item} style={{fontSize:"14px",color:"#374151",padding:"4px 0"}}>{item}</li>
            ))}
          </ul>
        </div>
        <button onClick={() => router.push("/app")}
          style={{background:"#00885f",color:"white",border:"none",padding:"14px 32px",borderRadius:"12px",fontSize:"16px",fontWeight:"700",cursor:"pointer",width:"100%"}}>
          Ir para a prancha agora
        </button>
        <p style={{color:"#9ca3af",fontSize:"13px",marginTop:"12px"}}>Redirecionando em {contador}s...</p>
      </div>
    </div>
  );
}

export default function Sucesso() {
  return (
    <Suspense fallback={<div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center"}}>Carregando...</div>}>
      <SucessoContent />
    </Suspense>
  );
}
