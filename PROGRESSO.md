# PROGRESSO · victor-amin-site

Log datado do que foi shipado. Append-only. Curador `:mem` revisa semanal.

---

## 2026-05-02 · setup inicial pré-deploy
- [x] Criada pasta `D:\VICTOR PC\dev\victor-amin-site\`
- [x] `CLAUDE.md` (briefing completo do projeto)
- [x] `package.json` (engines node 20)
- [x] `vercel.json` (security headers + cache + redirects)
- [x] `.gitignore`
- [x] `README.md`
- [x] `PROGRESSO.md` (este arquivo)

## 2026-05-02 · Sprint 1 deploy estático
- [x] Copiado `index.html` + assets pra `public/` (4MB total)
  - `cases_final/` (7 imagens)
  - `cases_slider/` (4 alunos · 16 imagens)
  - `victor_hero/` (antes/depois)
  - `logo/` (va_full · va_symbol)
  - `conquistas/` (rei jogos · santa portal)
- [x] `git init` + commit inicial + push pro repo `github.com/victoramin018-cyber/victor-amin-site`
- [x] Fix: `vercel.json` headers usando syntax `:path*` (path-to-regexp v6 compatível)
- [x] `npx vercel login --github` (logado como `victoramin018-cyber`)
- [x] Deploy produção: `https://victor-amin-site.vercel.app` (alias) / `victor-amin-site-i1awfmywz-...vercel.app`
- [x] Validação smoke: HTTP 200 · security headers aplicados · Pixel 465701309646610 disparando PageView/ViewContent/Lead
- [x] Domínios adicionados ao projeto Vercel:
  - `www.victoramin.com` (canônico)
  - `victoramin.com` (redireciona 301 pra www)

## ✅ Sprint 1 fechado · 2026-05-02 ~21:07 UTC
- [x] DNS Namecheap configurado (`A @ 76.76.21.21` + `CNAME www cname.vercel-dns.com`)
- [x] Propagação DNS confirmada via 8.8.8.8 em <5min
- [x] SSL Let's Encrypt emitido em 2m30s
- [x] `https://www.victoramin.com` → 200 OK (canônico)
- [x] `https://victoramin.com` → 308 redirect → `www.victoramin.com`
- [x] `http://www.victoramin.com` → 308 redirect → HTTPS
- [x] Security headers servindo: HSTS · X-Frame · X-Content-Type · Referrer-Policy · Permissions-Policy
- [x] Pixel `465701309646610` no DOM disparando `PageView` · `ViewContent` · `Lead`
- [x] Cache-Control immutable 1y nos assets de imagem (case_01: 162KB · 200 OK)
- [x] WhatsApp link `wa.me/5511978739319` no form

### Pendente do user (não bloqueia operação · pode ir após)
- [ ] Adicionar `www.victoramin.com` em Meta BM → Brand Safety → Domains (verificar TXT/meta)
- [ ] Conectar GitHub repo ao projeto Vercel (auto-deploy on push) — Settings → Git no dashboard
- [ ] Rodar Lighthouse Mobile via PSI: https://pagespeed.web.dev/analysis?url=https%3A%2F%2Fwww.victoramin.com (PSI API anônima estourou quota; web UI funciona normal)

## 2026-05-02 · Sprint 2 código entregue (aguarda tokens pra ativar)
- [x] `api/lead.ts` · POST handler com zod, honeypot, dedup event_id, log estruturado
- [x] `lib/schema.ts` · zod schema com 5 enums travados de qualificação
- [x] `lib/hash.ts` · sha256 + normalizers PII (Meta CAPI specs)
- [x] `lib/meta-capi.ts` · Graph API v21.0 com user_data hashed + dedup event_id
- [x] `lib/kommo.ts` · API v4 complex create + tags + custom fields + Note fallback
- [x] Frontend reescrito · honeypot field + UUID v4 + fetch POST + loading + redirect
- [x] Fallback wa.me em qualquer falha do endpoint
- [x] TypeScript strict (tsconfig.json) · typecheck passa zero erros
- [x] Deploy em produção · smoke tests passam (405, 400, 502 com event_id)
- [x] Meta facebook-domain-verification token servindo

### ✅ Sprint 2 ativada · 2026-05-02 ~22:20 UTC
- [x] `META_CAPI_ACCESS_TOKEN` configurado em produção
- [x] `KOMMO_LONG_LIVED_TOKEN` configurado (JWT 1083c · expira 02/05/2027)
- [x] `KOMMO_SUBDOMAIN=victoramin018` configurado
- [x] `KOMMO_PIPELINE_ID=13613815` (Funil de vendas) configurado
- [x] `KOMMO_STATUS_ID=105057087` (Etapa de leads de entrada) configurado
- [x] Integração privada criada no Kommo: `Site Victor Amin · API Lead` (id `482d696d-b62b-4885-8473-3f2a93122ed5`)
- [x] Smoke test V1 → lead `75993840` criado em Kommo (tags ORIGEM-SITE + Consultoria Online + urgência)
- [x] Smoke test V2 → endpoint 200 ok (Kommo dedupliou por mesmo phone)
- [x] Smoke test V3 → endpoint 200 ok (phone novo · pós-fix)
- [x] Bug fix: `extractLeadId` agora suporta resposta array root de `/leads/complex`

