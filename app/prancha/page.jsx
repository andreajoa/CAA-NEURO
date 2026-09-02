import Image from "next/image";
import Link from "next/link";
import {
  Check,
  Download,
  FileText,
  LockKeyhole,
  Printer,
  Scissors,
  ShieldCheck,
} from "lucide-react";
import { GeistSans } from "geist/font/sans";
import EmbeddedProductCheckout from "./components/EmbeddedProductCheckout";
import HorizontalAccordion from "./components/HorizontalAccordion";
import PracticeCarousel from "./components/PracticeCarousel";
import Reveal from "./components/Reveal";
import StickyMethod from "./components/StickyMethod";
import styles from "./prancha.module.css";

export const metadata = {
  title: "Complete com a Sílaba | Margareth Almeida",
  description: "50 fichas reutilizáveis com sílabas móveis para alfabetização e consciência silábica. Material de Margareth Almeida, Neuropsicopedagoga.",
  alternates: { canonical: "/prancha" },
  openGraph: {
    title: "Complete com a Sílaba",
    description: "Material pedagógico com 50 fichas reutilizáveis, gabarito e sílabas móveis.",
    images: ["/prancha/educator-flatlay.jpg"],
    type: "website",
  },
};

const facts = [
  ["50", "fichas reutilizáveis"],
  ["25", "sílabas trabalhadas"],
  ["2", "arquivos em PDF"],
  ["A4", "pronto para imprimir"],
];

const included = [
  "50 fichas com palavras revisadas",
  "Dois jogos de sílabas móveis",
  "Gabarito completo e legível",
  "Registro de acompanhamento",
  "Orientações de preparação e uso",
  "Download imediato em arquivo ZIP",
];

