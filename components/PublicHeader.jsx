import Link from "next/link";
import { Brain } from "lucide-react";

export default function PublicHeader() {
  return (
    <header className="landingNav">
      <Link href="/" className="brand">
        <Brain size={42} />
        <div><strong>CAA</strong><span>NEURO</span></div>
      </Link>

      <nav>
        <Link href="/recursos">Recursos</Link>
        <Link href="/para-quem">Para quem é</Link>
        <Link href="/beneficios">Benefícios</Link>
        <Link href="/como-funciona">Como funciona</Link>
        <Link href="/depoimentos">Depoimentos</Link>
        <Link href="/duvidas">Dúvidas</Link>
        <Link href="/suporte">Suporte</Link>
      </nav>

      <div className="navActions">
        <Link href="/sign-in" className="loginBtn">Entrar</Link>
        <Link href="/sign-up" className="primaryBtn">Começar gratuitamente</Link>
      </div>
    </header>
  );
}
