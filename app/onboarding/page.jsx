"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

const steps = [
  {
    icon: "🏠",
    titulo: "Bem-vindo ao CAA Neuro",
    descricao: "Plataforma de Comunicação Aumentativa e Alternativa para profissionais de saúde e educação.",
    dica: "Você tem acesso a 45.000+ pictogramas, prontuário clínico, análise com IA e muito mais.",
  },
  {
    icon: "🃏",
    titulo: "A Prancha de Comunicação",
    descricao: "Selecione perfis (Infantil, Adulto, Idoso) e níveis linguísticos para adaptar os cards ao seu paciente.",
    dica: "Clique em qualquer card para adicioná-lo à frase. Use 🔊 Falar para reproduzir em voz alta.",
  },
  {
    icon: "🔍",
    titulo: "45.000+ Pictogramas ARASAAC",
    descricao: "No editor de cards, clique em 'Buscar / Gerar imagem' para acessar o maior banco de pictogramas do mundo.",
    dica: "Pesquise em português: 'água', 'feliz', 'escola'... Os resultados aparecem instantaneamente.",
  },
  {
    icon: "✨",
    titulo: "Geração de Imagens com IA",
    descricao: "No plano Pro, gere pictogramas únicos e personalizados com inteligência artificial (fal.ai).",
    dica: "Digite a descrição do card e a IA cria uma imagem exclusiva em segundos.",
  },
  {
    icon: "👥",
    titulo: "Prontuário Clínico",
    descricao: "Cadastre seus pacientes com diagnóstico, escola, medicamentos e objetivos terapêuticos.",
    dica: "Registre cada sessão com evolução observada. A IA analisa o histórico e gera insights clínicos.",
  },
  {
    icon: "📄",
    titulo: "Relatórios Profissionais",
    descricao: "Gere relatórios PDF, Excel e CSV com o histórico completo de cada paciente.",
    dica: "Acesse /pacientes → selecione um paciente → clique em PDF, Excel ou CSV.",
  },
  {
    icon: "🚀",
    titulo: "Tudo pronto!",
    descricao: "Você está preparado para usar o CAA Neuro com seus pacientes.",
    dica: "Explore a Biblioteca de Pranchas, as Atividades Adaptadas e o Painel Admin para mais recursos.",
  },
];

export default function OnboardingPage() {
  const [step, setStep] = useState(0);
  const router = useRouter();
  const current = steps[step];
  const isLast = step === steps.length - 1;

  return (
    <div style={{minHeight:"100vh",background:"linear-gradient(135deg,#071b2c,#0d3320)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",fontFamily:"Arial,Helvetica,sans-serif",padding:"24px"}}>
      <div style={{maxWidth:"560px",width:"100%"}}>
        {/* Progress */}
        <div style={{display:"flex",gap:"6px",marginBottom:"32px",justifyContent:"center"}}>
          {steps.map((_,i) => (
            <div key={i} style={{height:"4px",flex:1,borderRadius:"2px",background:i<=step?"#4ec9a0":"rgba(255,255,255,0.15)",transition:"background 0.3s"}} />
          ))}
        </div>

        {/* Card */}
        <div style={{background:"white",borderRadius:"24px",padding:"40px",textAlign:"center",boxShadow:"0 20px 60px rgba(0,0,0,0.3)"}}>
          <div style={{fontSize:"64px",marginBottom:"20px"}}>{current.icon}</div>
          <h1 style={{fontSize:"24px",fontWeight:"900",color:"#071b2c",margin:"0 0 12px"}}>{current.titulo}</h1>
          <p style={{fontSize:"16px",color:"#374151",lineHeight:"1.6",margin:"0 0 16px"}}>{current.descricao}</p>
          <div style={{background:"#f0fdf4",border:"1px solid #bbf7d0",borderRadius:"12px",padding:"14px 16px",marginBottom:"28px"}}>
            <p style={{fontSize:"14px",color:"#166534",margin:0,lineHeight:"1.5"}}>💡 {current.dica}</p>
          </div>
          <div style={{display:"flex",gap:"10px",justifyContent:"center"}}>
            {step > 0 && (
              <button onClick={()=>setStep(s=>s-1)}
                style={{padding:"12px 24px",borderRadius:"12px",border:"1px solid #e5e7eb",background:"white",cursor:"pointer",fontWeight:"600",fontSize:"15px",color:"#374151"}}>
                ← Anterior
              </button>
            )}
            <button
              onClick={()=>{ if(isLast) router.push("/app"); else setStep(s=>s+1); }}
              style={{padding:"12px 32px",borderRadius:"12px",border:"none",background:"#00885f",color:"white",cursor:"pointer",fontWeight:"700",fontSize:"15px",flex:step===0?1:"auto"}}>
              {isLast ? "Ir para a prancha →" : "Próximo →"}
            </button>
          </div>
          {!isLast && (
            <button onClick={()=>router.push("/app")}
              style={{background:"none",border:"none",color:"#9ca3af",cursor:"pointer",fontSize:"13px",marginTop:"16px",textDecoration:"underline"}}>
              Pular tutorial
            </button>
          )}
        </div>

        <p style={{color:"rgba(255,255,255,0.4)",fontSize:"12px",textAlign:"center",marginTop:"16px"}}>
          Passo {step+1} de {steps.length}
        </p>
      </div>
    </div>
  );
}
