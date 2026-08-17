import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/recursos(.*)",
  "/para-quem(.*)",
  "/beneficios(.*)",
  "/como-funciona(.*)",
  "/depoimentos(.*)",
  "/duvidas(.*)",
  "/planos(.*)",
  "/privacidade(.*)",
  "/seguranca(.*)",
  "/suporte(.*)",
  "/termos(.*)",
  "/api/testimonials",
  "/api/images/search",
  "/api/images/file",
  "/api/health",
  "/api/share",
  "/api/tts",
  "/api/stripe/webhook",
  "/api/backup-auto",
  "/api/clerk/webhook",
  "/api/clerk-webhook",
  "/api/templates(.*)",
  "/api/export-board(.*)",
  "/profissionais(.*)",
  "/prancha/(.*)",
  "/aceitar-convite(.*)",
  "/__clerk(.*)",
]);

// Arquivos estáticos nunca exigem autenticação
const isStatic = createRouteMatcher([
  "/manifest.json",
  "/sw.js",
  "/favicon(.*)",
  "/icon-(.*)",
  "/cards/(.*)",
  "/hero-(.*)",
  "/logo(.*)",
  "/(.*).png",
  "/(.*).jpg",
  "/(.*).svg",
]);

export default clerkMiddleware(async (auth, req) => {
  if (isStatic(req)) return;
  if (!isPublicRoute(req)) await auth.protect();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|__clerk).*)"],
};
