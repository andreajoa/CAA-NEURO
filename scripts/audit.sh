#!/bin/bash
echo ""
echo "========================================"
echo "  CAA NEURO — AUDITORIA DO PROJETO"
echo "========================================"
echo ""

check() {
  local label="$1"; local cmd="$2"
  if eval "$cmd" &>/dev/null; then
    echo "  ✅  $label"
  else
    echo "  ❌  $label"
  fi
}

info() {
  local label="$1"; local val="$2"
  echo "  ℹ️   $label: $val"
}

echo "── FASE 1 · PERSISTÊNCIA E INFRAESTRUTURA ──────────"
check "D1 binding configurado" "grep -q 'D1_DATABASE\|d1Databases' wrangler.toml 2>/dev/null || grep -rq 'D1_DATABASE' .env.local"
check "API /api/patients existe" "[ -f app/api/patients/route.js ] || [ -f app/api/patients/route.ts ]"
check "API /api/cards existe" "[ -f app/api/cards/route.js ] || [ -f app/api/cards/route.ts ]"
check "API /api/sessions existe" "[ -f app/api/sessions/route.js ] || [ -f app/api/sessions/route.ts ]"
check "API /api/images/upload existe" "[ -f 'app/api/images/upload/route.js' ] || [ -f 'app/api/images/upload/route.ts' ]"
check "API /api/backup existe" "[ -f app/api/backup/route.js ] || [ -f app/api/backup/route.ts ]"
check "API /api/backup-auto existe" "[ -f app/api/backup-auto/route.js ] || [ -f app/api/backup-auto/route.ts ]"
check "API /api/restore existe" "[ -f app/api/restore/route.js ] || [ -f app/api/restore/route.ts ]"
check "API /api/logs existe" "[ -f app/api/logs/route.js ] || [ -f app/api/logs/route.ts ]"
check "logError.js existe" "[ -f lib/logError.js ]"
check "sendAlertEmail.js existe" "[ -f lib/sendAlertEmail.js ]"
check "RESEND_API_KEY configurado" "grep -q 'RESEND_API_KEY=re_' .env.local"
check "Clerk configurado" "grep -q 'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY' .env.local"
check "R2 configurado (bucket)" "grep -q 'R2_BUCKET\|CLOUDFLARE_R2' .env.local || grep -q 'r2_buckets' wrangler.toml 2>/dev/null"
check "stress-auth-test.js existe" "[ -f scripts/stress-auth-test.js ]"
check "Zero localStorage (verificar manualmente)" "! grep -rq 'localStorage' app/ 2>/dev/null || true"
info "localStorage encontrado em" "$(grep -rl 'localStorage' app/ 2>/dev/null | wc -l | tr -d ' ') arquivo(s)"

echo ""
echo "── FASE 2 · PRONTUÁRIO ──────────────────────────────"
check "Campos de paciente no schema (diagnóstico)" "grep -rq 'diagnostico\|diagnosis' app/api/patients/ lib/ 2>/dev/null"
check "Campo responsável no schema" "grep -rq 'responsavel\|responsible\|guardian' app/api/patients/ lib/ 2>/dev/null"
check "Campo escola no schema" "grep -rq 'escola\|school' app/api/patients/ lib/ 2>/dev/null"
check "Campo medicamentos" "grep -rq 'medicamento\|medication' app/api/patients/ lib/ 2>/dev/null"
check "Campo objetivos terapêuticos" "grep -rq 'objetivo\|objective\|goal' app/api/sessions/ app/api/patients/ lib/ 2>/dev/null"
check "Sessões com cards_usados" "grep -rq 'cards_usados\|cards_used\|cardsUsed' app/api/sessions/ lib/ 2>/dev/null"
check "Sessões com evolução observada" "grep -rq 'evolucao\|evolution\|observation' app/api/sessions/ lib/ 2>/dev/null"

echo ""
echo "── FASE 3 · INTELIGÊNCIA ────────────────────────────"
check "Endpoint de analytics/IA existe" "[ -f app/api/analytics/route.js ] || [ -f app/api/analytics/route.ts ] || [ -f app/api/insights/route.js ]"
check "Sugestão automática de cards" "grep -rq 'suggest\|sugest' app/ lib/ 2>/dev/null"

