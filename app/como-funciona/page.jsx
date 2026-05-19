import PublicShell from "../../components/PublicShell";
import Link from "next/link";
export default function Page() {
  return (<PublicShell>
    <main style={{minHeight:"100vh",fontFamily:"Arial,sans-serif",background:"#f5f7fb"}}>
      <div style={{background:"#0a1e0f",padding:"20px 40px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <Link href="/" style={{color:"#4ec9a0",fontWeight:700,fontSize:20,textDecoration:"none"}}>CAA Neuro</Link>
        <Link href="/sign-in" style={{color:"white",textDecoration:"none",fontSize:14}}>Entrar</Link>
      </div>
      <div style={{maxWidth:800,margin:"60px auto",padding:"0 40px"}}>
        <h1 style={{color:"#06391f",fontSize:36,marginBottom:16}}>Como funciona</h1>
        <p style={{color:"#405047",fontSize:16,lineHeight:1.8,marginBottom:40}}>Do cadastro ao atendimento real em menos de 5 minutos.</p>
        <div style={{display:"flex",flexDirection:"column",gap:0}}>
          {[["1","Crie sua conta gratuitamente","Acesse com e-mail ou Google. Seu perfil profissional é criado automaticamente com autenticação segura via Clerk."],["2","Cadastre seus pacientes","Cada paciente tem perfil próprio, histórico de sessões e prancha personalizada. Nada se mistura entre atendimentos."],["3","Monte a prancha","Escolha cards por categoria, nível e tema. Adicione imagens reais, edite nomes e organize por nível comunicativo."],["4","Use no atendimento","Abra no celular ou tablet durante a sessão. O paciente interage diretamente com a prancha na tela."],["5","Registre a sessão","Adicione observações clínicas, anote evoluções e salve o histórico da sessão com data e hora."],["6","Acompanhe a evolução","Visualize o progresso ao longo do tempo. Dados que embasam relatórios e laudos clínicos."]].map(([n,t,d])=>(
            <div key={n} style={{display:"flex",gap:20,padding:"24px 0",borderBottom:"1px solid #e4eaf0"}}>
              <div style={{width:40,height:40,borderRadius:"50%",background:"#1d9e75",color:"white",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,fontSize:16,flexShrink:0}}>{n}</div>
              <div>
                <h3 style={{color:"#06391f",marginBottom:6,fontSize:16}}>{t}</h3>
                <p style={{color:"#405047",fontSize:14,lineHeight:1.7}}>{d}</p>
              </div>
            </div>
          ))}
        </div>
        <div style={{marginTop:40,textAlign:"center"}}>
          <Link href="/sign-up" style={{background:"#1d9e75",color:"white",padding:"14px 32px",borderRadius:8,textDecoration:"none",fontWeight:"bold",fontSize:16}}>Começar agora — é grátis →</Link>
        </div>
      </div>
    </main>
  </PublicShell>
  );
}
