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

## ⏳ Pendente Sprint 1 (user action)
- [ ] **DNS Namecheap** — apagar 3 records Framer + adicionar 2 records Vercel:
  - `A     @     76.76.21.21`
  - `CNAME www   cname.vercel-dns.com`
- [ ] Aguardar propagação (5-30min Namecheap BasicDNS)
- [ ] Vercel emite SSL automático após DNS resolver
- [ ] Validar: `https://www.victoramin.com` carrega · `https://victoramin.com` redireciona 301
- [ ] Adicionar `www.victoramin.com` em Meta BM → Domains (verificação TXT)
- [ ] Conectar GitHub repo ao projeto Vercel (auto-deploy on push) — Settings → Git no dashboard

## Sprint 2 (próximo) · Form + Pixel CAPI
- [ ] `/api/lead` Vercel Function (zod + Kommo + CAPI)
- [ ] Form thank-you redirect → `instagram.com/victoraminn/`
- [ ] Honeypot + rate limit (Vercel KV)
- [ ] Hash PII (sha256 lowercase) antes de mandar pra CAPI

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
