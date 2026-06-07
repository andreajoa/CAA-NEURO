import Link from "next/link";

export default function PublicFooter() {
  return (
    <footer className="publicFooter">
      <div>
        <h3>CAA Neuro</h3>
        <p>Plataforma de Comunicação Aumentativa e Alternativa para profissionais da saúde e educação.</p>
        <p style={{ fontSize:13, marginTop:16, color:"rgba(27,45,91,0.5)" }}>
          Responsável técnica:<br/>
          <strong style={{ color:"#C76B4A" }}>Margareth Almeida</strong><br/>
          <span style={{ fontSize:12 }}>Fonoaudióloga · CRFa</span>
        </p>
      </div>
      <div>
        <h4>Plataforma</h4>
        {[["Recursos","/recursos"],["Como funciona","/como-funciona"],["Benefícios","/beneficios"],["Depoimentos","/depoimentos"]].map(([l,h]) => (
          <Link key={h} href={h}>{l}</Link>
        ))}
      </div>
      <div>
        <h4>Para quem</h4>
        {[["Fonoaudiólogos","/para-quem"],["Terapeutas Ocupacionais","/para-quem"],["Psicólogos","/para-quem"],["Educadores","/para-quem"],["Prefeituras","/para-quem"]].map(([l,h]) => (
          <Link key={l} href={h}>{l}</Link>
        ))}
      </div>
      <div>
        <h4>Suporte</h4>
        {[["Dúvidas frequentes","/duvidas"],["Suporte","/suporte"],["Segurança","/seguranca"],["Criar conta","/sign-up"],["Entrar","/sign-in"]].map(([l,h]) => (
          <Link key={h} href={h}>{l}</Link>
        ))}
      </div>
      <div className="footerBottom">
        <p style={{ margin:0 }}>© 2026 CAA Neuro · Todos os direitos reservados · Desenvolvido com propósito</p>
        <p style={{ margin:0 }}>
          Dados protegidos pela LGPD · <Link href="/seguranca" style={{ color:"#C76B4A", textDecoration:"underline" }}>Política de Segurança</Link>
        </p>
      </div>
    </footer>
  );
}
