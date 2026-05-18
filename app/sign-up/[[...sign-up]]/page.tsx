"use client";
import { SignUp } from "@clerk/nextjs";
import { useState } from "react";

export default function SignUpPage() {
  const [accepted, setAccepted] = useState(false);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="mb-4 w-full max-w-md bg-white rounded-2xl border border-gray-100 p-4">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={accepted}
            onChange={e => setAccepted(e.target.checked)}
            className="mt-0.5 w-4 h-4 accent-blue-600"
          />
          <span className="text-sm text-gray-600 leading-relaxed">
            Li e aceito os{" "}
            <a href="/termos" target="_blank" className="text-blue-600 underline">Termos de Uso</a>
            {" "}e a{" "}
            <a href="/privacidade" target="_blank" className="text-blue-600 underline">Política de Privacidade</a>
            , incluindo o tratamento de dados conforme a <strong>LGPD</strong>.
          </span>
        </label>
      </div>
      <div className={`w-full max-w-md transition-all ${!accepted ? "opacity-40 pointer-events-none select-none" : ""}`}>
        <SignUp />
      </div>
      {!accepted && (
        <p className="mt-3 text-xs text-gray-400">Aceite os termos acima para criar sua conta.</p>
      )}
    </div>
  );
}
