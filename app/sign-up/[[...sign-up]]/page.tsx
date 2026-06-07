"use client";
import { SignUp } from "@clerk/nextjs";
import { useState } from "react";

export default function SignUpPage() {
  const [accepted, setAccepted] = useState(false);

  return (
    <div style={{ minHeight:"100vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", background:"#f9fafb", padding:"16px" }}>
      <div style={{ marginBottom:"16px", width:"100%", maxWidth:"480px", background:"white", borderRadius:"16px", border:"1px solid #e5e7eb", padding:"16px 20px" }}>
        <label style={{ display:"flex", alignItems:"flex-start", gap:"12px", cursor:"pointer" }}>
          <input
            type="checkbox"
            checked={accepted}
            onChange={e => setAccepted(e.target.checked)}
            style={{ marginTop:"2px", width:"18px", height:"18px", accentColor:"#C76B4A", flexShrink:0, cursor:"pointer" }}
          />
          <span style={{ fontSize:"14px", color:"#374151", lineHeight:"1.6" }}>
            Li e aceito os{" "}
            <a href="/termos" target="_blank" rel="noopener noreferrer"
              onClick={e => e.stopPropagation()}
              style={{ color:"#C76B4A", textDecoration:"underline" }}>Termos de Uso</a>
            {" "}e a{" "}
            <a href="/privacidade" target="_blank" rel="noopener noreferrer"
              onClick={e => e.stopPropagation()}
              style={{ color:"#C76B4A", textDecoration:"underline" }}>Política de Privacidade</a>
            , incluindo o tratamento de dados conforme a <strong>LGPD</strong>.
          </span>
        </label>
        {accepted && (
          <p style={{ marginTop:"8px", fontSize:"12px", color:"#C76B4A", fontWeight:"600", paddingLeft:"30px" }}>
            ✓ Termos aceitos — você pode criar sua conta
          </p>
        )}
      </div>

      <div style={{ width:"100%", maxWidth:"480px", opacity: accepted ? 1 : 0.4, pointerEvents: accepted ? "auto" : "none", transition:"opacity 0.2s" }}>
        <SignUp />
      </div>

      {!accepted && (
        <p style={{ marginTop:"12px", fontSize:"12px", color:"#9ca3af", textAlign:"center" }}>
          Marque a caixa acima para liberar o cadastro.
        </p>
      )}
    </div>
  );
}