echo ""
echo "── FASE 4 · INSTITUCIONAL ───────────────────────────"
check "API /api/admin-stats existe" "[ -f app/api/admin-stats/route.js ] || [ -f app/api/admin-stats/route.ts ]"
check "Página /admin existe" "[ -f 'app/admin/page.js' ] || [ -f 'app/admin/page.tsx' ]"
check "Campo de organização/instituição" "grep -rq 'organizacao\|institution\|org_id\|orgId' app/api/ lib/ 2>/dev/null"

echo ""
echo "── FASE 5 · RELATÓRIOS PDF ──────────────────────────"
check "Geração de PDF (lib/pdf ou api/report)" "[ -f lib/generatePDF.js ] || [ -f lib/generatePDF.ts ] || [ -f app/api/report/route.js ] || [ -f app/api/report/route.ts ]"
check "Dependência de PDF no package.json" "grep -q 'puppeteer\|jspdf\|pdfkit\|pdf-lib\|@react-pdf' package.json"

echo ""
echo "── FASE 6 · LGPD ────────────────────────────────────"
check "Página de política de privacidade" "[ -f 'app/privacidade/page.js' ] || [ -f 'app/privacidade/page.tsx' ] || [ -f 'app/privacy/page.tsx' ]"
check "Página de termos de uso" "[ -f 'app/termos/page.js' ] || [ -f 'app/termos/page.tsx' ] || [ -f 'app/terms/page.tsx' ]"
check "Logs de acesso (auditoria)" "grep -rq 'audit\|audit_log\|access_log' app/api/ lib/ 2>/dev/null"
check "Controle de criptografia" "grep -rq 'encrypt\|crypto\|bcrypt' lib/ app/api/ 2>/dev/null"
check "Consentimento LGPD no signup" "grep -rq 'consent\|consentimento\|lgpd' app/ 2>/dev/null"

echo ""
echo "── FASE 7 · OFFLINE ─────────────────────────────────"
check "Service Worker / PWA" "[ -f public/sw.js ] || [ -f public/service-worker.js ] || grep -q 'next-pwa\|workbox' package.json"
check "Manifest PWA" "[ -f public/manifest.json ] || [ -f app/manifest.js ] || [ -f app/manifest.ts ]"

echo ""
echo "── FASE 8 · BIBLIOTECA ──────────────────────────────"
info "Cards no banco (contagem approx)" "$(grep -r 'INSERT INTO cards\|seed' scripts/ db/ 2>/dev/null | wc -l | tr -d ' ') inserts encontrados em scripts"
check "Script de seed de cards existe" "[ -f scripts/seed.js ] || [ -f scripts/seed-cards.js ] || [ -f db/seed.js ]"

echo ""
echo "── FASE 9 · TREINAMENTO ─────────────────────────────"
check "Página de tutorial/onboarding" "[ -f 'app/tutorial/page.tsx' ] || [ -f 'app/onboarding/page.tsx' ] || [ -f 'app/como-funciona/page.tsx' ]"

echo ""
echo "── FASE 10 · PROVA SOCIAL ───────────────────────────"
check "Página de depoimentos" "[ -f 'app/depoimentos/page.tsx' ] || [ -f 'app/depoimentos/page.js' ]"
check "Casos clínicos documentados" "[ -d docs/cases ] || [ -f docs/casos-clinicos.md ]"

echo ""
echo "── INFRA GERAL ──────────────────────────────────────"
check "wrangler.toml existe" "[ -f wrangler.toml ]"
check "Build ok (último)" "[ -d .next ]"
info "Último commit" "$(git log -1 --format='%h %s' 2>/dev/null)"
info "Branch atual" "$(git branch --show-current 2>/dev/null)"
info "Arquivos modificados" "$(git status --short 2>/dev/null | wc -l | tr -d ' ') arquivo(s)"
info "Total de rotas de API" "$(find app/api -name 'route.*' 2>/dev/null | wc -l | tr -d ' ') rotas"
info "localStorage em app/" "$(grep -rl 'localStorage' app/ 2>/dev/null | tr '\n' ' ')"

echo ""
echo "========================================"
echo "  FIM DA AUDITORIA"
echo "========================================"
echo ""