### ⏳ Pendente Sprint 2 (manual user)
- [ ] **Confirmar visualmente no Kommo** que o(s) lead(s) `[SITE] TESTE...` aparece(m) no dashboard
- [ ] **Conferir Test Events tab no Meta Events Manager** — eventos `Lead` com event_id devem aparecer (link: https://business.facebook.com/events_manager2/list/pixel/465701309646610/test_events)
- [ ] Apagar leads de teste do Kommo (busca por "[SITE] TESTE")
- [ ] (Opcional) Criar custom fields no Kommo pra qualificação estruturada (idade/objetivo/modalidade/...). Sem isso, payload qualificador vai como Note no lead — funcional mas menos navegável.

## 2026-05-02 · Sprint 3 fechado · SEO + OG + Schema + sitemap + robots
- [x] `<title>` 60c · `<meta description>` 155c · author · robots index,follow
- [x] `<link rel="canonical">` https://www.victoramin.com/
- [x] theme-color #0A0A0A · color-scheme dark · favicon + apple-touch-icon
- [x] Open Graph completo (og:type/url/locale/site_name/title/description/image+w/h/alt)
- [x] Twitter Card summary_large_image
- [x] JSON-LD `@graph`: Person + LocalBusiness + Service Presencial + Service Online (validado parse OK)
- [x] `public/og.jpg` 1200×630 · 60KB · brand colors + Anton "POSTURA PRIMEIRO. ESTÉTICA COMO CONSEQUÊNCIA."
- [x] `public/robots.txt` com Sitemap + AI bots whitelist (GPTBot, ClaudeBot, Perplexity, Google-Extended, CCBot)
- [x] `public/sitemap.xml` com image entry
- [x] Vercel headers: og.jpg cache 1d · sitemap/robots content-type explicito + cache 1h
- [x] `tools/generate_og.py` (PIL + Anton/Inter TTFs) — re-rodável pra atualizar a OG image

### ⏳ Validação manual Sprint 3
- [ ] Facebook Sharing Debugger — testar https://www.victoramin.com aparece com OG: https://developers.facebook.com/tools/debug/
- [ ] Twitter Card Validator: https://cards-dev.twitter.com/validator
- [ ] Google Rich Results Test (JSON-LD): https://search.google.com/test/rich-results?url=https%3A%2F%2Fwww.victoramin.com%2F
- [ ] Submeter sitemap em Google Search Console (https://search.google.com/search-console)

## 2026-05-03 · Sprint 4 + Sprint 5 fechados em conjunto

### Performance
- [x] 29 imagens convertidas pra WebP via `tools/convert_webp.py` (PIL · qualidade 80, max-1600px)
  · 3962KB → 2037KB (economia 49% · ~1.9MB)
- [x] 22 inline backgrounds convertidos pra `data-bg-*` (lazy via IntersectionObserver)
  · supportsWebP detection no client · serve WebP/JPG conforme browser
  · rootMargin 200px (preload smooth)
  · placeholder #1F1F1F enquanto carrega
- [x] Hero `.va-foto` permanece eager (above-fold LCP)
- [x] 4 CSS rules com `image-set()` fallback (hero antes/depois + 2 ::before decorativos)
- [x] `<img>` com width/height explícitos · `decoding="async"` · `loading="lazy"` no footer

### A11Y WCAG 2.1 AA
- [x] Skip link "Pular para o conteúdo" (visível só no foco · gold/black contrast 12:1+)
- [x] `<main id="main">` wrap conteúdo · `<nav aria-label>` · `<a aria-label>` em ícones
- [x] `:focus-visible` outline 2px gold em todos interativos
- [x] `prefers-reduced-motion` respeitado (animations <0.01ms · scroll-auto · slider sem auto-play · fade-up sempre visível)
- [x] Slider acessível: `role="region"` · `aria-roledescription="carrossel"` · bullets com `aria-label "Slide N de M"` · `role="tab"` · `aria-current` sincronizado
- [x] Slider keyboard nav: ←/→ navega · Space pausa · `tabindex=0` no container
- [x] Slider auto-pause em `visibilitychange` (aba inativa não consome bateria)
- [x] FAQ: `aria-expanded` sincronizado com `.open`
- [x] Form labels já estavam associadas (`for/id`) · `aria-live="polite"` no error já existia

### ⏳ Validação manual Sprint 4 + 5
- [ ] Lighthouse Mobile: https://pagespeed.web.dev/analysis?url=https%3A%2F%2Fwww.victoramin.com (alvo: Performance >90 · A11Y >95 · Best Practices 100 · SEO >95)
- [ ] axe DevTools (Chrome extension): rodar na home, alvo 0 issues
- [ ] WAVE: https://wave.webaim.org/report#/https://www.victoramin.com (alvo 0 errors, 0 contrast errors)
- [ ] Manual NVDA/VoiceOver: navegação por Tab + leitura do form e slider

## Pré-requisitos pendentes (user)
- [x] Domínio victoramin.com reativado (Namecheap · ICANN verification OK)
- [x] DNS Type Namecheap BasicDNS ativo
- [x] Conta Vercel logada via GitHub (CLI authed)
- [x] Conta GitHub (github.com/victoramin018-cyber)
- [ ] Kommo long-lived token + IDs de pipeline/stage/custom-fields
- [ ] Meta CAPI access token (Events Manager → Settings)
- [ ] Política de privacidade publicada (LGPD · v2 ok)

## Próximas decisões bloqueantes
- Logo files OK (va_full.png · va_symbol.png · ambos copiados)
- og-image (1200×630) — ainda gerar pra Sprint 3 SEO
- LGPD — checkbox no form na Sprint 2 + URL política footer Sprint 3
