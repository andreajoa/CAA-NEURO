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
        <h1 style={{color:"#06391f",fontSize:36,marginBottom:16}}>Benefícios</h1>
        <p style={{color:"#405047",fontSize:16,lineHeight:1.8,marginBottom:32}}>A pesquisa científica comprova: quando a comunicação funcional é promovida por meio da CAA, comportamentos desafiadores reduzem, a autonomia aumenta e a qualidade de vida melhora significativamente.</p>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:20,marginBottom:40}}>
          {[["⏱️ Economize tempo","Elimine horas de preparo manual. Monte pranchas digitais em minutos e reutilize entre pacientes."],["📈 Evolução visível","Acompanhe o progresso de cada paciente sessão a sessão. Dados que embasam o seu laudo clínico."],["📱 Em qualquer lugar","Celular, tablet ou computador. Atenda com qualidade no consultório, escola ou domicílio."],["🎨 100% personalizável","Substitua qualquer imagem pela foto real do ambiente ou objeto do paciente para maior eficácia."],["🔄 Continuidade","Histórico completo. Mesmo que o paciente mude de profissional, o progresso é preservado."],["💰 Sem custo","Gratuito para sempre para profissionais. Sem planos, sem mensalidade, sem cartão de crédito."]].map(([t,d])=>(
            <div key={t} style={{background:"white",borderRadius:12,padding:24,border:"1px solid #e4eaf0",textAlign:"center"}}>
              <div style={{fontSize:32,marginBottom:12}}>{t.split(" ")[0]}</div>
              <h3 style={{color:"#06391f",marginBottom:8,fontSize:15}}>{t.substring(3)}</h3>
              <p style={{color:"#405047",fontSize:13,lineHeight:1.7}}>{d}</p>
            </div>
          ))}
        </div>
        <div style={{textAlign:"center"}}>
          <Link href="/sign-up" style={{background:"#1d9e75",color:"white",padding:"14px 32px",borderRadius:8,textDecoration:"none",fontWeight:"bold",fontSize:16}}>Quero esses benefícios →</Link>
        </div>
      </div>
    </main>
  </PublicShell>
  );
}
