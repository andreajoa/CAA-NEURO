import PublicFooter from "../components/PublicFooter";
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
        <h1 style={{color:"#06391f",fontSize:36,marginBottom:16}}>Dúvidas frequentes</h1>
        <p style={{color:"#405047",fontSize:16,lineHeight:1.8,marginBottom:40}}>Respondemos as perguntas mais comuns sobre o CAA Neuro.</p>
        <div style={{display:"flex",flexDirection:"column",gap:0}}>
          {[["O CAA Neuro é realmente gratuito?","Sim. O acesso é 100% gratuito para profissionais de saúde e educação. Sem planos pagos, sem limite de pacientes, sem cartão de crédito."],["Preciso instalar algum aplicativo?","Não. O CAA Neuro funciona diretamente no navegador do celular, tablet ou computador. Basta acessar o site e fazer login."],["Meus dados e os dados dos pacientes são seguros?","Sim. Utilizamos autenticação segura (Clerk) e todos os dados são protegidos conforme a LGPD. Cada profissional acessa apenas seus próprios pacientes."],["Posso usar imagens reais dos meus pacientes?","Sim. Você pode fazer upload de fotos reais de objetos, ambientes e pessoas para personalizar os cards de comunicação."],["O CAA Neuro funciona sem internet?","No momento o acesso requer conexão com a internet. Estamos desenvolvendo funcionalidade offline para versões futuras."],["Como faço para implementar na minha clínica ou unidade de saúde?","Cada profissional cria sua própria conta gratuitamente. Para implementação em redes públicas ou clínicas maiores, entre em contato conosco."],["Quem desenvolveu o CAA Neuro?","O CAA Neuro foi desenvolvido sob responsabilidade técnica da Fonoaudióloga Margareth Almeida, com foco nas necessidades reais do atendimento clínico."]].map(([q,a])=>(
            <div key={q} style={{padding:"24px 0",borderBottom:"1px solid #e4eaf0"}}>
              <h3 style={{color:"#06391f",marginBottom:8,fontSize:16}}>{q}</h3>
              <p style={{color:"#405047",fontSize:14,lineHeight:1.7}}>{a}</p>
            </div>
          ))}
        </div>
        <div style={{marginTop:40,textAlign:"center"}}>
          <Link href="/sign-up" style={{background:"#1d9e75",color:"white",padding:"14px 32px",borderRadius:8,textDecoration:"none",fontWeight:"bold",fontSize:16}}>Começar gratuitamente →</Link>
        </div>
      </div>
    </main>
    <PublicFooter />
  </PublicShell>
  );
}
