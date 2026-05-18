import { Brain, Users, Heart, BarChart3, Grid2X2, BookOpen, CalendarCheck, Pencil, FileText, GraduationCap, MessageCircle, Hand, ShieldCheck } from "lucide-react";
import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="landingPage">
      <header className="landingNav">
        <div className="brand">
          <Brain size={42} />
          <div><strong>CAA</strong><span>NEURO</span></div>
        </div>

        <nav>
          <a>Recursos</a>
          <a>Para quem é</a>
          <a>Benefícios</a>
          <a>Como funciona</a>
          <a>Depoimentos</a>
          <a>Dúvidas</a>
        </nav>

        <div className="navActions">
          <Link href="/sign-in" className="loginBtn">Entrar</Link>
          <Link href="/sign-up" className="primaryBtn">Começar gratuitamente</Link>
        </div>
      </header>

      <section className="heroLanding">
        <div className="heroText">
          <div className="badge">✦ Plataforma gratuita</div>
          <h1>Transforme comunicação em <span>conexão e autonomia.</span></h1>
          <p>CAA Neuro é a plataforma completa para criação de pranchas de Comunicação Alternativa e Aumentativa, acompanhamento de evolução e organização de atendimentos.</p>

          <div className="painGrid">
            <div><Users /> <b>Para profissionais</b><small>Agilize atendimentos e personalize de verdade.</small></div>
            <div><Heart /> <b>Para seus pacientes</b><small>Mais autonomia, expressão e qualidade de vida.</small></div>
            <div><BarChart3 /> <b>Para resultados reais</b><small>Acompanhe evolução por níveis e relatórios.</small></div>
            <div><Grid2X2 /> <b>100% gratuito</b><small>Comece agora, sem cartão de crédito.</small></div>
          </div>

          <div className="heroActions">
            <Link href="/sign-up" className="primaryBig">Começar gratuitamente agora →</Link>
            <Link href="/sign-in" className="secondaryBig">Ver como funciona ▶</Link>
          </div>

          <div className="trustRow">
            <span>✓ Sem cartão de crédito</span>
            <span>✓ Acesso imediato</span>
            <span>✓ Sempre gratuito</span>
          </div>
        </div>

        <div className="heroVisual">
          <div className="heroImage"></div>
          <div className="quoteCard">
            <strong>“</strong>
            <p>Não é apenas sobre falar. É sobre ser <span>compreendido.</span></p>
            <Heart />
          </div>
        </div>
      </section>

      <section className="professionalsStrip">
        <div><Users /> <b>Feito para quem faz<br/>a diferença todos os dias</b></div>
        <div><MessageCircle /> Fonoaudiólogos</div>
        <div><Hand /> Terapeutas Ocupacionais</div>
        <div><Brain /> Psicólogos</div>
        <div><GraduationCap /> Neuropsicopedagogos</div>
        <div><Users /> Educadores</div>
      </section>

      <section className="featuresLanding">
        <div className="featuresIntro">
          <h2>Tudo que você precisa <span>em um só lugar</span></h2>
          <p>Recursos completos, simples de usar e feitos para transformar atendimentos e vidas.</p>
        </div>

        {[
          ["Pacientes", "Gerencie seus pacientes e acompanhe cada etapa.", Users],
          ["Sessões", "Registre sessões, anotações e evolução.", CalendarCheck],
          ["Biblioteca Inteligente", "Imagens organizadas por categorias e temas.", BookOpen],
          ["Níveis de Comunicação", "Atividades por níveis de dificuldade.", BarChart3],
          ["Personalização", "Crie pranchas únicas para cada necessidade.", Pencil],
          ["Relatórios", "Histórico completo e evolução registrada.", FileText],
        ].map(([title, text, Icon]) => (
          <div className="featureCard" key={title}>
            <Icon />
            <h3>{title}</h3>
            <p>{text}</p>
          </div>
        ))}
      </section>

      <section className="bottomCta">
        <div className="brainBadge"><Brain /></div>
        <div><strong>3.000+</strong><span>imagens na biblioteca</span></div>
        <div><strong>Níveis</strong><span>de dificuldade</span></div>
        <div><strong>100%</strong><span>gratuito para sempre</span></div>
        <div><strong>Acesso</strong><span>em qualquer lugar</span></div>
        <div><strong>+ Profissionais</strong><span>transformando vidas</span></div>
        <div className="ctaBox">
          <b>Pronto para transformar a comunicação?</b>
          <Link href="/sign-up">Começar gratuitamente agora →</Link>
        </div>
      </section>
    </main>
  );
}
