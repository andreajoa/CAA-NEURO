import Link from "next/link";

export default function PublicFooter() {
  return (
    <footer className="publicFooter">
      <div>
        <h3>CAA Neuro</h3>
        <p>Plataforma de Comunicação Aumentativa e Alternativa para profissionais da saúde e educação.</p>
        <p>Responsável técnica:<br/><strong>Margareth Almeida</strong><br/>Fonoaudióloga · CRFa</p>
      </div>

      <div>
        <h4>Plataforma</h4>
        <Link href="/recursos">Recursos</Link>
        <Link href="/como-funciona">Como funciona</Link>
        <Link href="/beneficios">Benefícios</Link>
        <Link href="/depoimentos">Depoimentos</Link>
      </div>

      <div>
        <h4>Para quem</h4>
        <Link href="/para-quem">Fonoaudiólogos</Link>
        <Link href="/para-quem">Terapeutas Ocupacionais</Link>
        <Link href="/para-quem">Psicólogos</Link>
        <Link href="/para-quem">Educadores</Link>
        <Link href="/para-quem">Prefeituras</Link>
      </div>

      <div>
        <h4>Suporte</h4>
        <Link href="/duvidas">Dúvidas frequentes</Link>
        <Link href="/suporte">Suporte</Link>
        <Link href="/sign-up">Criar conta</Link>
        <Link href="/sign-in">Entrar</Link>
      </div>

      <div className="footerBottom">
        <span>© 2026 CAA Neuro · Todos os direitos reservados</span>
        <span>Dados protegidos pela LGPD</span>
      </div>
    </footer>
  );
}
