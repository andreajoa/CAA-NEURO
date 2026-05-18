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
        <h1 style={{color:"#06391f",fontSize:36,marginBottom:16}}>Recursos</h1>
        <p style={{color:"#405047",fontSize:16,lineHeight:1.8,marginBottom:32}}>O CAA Neuro oferece um conjunto completo de recursos para profissionais da saúde e educação que trabalham com Comunicação Aumentativa e Alternativa.</p>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20}}>
          {[["🃏 Biblioteca de Cards","Mais de 3.000 imagens organizadas por categoria, nível e tema. Personalize com fotos reais do paciente."],["📋 Pranchas por Nível","Níveis infantil, intermediário e avançado. Cada nível adaptado ao desenvolvimento comunicativo do paciente."],["👤 Gestão de Pacientes","Cadastre pacientes, organize sessões e acompanhe a evolução de cada um individualmente."],["📊 Histórico de Sessões","Registre observações clínicas, anotações de sessão e acompanhe a progressão ao longo do tempo."],["📱 Responsivo","Funciona em celular, tablet e computador. Use no consultório ou durante o atendimento domiciliar."],["🔒 Seguro e Privado","Login seguro com Clerk. Dados protegidos conforme a LGPD. Cada profissional acessa apenas seus pacientes."]].map(([t,d])=>(
            <div key={t} style={{background:"white",borderRadius:12,padding:24,border:"1px solid #e4eaf0"}}>
              <h3 style={{color:"#06391f",marginBottom:8,fontSize:16}}>{t}</h3>
              <p style={{color:"#405047",fontSize:14,lineHeight:1.7}}>{d}</p>
            </div>
          ))}
        </div>
        <div style={{marginTop:40,textAlign:"center"}}>
          <Link href="/sign-up" style={{background:"#1d9e75",color:"white",padding:"14px 32px",borderRadius:8,textDecoration:"none",fontWeight:"bold",fontSize:16}}>Começar gratuitamente →</Link>
        </div>
      </div>
    </main></PublicShell>
  );
}
