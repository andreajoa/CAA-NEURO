import PublicShell from "../../components/PublicShell";
import Link from "next/link";
export default function Page() {
  return (<PublicShell>
    <main style={{minHeight:"100vh",fontFamily:"Arial,sans-serif",background:"#f5f7fb"}}>
      <div style={{background:"#0a1e0f",padding:"20px 40px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <Link href="/" style={{color:"#4ec9a0",fontWeight:700,fontSize:20,textDecoration:"none"}}>CAA Neuro</Link>
        <Link href="/sign-in" style={{color:"white",textDecoration:"none",fontSize:14}}>Entrar</Link>
      </div>
      <div style={{maxWidth:900,margin:"60px auto",padding:"0 40px"}}>
        <h1 style={{color:"#06391f",fontSize:36,marginBottom:16}}>Depoimentos</h1>
        <p style={{color:"#405047",fontSize:16,lineHeight:1.8,marginBottom:40}}>Profissionais que já estão transformando atendimentos com o CAA Neuro.</p>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:24}}>
          {[["Fernanda M.","Fonoaudióloga · São Paulo","O CAA Neuro mudou completamente minha rotina clínica. Antes eu gastava horas preparando material. Agora monto a prancha em minutos e foco no que importa: meu paciente."],["Rafael C.","Terapeuta Ocupacional · Rio de Janeiro","A possibilidade de usar fotos reais do ambiente do paciente faz toda a diferença. A comunicação fica muito mais funcional e significativa."],["Ana S.","Psicóloga · Minas Gerais","Uso o CAA Neuro para ajudar pacientes com dificuldade de expressão emocional. O histórico de sessões me ajuda a acompanhar a evolução com muito mais precisão."],["Carlos B.","Neuropsicopedagogo · Brasília","Implementamos na escola e os professores adoraram. É intuitivo, funciona no celular e não precisa de treinamento extenso para usar."]].map(([n,r,t])=>(
            <div key={n} style={{background:"white",borderRadius:12,padding:28,border:"1px solid #e4eaf0"}}>
              <p style={{color:"#405047",fontSize:15,lineHeight:1.8,fontStyle:"italic",marginBottom:20}}>"{t}"</p>
              <div style={{display:"flex",alignItems:"center",gap:12}}>
                <div style={{width:40,height:40,borderRadius:"50%",background:"#1d9e75",color:"white",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700}}>{n[0]}</div>
                <div><p style={{color:"#06391f",fontWeight:700,margin:0,fontSize:14}}>{n}</p><p style={{color:"#7b8790",margin:0,fontSize:12}}>{r}</p></div>
              </div>
            </div>
          ))}
        </div>
        <div style={{marginTop:40,textAlign:"center"}}>
          <Link href="/sign-up" style={{background:"#1d9e75",color:"white",padding:"14px 32px",borderRadius:8,textDecoration:"none",fontWeight:"bold",fontSize:16}}>Criar minha conta gratuita →</Link>
        </div>
      </div>
    </main></PublicShell>
  );
}
