"use client";

import PublicShell from "../../components/PublicShell";
import { useState } from "react";

export default function SuportePage() {
  const [form, setForm] = useState({
    nome: "",
    email: "",
    assunto: "",
    mensagem: "",
  });

  function enviar(e) {
    e.preventDefault();

    const subject = encodeURIComponent(`Suporte CAA Neuro - ${form.assunto || "Contato"}`);
    const body = encodeURIComponent(
`Nome: ${form.nome}
Email: ${form.email}

Mensagem:
${form.mensagem}`
    );

    window.location.href = `mailto:info@adhdautism.online?subject=${subject}&body=${body}`;
  }

  return (
    <PublicShell>
      <main className="supportPage">
        <section className="supportHero">
          <span>Suporte CAA Neuro</span>
          <h1>Precisa de ajuda?</h1>
          <p>Preencha o formulário abaixo e envie sua mensagem para nossa equipe.</p>
        </section>

        <form className="supportForm" onSubmit={enviar}>
          <label>Nome</label>
          <input required value={form.nome} onChange={(e)=>setForm({...form,nome:e.target.value})} placeholder="Seu nome" />

          <label>Email</label>
          <input required type="email" value={form.email} onChange={(e)=>setForm({...form,email:e.target.value})} placeholder="seuemail@email.com" />

          <label>Assunto</label>
          <input required value={form.assunto} onChange={(e)=>setForm({...form,assunto:e.target.value})} placeholder="Ex: Problema no cadastro" />

          <label>Mensagem</label>
          <textarea required value={form.mensagem} onChange={(e)=>setForm({...form,mensagem:e.target.value})} placeholder="Descreva o problema..." />

          <button type="submit">Enviar mensagem</button>

          <p className="supportNote">
            A mensagem será enviada para <strong>info@adhdautism.online</strong>.
          </p>
        </form>
      </main>
    </PublicShell>
  );
}
