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

      <footer style={{background:"#0a1e0f",color:"white",padding:"48px 40px 32px",marginTop:0}}>
        <div style={{maxWidth:1200,margin:"0 auto"}}>
          <div style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr 1fr",gap:40,marginBottom:40}}>
            <div>
              <div style={{fontSize:22,fontWeight:700,color:"#4ec9a0",marginBottom:8}}>CAA Neuro</div>
              <p style={{color:"rgba(255,255,255,0.55)",fontSize:14,lineHeight:1.7,maxWidth:280}}>Plataforma de Comunicação Aumentativa e Alternativa para profissionais da saúde e educação.</p>
              <p style={{color:"rgba(255,255,255,0.4)",fontSize:13,marginTop:16}}>Responsável técnica:<br/><strong style={{color:"#4ec9a0"}}>Margareth Almeida</strong><br/><span style={{fontSize:12}}>Fonoaudióloga · CRFa</span></p>
            </div>
            <div>
              <p style={{color:"rgba(255,255,255,0.4)",fontSize:12,fontWeight:700,marginBottom:14,letterSpacing:1}}>PLATAFORMA</p>
              <div style={{display:"flex",flexDirection:"column",gap:10}}>
                <Link href="/recursos" style={{color:"rgba(255,255,255,0.7)",fontSize:14,textDecoration:"none"}}>Recursos</Link>
                <Link href="/como-funciona" style={{color:"rgba(255,255,255,0.7)",fontSize:14,textDecoration:"none"}}>Como funciona</Link>
                <Link href="/beneficios" style={{color:"rgba(255,255,255,0.7)",fontSize:14,textDecoration:"none"}}>Benefícios</Link>
                <Link href="/depoimentos" style={{color:"rgba(255,255,255,0.7)",fontSize:14,textDecoration:"none"}}>Depoimentos</Link>
              </div>
            </div>
            <div>
              <p style={{color:"rgba(255,255,255,0.4)",fontSize:12,fontWeight:700,marginBottom:14,letterSpacing:1}}>PARA QUEM</p>
              <div style={{display:"flex",flexDirection:"column",gap:10}}>
                <Link href="/para-quem" style={{color:"rgba(255,255,255,0.7)",fontSize:14,textDecoration:"none"}}>Fonoaudiólogos</Link>
                <Link href="/para-quem" style={{color:"rgba(255,255,255,0.7)",fontSize:14,textDecoration:"none"}}>Terapeutas Ocupacionais</Link>
                <Link href="/para-quem" style={{color:"rgba(255,255,255,0.7)",fontSize:14,textDecoration:"none"}}>Psicólogos</Link>
                <Link href="/para-quem" style={{color:"rgba(255,255,255,0.7)",fontSize:14,textDecoration:"none"}}>Educadores</Link>
                <Link href="/para-quem" style={{color:"rgba(255,255,255,0.7)",fontSize:14,textDecoration:"none"}}>Prefeituras</Link>
              </div>
            </div>
            <div>
              <p style={{color:"rgba(255,255,255,0.4)",fontSize:12,fontWeight:700,marginBottom:14,letterSpacing:1}}>SUPORTE</p>
              <div style={{display:"flex",flexDirection:"column",gap:10}}>
                <Link href="/duvidas" style={{color:"rgba(255,255,255,0.7)",fontSize:14,textDecoration:"none"}}>Dúvidas frequentes</Link>
                <Link href="/suporte" style={{color:"rgba(255,255,255,0.7)",fontSize:14,textDecoration:"none"}}>Suporte</Link>
                <Link href="/sign-up" style={{color:"rgba(255,255,255,0.7)",fontSize:14,textDecoration:"none"}}>Criar conta</Link>
                <Link href="/sign-in" style={{color:"rgba(255,255,255,0.7)",fontSize:14,textDecoration:"none"}}>Entrar</Link>
              </div>
            </div>
          </div>
          <div style={{borderTop:"0.5px solid rgba(255,255,255,0.1)",paddingTop:24,display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:12}}>
            <p style={{color:"rgba(255,255,255,0.35)",fontSize:13}}>© 2026 CAA Neuro · Todos os direitos reservados · Desenvolvido com propósito</p>
            <p style={{color:"rgba(255,255,255,0.35)",fontSize:13}}>Dados protegidos pela LGPD</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
