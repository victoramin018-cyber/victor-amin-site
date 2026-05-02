# victor-amin-site

Landing oficial Victor Amin · Método Alta Performance

## Estrutura

```
victor-amin-site/
├── public/
│   ├── index.html         ← landing
│   └── cases_final/       ← fotos antes/depois
├── api/                   ← Vercel Functions (Sprint 2)
├── package.json
├── vercel.json
└── CLAUDE.md              ← briefing dev
```

## Setup local

```bash
npm install -g vercel
vercel login
vercel dev
```

Acessa em `http://localhost:3000`.

## Deploy

```bash
vercel deploy --prod
```

Auto-deploy do `main` configurado pelo Vercel quando conectar GitHub.

## Sprints

- [x] Sprint 1 · deploy estático (em andamento)
- [ ] Sprint 2 · Form + Pixel CAPI
- [ ] Sprint 3 · SEO + OG + Schema + LGPD
- [ ] Sprint 4 · A11y WCAG 2.1 AA
- [ ] Sprint 5 · Performance >90 Lighthouse
- [ ] Sprint 6 (opcional) · Migração Next.js

Ver `CLAUDE.md` pra contexto completo.
