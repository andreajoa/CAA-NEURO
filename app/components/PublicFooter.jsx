import Link from "next/link";

export default function PublicFooter() {
  return (
    <footer style={{ background:"#F2E8E1", color:"#1B2D5B", padding:"48px 40px 32px", marginTop:"auto", borderTop:"1px solid #E8B4A8" }}>
      <div style={{ maxWidth:1200, margin:"0 auto" }}>
        <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr 1fr 1fr", gap:40, marginBottom:40 }}>
          <div>
            <div style={{ fontSize:22, fontWeight:700, color:"#C76B4A", marginBottom:8 }}>CAA Neuro</div>
            <p style={{ color:"rgba(27,45,91,0.65)", fontSize:14, lineHeight:1.7, maxWidth:280 }}>
              Plataforma de Comunicação Aumentativa e Alternativa para profissionais da saúde e educação.
            </p>
            <p style={{ color:"rgba(27,45,91,0.5)", fontSize:13, marginTop:16 }}>
              Responsável técnica:<br/>
              <strong style={{ color:"#C76B4A" }}>Margareth Almeida</strong><br/>
              <span style={{ fontSize:12 }}>Fonoaudióloga · CRFa</span>
            </p>
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            <p style={{ color:"#C76B4A", fontSize:12, fontWeight:700, marginBottom:6, letterSpacing:1, textTransform:"uppercase" }}>Plataforma</p>
            {[["Recursos","/recursos"],["Como funciona","/como-funciona"],["Benefícios","/beneficios"],["Depoimentos","/depoimentos"]].map(([l,h]) => (
              <Link key={h} href={h} style={{ color:"#1B2D5B", fontSize:14, textDecoration:"none" }}>{l}</Link>
            ))}
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            <p style={{ color:"#C76B4A", fontSize:12, fontWeight:700, marginBottom:6, letterSpacing:1, textTransform:"uppercase" }}>Para quem</p>
            {[["Fonoaudiólogos","/para-quem"],["Terapeutas Ocupacionais","/para-quem"],["Psicólogos","/para-quem"],["Educadores","/para-quem"],["Prefeituras","/para-quem"]].map(([l,h]) => (
              <Link key={l} href={h} style={{ color:"#1B2D5B", fontSize:14, textDecoration:"none" }}>{l}</Link>
            ))}
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            <p style={{ color:"#C76B4A", fontSize:12, fontWeight:700, marginBottom:6, letterSpacing:1, textTransform:"uppercase" }}>Suporte</p>
            {[["Dúvidas frequentes","/duvidas"],["Suporte","/suporte"],["Segurança","/seguranca"],["Criar conta","/sign-up"],["Entrar","/sign-in"]].map(([l,h]) => (
              <Link key={h} href={h} style={{ color:"#1B2D5B", fontSize:14, textDecoration:"none" }}>{l}</Link>
            ))}
          </div>
        </div>
        <div style={{ borderTop:"0.5px solid #E8B4A8", paddingTop:24, display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:12 }}>
          <p style={{ color:"rgba(27,45,91,0.45)", fontSize:13 }}>© 2026 CAA Neuro · Todos os direitos reservados · Desenvolvido com propósito</p>
          <p style={{ color:"rgba(27,45,91,0.45)", fontSize:13 }}>
            Dados protegidos pela LGPD · <Link href="/seguranca" style={{ color:"#C76B4A", textDecoration:"underline" }}>Política de Segurança</Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
