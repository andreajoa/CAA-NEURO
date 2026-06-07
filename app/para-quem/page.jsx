import PublicShell from "../../components/PublicShell";
import Link from "next/link";
export default function Page() {
  return (<PublicShell>
    <main style={{minHeight:"100vh",fontFamily:"Arial,sans-serif",background:"#F2E8E1"}}>
      <div style={{background:"#0a1e0f",padding:"20px 40px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <Link href="/" style={{color:"#E8B4A8",fontWeight:700,fontSize:20,textDecoration:"none"}}>CAA Neuro</Link>
        <Link href="/sign-in" style={{color:"white",textDecoration:"none",fontSize:14}}>Entrar</Link>
      </div>
      <div style={{maxWidth:900,margin:"60px auto",padding:"0 40px"}}>
        <h1 style={{color:"#1B2D5B",fontSize:36,marginBottom:16}}>Para quem é</h1>
        <p style={{color:"#405047",fontSize:16,lineHeight:1.8,marginBottom:32}}>O CAA Neuro foi desenvolvido para todos os profissionais que trabalham com pessoas com necessidades complexas de comunicação.</p>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20}}>
          {[["🎙️ Fonoaudiólogos","Profissionais líderes na implementação da CAA. Monte pranchas personalizadas, registre sessões e acompanhe a evolução comunicativa de cada paciente."],["🤲 Terapeutas Ocupacionais","Integre a CAA ao plano terapêutico ocupacional. Adapte os recursos às habilidades motoras e sensoriais de cada pessoa."],["🧠 Psicólogos","Utilize a CAA como suporte à expressão emocional e comunicação funcional em processos terapêuticos."],["📚 Neuropsicopedagogos","Apoie o desenvolvimento comunicativo no contexto educacional com pranchas adaptadas ao nível cognitivo do aluno."],["🏫 Educadores e Professores","Leve a CAA para a sala de aula. Crie pranchas temáticas para rotina escolar e inclusão educacional."],["🏛️ Prefeituras e Redes Públicas","Implemente a CAA em larga escala na rede pública de saúde. Acesso gratuito para todos os profissionais da equipe."]].map(([t,d])=>(
            <div key={t} style={{background:"white",borderRadius:12,padding:24,border:"1px solid #e4eaf0"}}>
              <h3 style={{color:"#1B2D5B",marginBottom:8,fontSize:16}}>{t}</h3>
              <p style={{color:"#405047",fontSize:14,lineHeight:1.7}}>{d}</p>
            </div>
          ))}
        </div>
        <div style={{marginTop:40,textAlign:"center"}}>
          <Link href="/sign-up" style={{background:"#1d9e75",color:"white",padding:"14px 32px",borderRadius:8,textDecoration:"none",fontWeight:"bold",fontSize:16}}>Criar minha conta gratuita →</Link>
        </div>
      </div>
    </main>
  </PublicShell>
  );
}
