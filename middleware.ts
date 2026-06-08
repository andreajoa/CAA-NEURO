import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Rotas completamente públicas — sem autenticação
const isPublic = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/como-funciona(.*)",
  "/para-quem(.*)",
  "/beneficios(.*)",
  "/depoimentos(.*)",
  "/duvidas(.*)",
  "/planos(.*)",
  "/privacidade(.*)",
  "/termos(.*)",
  "/seguranca(.*)",
  "/recursos(.*)",
  "/institucional(.*)",
  "/api/webhook(.*)",
  "/api/cards(.*)",
]);

// Arquivos estáticos — nunca autenticar
const isStatic = createRouteMatcher([
  "/manifest.json",
  "/sw.js",
  "/favicon(.*)",
  "/icon-(.*)\\.png",
  "/cards/(.*)",
  "/hero-(.*)",
  "/_next/static/(.*)",
  "/_next/image(.*)",
]);

export default clerkMiddleware((auth, req) => {
  // Estáticos e públicos passam direto
  if (isStatic(req) || isPublic(req)) return;
  // Todo o resto exige autenticação
  auth().protect();
});

export const config = {
  matcher: [
    // Ignora arquivos next internos e estáticos do sistema
    "/((?!_next/static|_next/image|favicon\\.ico).*)",
    "/(api|trpc)(.*)",
  ],
};