export default function PranchaPage() {
  return (
    <main className={`${styles.page} ${GeistSans.className}`}>
      <header className={styles.nav}>
        <Link href="/" className={styles.brand} aria-label="Ir para a página inicial do CAA Neuro">
          <span className={styles.brandMark}>CAA</span>
          <span>Neuro</span>
        </Link>
        <span className={styles.authorLine}>Por Margareth Almeida</span>
        <a className={styles.navCta} href="#comprar">Quero o material</a>
      </header>

      <section className={styles.hero}>
        <div className={styles.heroCopy}>
          <Reveal>
            <p className={styles.eyebrow}>Material pedagógico autoral</p>
            <h1>Alfabetização que a criança pode tocar.</h1>
            <p className={styles.heroBody}>Complete palavras, perceba sílabas e transforme a leitura em uma experiência concreta, visual e participativa.</p>
            <div className={styles.heroActions}>
              <a className={styles.primaryCta} href="#comprar">Quero o material</a>
              <a className={styles.secondaryCta} href="#conteudo">Ver o que recebo</a>
            </div>
          </Reveal>
        </div>

        <div className={styles.heroVisual} aria-label="Prévia real do material Complete com a Sílaba">
          <Reveal delay={0.12}>
            <div className={styles.heroPaperMain}>
              <Image src="/prancha/cover.png" alt="Capa real do material Complete com a Sílaba" fill priority sizes="(max-width: 767px) 78vw, 36vw" />
            </div>
            <div className={styles.heroPaperBack}>
              <Image src="/prancha/activity-doente.png" alt="Página real com duas fichas reutilizáveis" fill sizes="(max-width: 767px) 64vw, 29vw" />
            </div>
            <div className={styles.heroPiece}>CA</div>
          </Reveal>
        </div>
      </section>

      <section className={styles.facts} aria-label="Resumo do produto">
        {facts.map(([value, label]) => (
          <div key={label}>
            <strong>{value}</strong>
            <span>{label}</span>
          </div>
        ))}
      </section>

      <section className={styles.tactileSection}>
        <Reveal className={styles.tactileImage}>
          <Image
            src="/prancha/educator-flatlay.jpg"
            alt="Profissional preparando cards pedagógicos laminados com velcro"
            fill
            sizes="(max-width: 767px) 100vw, 56vw"
          />
        </Reveal>
        <Reveal className={styles.tactileCopy} delay={0.08}>
          <h2>Quando completar vira concreto, a criança participa.</h2>
          <p>O velcro cria uma pausa intencional entre observar, escolher, testar e ler. A atividade deixa de ser apenas uma folha e passa a envolver decisão e movimento.</p>
          <div className={styles.tactileBenefits}>
            <span><ShieldCheck aria-hidden="true" /> Aplicação simples</span>
            <span><Printer aria-hidden="true" /> Impressão em A4</span>
            <span><Scissors aria-hidden="true" /> Material reutilizável</span>
          </div>
        </Reveal>
      </section>

      <section id="conteudo" className={styles.section}>
        <Reveal className={styles.sectionHeading}>
          <h2>Tudo o que você precisa para aplicar.</h2>
          <p>Arquivos revisados, tipografia maior e preparação explicada do início ao fim.</p>
        </Reveal>

        <div className={styles.bento}>
          <Reveal className={`${styles.bentoMain} ${styles.bentoCell}`}>
            <div className={styles.bentoImage}>
              <Image src="/prancha/activity-sorvete.png" alt="Prévia real das fichas com letras maiores" fill sizes="(max-width: 767px) 92vw, 56vw" />
            </div>
            <div>
              <h3>50 fichas prontas para imprimir</h3>
              <p>Palavras revisadas ficha por ficha e letras ampliadas para até 26 pt.</p>
            </div>
          </Reveal>

          <Reveal className={`${styles.bentoSmall} ${styles.bentoCell}`} delay={0.08}>
            <FileText aria-hidden="true" />
            <div>
              <h3>Dois PDFs organizados</h3>
              <p>Atividades em um arquivo e peças móveis em outro.</p>
            </div>
          </Reveal>

          <Reveal className={`${styles.bentoSmall} ${styles.bentoCell} ${styles.bentoAccent}`} delay={0.14}>
            <Download aria-hidden="true" />
            <div>
              <h3>Receba e imprima</h3>
              <p>O ZIP fica disponível logo depois da confirmação do pagamento.</p>
            </div>
          </Reveal>
        </div>
      </section>

      <section className={styles.methodSection}>
        <div className={styles.methodIntro}>
          <h2>Um ciclo simples para a leitura fazer sentido.</h2>
          <p>Cada movimento conduz ao próximo, sem excesso de estímulos e com espaço para mediação.</p>
        </div>
        <StickyMethod />
      </section>

      <section className={styles.section}>
        <Reveal className={styles.sectionHeading}>
          <h2>Veja exatamente o que chega.</h2>
          <p>Passe pelas prévias reais dos arquivos incluídos na compra.</p>
        </Reveal>
        <HorizontalAccordion />
      </section>

      <section className={styles.authorSection}>
        <Reveal className={styles.authorCard}>
          <p>Autoria e responsabilidade pedagógica</p>
          <h2>Margareth Almeida</h2>
          <strong>Neuropsicopedagoga</strong>
          <p>Material criado para apoiar profissionais, educadores e famílias com uma proposta concreta de consciência silábica.</p>
          <div className={styles.authorLegal}>
            <LockKeyhole aria-hidden="true" />
            <span>Uso permitido pelo comprador. Revenda, compartilhamento e comercialização por terceiros são proibidos.</span>
          </div>
        </Reveal>
        <Reveal delay={0.1}>
          <PracticeCarousel />
        </Reveal>
      </section>

      <section id="comprar" className={styles.purchaseSection}>
        <Reveal className={styles.offer}>
          <p className={styles.offerKicker}>Pagamento único</p>
          <h2>Complete com a Sílaba</h2>
          <div className={styles.price}><span>R$</span> 9,90</div>
          <p className={styles.priceCaption}>Acesso aos dois PDFs em um único ZIP.</p>
          <ul>
            {included.map((item) => (
              <li key={item}><Check aria-hidden="true" /> {item}</li>
            ))}
          </ul>
        </Reveal>

        <Reveal className={styles.checkoutColumn} delay={0.08}>
          <div className={styles.checkoutHeading}>
            <ShieldCheck aria-hidden="true" />
            <div>
              <h3>Finalize sem sair da página</h3>
              <p>Seus dados de pagamento são processados pela Stripe.</p>
            </div>
          </div>
          <EmbeddedProductCheckout />
        </Reveal>
      </section>

      <section className={styles.faqSection}>
        <Reveal className={styles.sectionHeading}>
          <h2>Perguntas frequentes</h2>
        </Reveal>
        <div className={styles.faqList}>
          <details>
            <summary>Como recebo o material?</summary>
            <p>Após o pagamento confirmado, a página de agradecimento libera o botão para baixar o arquivo ZIP.</p>
          </details>
          <details>
            <summary>O que está incluído na compra?</summary>
            <p>Um PDF com 50 fichas, instruções, gabarito e acompanhamento, além de outro PDF com dois jogos de sílabas móveis.</p>
          </details>
          <details>
            <summary>Posso imprimir mais de uma vez?</summary>
            <p>Sim. O comprador pode imprimir para uso próprio, em sua turma ou em seus atendimentos.</p>
          </details>
          <details>
            <summary>Posso compartilhar ou revender o arquivo?</summary>
            <p>Não. O arquivo digital pertence a Margareth Almeida e não pode ser compartilhado, revendido ou comercializado por terceiros.</p>
          </details>
          <details>
            <summary>Preciso plastificar e usar velcro?</summary>
            <p>É recomendado para aumentar a durabilidade e permitir reutilização, mas a aplicação pode ser adaptada ao contexto.</p>
          </details>
          <details>
            <summary>Qual configuração de impressão devo usar?</summary>
            <p>Imprima em papel A4, tamanho real ou escala de 100%, sem ajustar à página.</p>
          </details>
        </div>
      </section>

      <footer className={styles.footer}>
        <div>
          <strong>Complete com a Sílaba</strong>
          <span>Margareth Almeida, Neuropsicopedagoga</span>
        </div>
        <p>Todos os direitos reservados. Proibida a revenda, a comercialização por terceiros, o compartilhamento e a distribuição.</p>
      </footer>
    </main>
  );
}
