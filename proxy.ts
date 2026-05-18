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
  "/api/health",
]);

export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) await auth.protect();
});

export const config = {
  matcher: ["/((?!_next|.*\\..*).*)"],
};
