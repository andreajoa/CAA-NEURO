import Link from "next/link";
import PublicShell from "../../components/PublicShell";
import { ShieldCheck, Lock, Eye, FileText, Server, AlertTriangle, CheckCircle } from "lucide-react";

export const metadata = { title: "Segurança e Privacidade — CAA Neuro" };

export default function SegurancaPage() {
  const s = { fontFamily:"system-ui,sans-serif", color:"#1B2D5B" };
  const section = { maxWidth:"820px", margin:"0 auto", padding:"0 24px 64px" };
  const h2 = { fontSize:"24px", fontWeight:"800", color:"#1B2D5B", margin:"0 0 16px", display:"flex", alignItems:"center", gap:"10px" };
  const p = { color:"#42515e", fontSize:"16px", lineHeight:"1.8", margin:"0 0 16px" };
  const card = { background:"white", border:"1px solid #e5e7eb", borderRadius:"16px", padding:"28px", marginBottom:"16px" };
  const badge = (color) => ({ display:"inline-block", background:color+"15", color:color, padding:"4px 12px", borderRadius:"999px", fontSize:"13px", fontWeight:"700", border:`1px solid ${color}40` });

  return (
    <PublicShell>
    <div style={s}>

      <div style={{ background:"linear-gradient(135deg,#1B2D5B 0%,#0a2e1f 100%)", color:"white", padding:"80px 24px", textAlign:"center" }}>
        <div style={{ fontSize:"64px", marginBottom:"20px" }}>🔒</div>
        <h1 style={{ fontSize:"clamp(28px,5vw,44px)", fontWeight:"800", margin:"0 0 16px" }}>Segurança e Privacidade</h1>
        <p style={{ color:"rgba(255,255,255,0.7)", fontSize:"18px", maxWidth:"560px", margin:"0 auto", lineHeight:"1.7" }}>
          Seus dados clínicos e os de seus pacientes são protegidos com padrões de segurança utilizados por sistemas de saúde.
        </p>
        <div style={{ display:"flex", gap:"12px", justifyContent:"center", flexWrap:"wrap", marginTop:"32px" }}>
          {["AES-256-GCM","LGPD","HTTPS/TLS","Cloudflare D1"].map(t => (
            <span key={t} style={{ background:"rgba(255,255,255,0.1)", padding:"8px 20px", borderRadius:"999px", fontSize:"14px", fontWeight:"600", border:"1px solid rgba(255,255,255,0.2)" }}>{t}</span>
          ))}
        </div>
      </div>

      <div style={{ background:"#f9fafb", padding:"64px 0" }}>
        <div style={section}>

          <div style={card}>
            <h2 style={h2}><Lock size={22} color="#C76B4A" /> Criptografia de ponta a ponta</h2>
            <p style={p}>Todos os dados sensíveis dos pacientes — nome, diagnóstico, evolução, medicamentos, observações clínicas e notas de sessão — são criptografados com <strong>AES-256-GCM</strong> antes de serem gravados no banco de dados.</p>
            <p style={p}>Isso significa que mesmo que alguém tivesse acesso direto ao banco de dados, veria apenas dados ilegíveis. A chave de descriptografia fica armazenada separadamente e nunca é exposta.</p>
            <div style={{ display:"flex", gap:"10px", flexWrap:"wrap" }}>
              <span style={badge("#C76B4A")}>✓ AES-256-GCM</span>
              <span style={badge("#2563eb")}>✓ IV único por registro</span>
              <span style={badge("#7c3aed")}>✓ Auth tag de integridade</span>
            </div>
          </div>

          <div style={card}>
            <h2 style={h2}><Eye size={22} color="#2563eb" /> O que a equipe CAA Neuro acessa</h2>
            <p style={p}><strong>Não temos acesso rotineiro aos dados dos seus pacientes.</strong> O banco de dados armazena os registros criptografados — sem a chave, são ilegíveis.</p>
            <p style={p}>Em situações excepcionais (suporte técnico, recuperação de dados após solicitação sua), qualquer acesso requer:</p>
            <ul style={{ color:"#42515e", fontSize:"16px", lineHeight:"2", paddingLeft:"24px", margin:"0 0 16px" }}>
              <li>Abertura formal de requerimento com <strong>motivo detalhado</strong></li>
              <li>Registro automático de <strong>data, hora e responsável</strong></li>
              <li>O requerimento fica <strong>visível para você</strong> no painel de segurança da sua conta</li>
              <li>Você pode contestar qualquer acesso que não reconheça</li>
            </ul>
            <div style={{ background:"#eff6ff", border:"1px solid #bfdbfe", borderRadius:"10px", padding:"16px" }}>
              <strong style={{ color:"#1d4ed8", fontSize:"14px" }}>📋 Trilha de auditoria completa:</strong>
              <p style={{ color:"#1e40af", fontSize:"14px", margin:"6px 0 0", lineHeight:"1.6" }}>Todo acesso admin é registrado e você pode consultá-lo a qualquer momento em Conta → Segurança.</p>
            </div>
          </div>

          <div style={card}>
            <h2 style={h2}><Server size={22} color="#7c3aed" /> Infraestrutura e backups</h2>
            <p style={p}>A plataforma opera sobre infraestrutura de nível enterprise:</p>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))", gap:"14px", margin:"0 0 16px" }}>
              {[
                ["Cloudflare D1","Banco de dados com replicação global e criptografia em repouso (AES-256)"],
                ["Vercel Edge","Infraestrutura distribuída globalmente com HTTPS obrigatório"],
                ["Clerk Auth","Autenticação com 2FA disponível, tokens seguros, sem senha armazenada por nós"],
                ["Backups automáticos","Backup diário automático. Em caso de falha, dados são restauráveis pelo admin mediante solicitação"],
              ].map(([title, desc]) => (
                <div key={title} style={{ background:"#f9fafb", borderRadius:"10px", padding:"16px", border:"1px solid #e5e7eb" }}>
                  <div style={{ fontWeight:"700", fontSize:"14px", color:"#1B2D5B", marginBottom:"6px" }}>{title}</div>
                  <div style={{ fontSize:"13px", color:"#6b7280", lineHeight:"1.6" }}>{desc}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={card}>
            <h2 style={h2}><FileText size={22} color="#dc2626" /> LGPD — Lei Geral de Proteção de Dados</h2>
            <p style={p}>O CAA Neuro opera em conformidade com a <strong>Lei nº 13.709/2018 (LGPD)</strong>. Toda ação relevante sobre dados é registrada em log de auditoria com identificação do usuário, data e tipo de operação.</p>
            <p style={p}>Seus direitos como titular dos dados:</p>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))", gap:"10px" }}>
              {["Acesso aos seus dados","Correção de informações","Exclusão a qualquer momento","Portabilidade (exportação)","Revogar consentimento","Ver quem acessou"].map(d => (
                <div key={d} style={{ display:"flex", alignItems:"center", gap:"8px", fontSize:"14px", color:"#374151" }}>
                  <CheckCircle size={16} color="#C76B4A" /> {d}
                </div>
              ))}
            </div>
          </div>

          <div style={card}>
            <h2 style={h2}><AlertTriangle size={22} color="#d97706" /> Recuperação de dados</h2>
            <p style={p}>Se um profissional perder acesso à conta ou precisar de restauração de dados, o processo é:</p>
            <ol style={{ color:"#42515e", fontSize:"16px", lineHeight:"2.2", paddingLeft:"24px", margin:0 }}>
              <li>Profissional abre solicitação pelo suporte</li>
              <li>Admin verifica identidade e abre requerimento formal</li>
              <li>Acesso é registrado com data, hora e motivo</li>
              <li>Backup é restaurado para a conta do profissional</li>
              <li>Toda a operação fica registrada no log de auditoria</li>
            </ol>
          </div>

          <div style={{ background:"#1B2D5B", borderRadius:"20px", padding:"40px", textAlign:"center", color:"white" }}>
            <ShieldCheck size={40} color="#E8B4A8" style={{ margin:"0 auto 16px", display:"block" }} />
            <h2 style={{ fontSize:"22px", fontWeight:"800", margin:"0 0 12px" }}>Dúvidas sobre segurança?</h2>
            <p style={{ color:"rgba(255,255,255,0.7)", margin:"0 0 24px", lineHeight:"1.7" }}>
              Para apresentações institucionais, prefeituras ou clínicas que precisem de documentação técnica de segurança, entre em contato.
            </p>
            <Link href="/suporte" style={{ background:"#C76B4A", color:"white", padding:"13px 32px", borderRadius:"10px", textDecoration:"none", fontSize:"15px", fontWeight:"700", display:"inline-block" }}>
              Falar com a equipe
            </Link>
          </div>

        </div>
      </div>

      
    </div>
    </PublicShell>
  );
}
