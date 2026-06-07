"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

const avatarColors = ["#2563eb","#7c3aed","#059669","#dc2626","#d97706","#0891b2"];
const avatarColor = (nome) => avatarColors[(nome?.charCodeAt(0)||0) % avatarColors.length];
const initials = (nome) => nome?.split(" ").slice(0,2).map(w=>w[0]).join("").toUpperCase() || "?";

export default function TestimonialsSection() {
  const [testimonials, setTestimonials] = useState([]);

  useEffect(() => {
    fetch("/api/testimonials")
      .then(r => r.json())
      .then(d => setTestimonials((d.testimonials || []).slice(0, 6)))
      .catch(() => {});
  }, []);

  if (!testimonials.length) return (
    <section className="testimonialsSection">
      <h2>O que dizem os profissionais</h2>
      <p className="sub">Seja o primeiro a compartilhar sua experiência.</p>
      <div style={{ textAlign:"center" }}>
        <Link href="/depoimentos" className="testimonialsCtaRow" style={{ display:"inline-block", border:"2px solid #C76B4A", color:"#C76B4A", padding:"12px 32px", borderRadius:"10px", fontWeight:"700", fontSize:"15px", textDecoration:"none" }}>
          Compartilhar minha experiência →
        </Link>
      </div>
    </section>
  );

  return (
    <section className="testimonialsSection">
      <h2>O que dizem os profissionais</h2>
      <p className="sub">Histórias reais de quem transforma atendimentos com o CAA Neuro.</p>
      <div className="testimonialsGrid">
        {testimonials.map(t => (
          <div key={t.id} className={`testimonialCard${t.destaque ? " destaque" : ""}`}>
            <div className="testimonialQuote">"</div>
            <p className="testimonialText">{t.texto}</p>
            <div className="testimonialAuthor">
              {t.foto_url
                ? <img src={t.foto_url} alt={t.nome} className="testimonialAvatar" />
                : <div className="testimonialInitials" style={{ background: avatarColor(t.nome) }}>{initials(t.nome)}</div>
              }
              <div>
                <div className="testimonialName">{t.nome}</div>
                {(t.profissao || t.cidade) && <div className="testimonialRole">{t.profissao}{t.profissao && t.cidade ? ` · ${t.cidade}` : t.cidade}</div>}
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="testimonialsCtaRow">
        <Link href="/depoimentos">Ver todos os depoimentos →</Link>
      </div>
    </section>
  );
}
