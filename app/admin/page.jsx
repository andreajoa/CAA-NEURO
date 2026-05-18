"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";

export default function AdminPage() {
  const { user, isLoaded } = useUser();
  const [logs, setLogs] = useState([]);
  const [error, setError] = useState("");

  const adminEmail = "tdahma2@gmail.com";
  const email = user?.primaryEmailAddress?.emailAddress;

  useEffect(() => {
    async function loadLogs() {
      try {
        const res = await fetch("/api/logs");
        const data = await res.json();

        if (!res.ok) throw new Error(data?.error || "Erro ao carregar logs");

        setLogs(data.logs || []);
      } catch (err) {
        setError(err.message);
      }
    }

    if (isLoaded && email === adminEmail) loadLogs();
  }, [isLoaded, email]);

  if (!isLoaded) return <main style={{padding:40}}>Carregando...</main>;

  if (email !== adminEmail) {
    return (
      <main style={{padding:40}}>
        <h1>Acesso restrito</h1>
        <p>Você não tem permissão para acessar esta área.</p>
      </main>
    );
  }

  return (
    <main style={{padding:40,maxWidth:1200,margin:"0 auto"}}>
      <h1 style={{fontSize:40,marginBottom:30}}>Painel administrativo</h1>

      {error && <p style={{color:"red"}}>{error}</p>}

      <section style={{background:"#fff",padding:20,borderRadius:20}}>
        <h2>Últimos logs</h2>

        {!logs.length && <p>Nenhum log encontrado.</p>}

        {logs.map((log) => (
          <div key={log.id} style={{borderBottom:"1px solid #ddd",padding:15}}>
            <b>{log.level}</b>
            <p><strong>Fonte:</strong> {log.source}</p>
            <p><strong>Mensagem:</strong> {log.message}</p>
            <small>{log.created_at}</small>
          </div>
        ))}
      </section>
    </main>
  );
}
