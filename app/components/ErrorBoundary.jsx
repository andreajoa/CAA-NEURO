"use client";
import { Component } from "react";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    fetch("/api/errors", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: error?.message,
        stack: error?.stack,
        page: typeof window !== "undefined" ? window.location.pathname : "unknown",
        context: info?.componentStack?.slice(0, 300),
      }),
    }).catch(() => {});
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"system-ui,sans-serif", background:"#f9fafb" }}>
          <div style={{ background:"white", borderRadius:"20px", border:"1px solid #e5e7eb", padding:"48px", maxWidth:"480px", textAlign:"center" }}>
            <div style={{ fontSize:"52px", marginBottom:"16px" }}>⚠️</div>
            <h2 style={{ fontSize:"22px", fontWeight:"800", color:"#071b2c", margin:"0 0 12px" }}>Algo deu errado</h2>
            <p style={{ color:"#6b7280", fontSize:"15px", margin:"0 0 28px", lineHeight:"1.7" }}>
              O erro foi registrado automaticamente. Tente recarregar a página.
            </p>
            <button onClick={() => window.location.reload()}
              style={{ background:"#00885f", color:"white", border:"none", padding:"13px 32px", borderRadius:"10px", fontSize:"15px", fontWeight:"700", cursor:"pointer" }}>
              Recarregar página
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
