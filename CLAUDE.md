PROJETO: SITE www.victoramin.com · LANDING + FORMS

Você é o dev senior responsável por colocar e manter o site da operação no ar. Site existe (index.html pronto), precisa de deploy + integrações + iteração contínua.

═══════════════════════════════════════
1. ASSET ATUAL (PARTIDA)
═══════════════════════════════════════

ARQUIVO PRINCIPAL
D:\VICTOR PC\AGENCIA\VIDEOS_VICTOR\VIDEOS PRONTOS\THEIGOR\2026\MATERIAL VICTOR\VA TEAM COPY\index.html

ESTADO
• Single-file HTML/CSS/JS (~514 linhas, ~39KB)
• 13 seções: Nav, Hero (antes/depois Victor), Autoridade, Tese (Postura primeiro), Cases (8 alunos), Método, Ofertas, Atletas, Conquistas, FAQ, Formulário (10 perguntas), Closing, Footer
• Slider CSS+JS auto-play por aluno (4 cases com slider · 4 com composto)
• Pixel Meta hardcoded `465701309646610` no <head>
• Form atual: action="https://wa.me/5511978739319?text=..." (URL encoded)
• Paleta travada: #0A0A0A / #FFCC00 / #F5F4F0
• Tipografia: Anton (display) · Inter (corpo) · JetBrains Mono (mono)
• Cases finais em pasta `cases_final/` (case_01.jpg ... case_07.jpg)

PROJETO LOCAL DO SITE (CRIAR)
D:\VICTOR PC\dev\victor-amin-site\
├── public/index.html       ← copiar daqui
├── public/cases_final/     ← copiar imagens
├── public/og-image.jpg     ← gerar (1200×630)
├── public/privacidade.html ← LGPD
├── api/                    ← Vercel Functions
│   ├── lead.ts             ← form → Kommo + Pixel CAPI
│   └── pixel-capi.ts       ← server-side Pixel events
├── package.json
├── vercel.json
├── .env.example
├── README.md
└── PROGRESSO.md

═══════════════════════════════════════
2. DECISÕES TRAVADAS
═══════════════════════════════════════

DOMÍNIO
• Canônico: www.victoramin.com (raiz 301 → www)
• Comprado via Framer · DNS gerenciado lá inicialmente
• Migração planejada: apontar A/CNAME pro Vercel mantendo registro no Framer

THANK-YOU PÓS-FORM
• Redirect: https://www.instagram.com/victoraminn/

VIMEO
• Vídeo 981698994 fica FORA da v1 (sem whitelist do domínio ainda · simplifica)

LGPD MÍNIMA v1
• Checkbox "Aceito tratamento dos dados conforme política"
• Link "Política de Privacidade" no footer → /privacidade.html (criar)

LOGO
• Desktop: va_full.png (logo completa)
• Mobile: va_symbol.png (só símbolo)
• Caminho exato dos arquivos: pendente confirmação Victor

OG IMAGE
• 1200×630 · paleta travada · "Método Alta Performance · Postura primeiro"
• Gerar via design (eu crio na sprint 3)

PIXEL CAPI DEDUP
• event_id UUID v4 client-side · propagado pro server
• Mesmo evento client + server com mesmo event_id = 1 evento contado

KOMMO
• Lead criado tem responsável "Victor" inicialmente
• Tag automática `[ORIGEM-SITE]`
• Custom fields a verificar via API quando agente subir
• Roteamento manual no Kommo até SDR definido

═══════════════════════════════════════
3. CONTEXTO DO NEGÓCIO
═══════════════════════════════════════

OPERAÇÃO
• Personal trainer alto padrão SP · Método Alta Performance
• 2 produtos: Personal Presencial (R$1.200-3.000/mês · 6m · SP Zona Oeste/Sul) · Consultoria Online (R$150-200/mês · Brasil)
• Tese: postura primeiro, estética como consequência
• Volume alvo <5 leads/dia · alto ticket

OBJETIVO DO SITE
• Captar leads qualificados pra call do Victor
• Form de 10 perguntas qualifica antes de chegar no SDR
• Resposta WhatsApp em <5min (SLA travado)
• ROAS Online >2 · ROAS Personal >3 · CTR criativos pra cá >2%

PROVA SOCIAL CANÔNICA (não inventar)
6 alunos: Fabricio · Larissa (87→73kg em 3m) · Davi · Victoria Queiroz · Ulizel · Victor Balota
2 atletas nominados: Arthur Manicoba (classic physique pódio nacional) · Vinícius Campos (natural · 2 TOP1 + 1 Overall na 1ª)

═══════════════════════════════════════
4. STACK TRAVADA
═══════════════════════════════════════

DEPLOY
• Vercel (hosting + CDN + functions)
• GitHub repo `victor-amin-site` (auto-deploy main branch)
• Domínio raiz: www.victoramin.com (CNAME na zona DNS)
• Preview deploys em cada PR

RUNTIME
• Sprint 1-3: HTML estático puro (sem framework)
• Sprint 4+: avaliar migrar pra Next.js 15 SE houver justificativa (Server Components, ISR)
• Vercel Functions (Node 20) pra:
  - POST /api/lead (form submit · valida, envia pra Kommo, dispara Pixel CAPI)
  - POST /api/pixel-capi (espelha eventos client-side server-side · privacy + iOS 14.5+)

INTEGRAÇÕES
• Pixel Meta `465701309646610` (client + server CAPI)
• Kommo CRM webhook `https://victoramin018.kommo.com/api/v4/leads/...`
• WhatsApp `wa.me/5511978739319` (link · sem API ainda)
• Resend (email confirmação opcional v2)

ANALYTICS
• Pixel Meta (já)
• Vercel Analytics (Web Vitals · gratuito até 10k events/mês)
• Sem Google Analytics (privacidade · LGPD overhead)

═══════════════════════════════════════
5. IDENTIDADE VISUAL (TRAVADA · NÃO MEXER)
═══════════════════════════════════════

DESIGN TOKENS
| Token | Valor | Uso |
|-------|-------|-----|
| --bg | #0A0A0A | Fundo absoluto |
| --accent | #FFCC00 | CTAs, hovers, highlights, logo |
| --text | #F5F4F0 | Texto corpo |
| --muted | #1A1A1A | Cards, sections alternadas |
| --border | #2A2A2A | Separadores, borders |
| --subtle | #8A8680 | Texto secundário |

TIPOGRAFIA
| Token | Família | Peso | Uso |
|-------|---------|------|-----|
| --font-display | Anton | 400 | H1, H2, hero |
| --font-body | Inter | 400-700 | Corpo, UI, parágrafos |
| --font-mono | JetBrains Mono | 400-500 | Números, IDs, dados |

ESPACAMENTO
Sistema 8px: --space-1=8 · --space-2=16 · --space-3=24 · --space-4=32 · --space-6=48 · --space-8=64 · --space-12=96 · --space-16=128

BREAKPOINTS
| BP | Width | Ajustes |
|----|-------|---------|
| Mobile | <768px | Single column, stack tudo, hero menor |
| Tablet | 768-1023px | Grid 2 col em cases, nav hambúrguer |
| Desktop | ≥1024px | Layout default |

PALAVRAS PROIBIDAS (filtro travado em qualquer copy)
incrível · revolucionário · transformador · simplesmente · basicamente · jornada (em CTA) · mindset · vibe · energia (motivacional) · propósito · despertar · desbloquear · potencializar · expert · ninja · fera · monstro · brabo · insano

═══════════════════════════════════════
6. SPRINTS (em ordem)
═══════════════════════════════════════

SPRINT 1 · DEPLOY ESTÁTICO (1-2 dias)
• [ ] Inicializar repo `victor-amin-site` no GitHub
• [ ] Copiar index.html + cases_final/ pra /public
• [ ] Criar vercel.json (rewrites, headers, security)
• [ ] Conectar GitHub ao Vercel · auto-deploy main
• [ ] Configurar domain www.victoramin.com · TXT verificação
• [ ] Apontar A/CNAME no Framer → Vercel
• [ ] Adicionar domínio em Meta BM (Configurações → Domínios)
• [ ] Validar Pixel Helper: evento PageView dispara
• [ ] Verificar HTTPS, redirect HTTP→HTTPS, raiz→www
• Critério aceitação: site no ar, Pixel disparando PageView, Lighthouse Mobile >85

SPRINT 2 · FORM + PIXEL CAPI (2-3 dias)
• [ ] Vercel Function POST /api/lead com validação zod
• [ ] Form action atual (wa.me) vira POST /api/lead → Kommo + Pixel CAPI Lead
• [ ] Após submit OK: redirect 200 → https://www.instagram.com/victoraminn/
• [ ] Honeypot anti-spam · rate limit (Vercel KV · 5 submits/IP/hora)
• [ ] /api/pixel-capi server-side com hashed user data (LGPD)
• [ ] Confirmação visual durante submit (loading state)
• Critério aceitação: form submete, Kommo recebe lead com tag [ORIGEM-SITE] e responsável Victor, Pixel mostra Lead event, redirect Instagram funciona

SPRINT 3 · SEO + OG + SCHEMA + LGPD (1-2 dias)
• [ ] Meta tags: title (60c), description (155c), keywords
• [ ] OG tags (og:title, og:description, og:image, og:url, og:type=website)
• [ ] Twitter Card (summary_large_image)
• [ ] Gerar og-image 1200×630 (paleta travada)
• [ ] Schema.org JSON-LD: Person (Victor) + LocalBusiness + Service
• [ ] Sitemap.xml + robots.txt
• [ ] Canonical URL
• [ ] Alt em TODAS as imagens
• [ ] /privacidade.html (Política de Privacidade LGPD)
• [ ] Checkbox "Aceito tratamento" no form (required)
• [ ] Footer link "Política de Privacidade"
• Critério aceitação: rich snippets aparecem em Google Search Console preview · privacidade compliance LGPD

SPRINT 4 · A11Y WCAG 2.1 AA (1-2 dias)
• [ ] Contraste mínimo 4.5:1 texto / 3:1 UI (auditar paleta)
• [ ] Focus visible em TODOS interativos (keyboard nav)
• [ ] Skip link "Pular pro conteúdo"
• [ ] aria-label em botões só com ícone
• [ ] Form labels associadas (for/id)
• [ ] Error messages anunciadas (aria-live="polite")
• [ ] Slider de fotos: pause on hover, controles teclado, aria-current
• [ ] Touch targets ≥44×44px (WCAG 2.5.5)
• Critério aceitação: axe DevTools score 0 issues · NVDA navegação completa funcional

SPRINT 5 · PERFORMANCE (1-2 dias)
• [ ] Lighthouse Mobile >90 em todas categorias
• [ ] LCP <2.5s · CLS <0.1 · INP <200ms
• [ ] Imagens: WebP + AVIF · srcset + sizes · lazy loading
• [ ] Font loading: font-display swap, preload Anton + Inter weights críticos
• [ ] CSS crítico inline · resto async
• [ ] JS minificado · sem libs desnecessárias
• [ ] Cache headers agressivos pra assets estáticos
• Critério aceitação: PageSpeed Insights Mobile >90 · Core Web Vitals tudo verde

SPRINT 6 (OPCIONAL) · MIGRAÇÃO NEXT.JS
Só rodar se: precisarmos A/B testing, ISR, MDX pra blog, Server Actions complexas.
Caso contrário, manter HTML estático.

═══════════════════════════════════════
7. PROTOCOLO DE TRABALHO
═══════════════════════════════════════

CADA SESSÃO
1. Lê CLAUDE.md (este prompt)
2. Lê PROGRESSO.md (onde parou)
3. Pergunta o que fazer hoje
4. Trabalha 1 sprint de cada vez
5. Testa local (`vercel dev`) antes de commitar
6. Roda Lighthouse local antes de subir
7. Atualiza PROGRESSO.md
8. Emite UPDATE_CEREBRO no fim

NUNCA
• Não usa lib pesada (jQuery, Bootstrap, Material) — vanilla ou Tailwind se migrar
• Não muda paleta · tipografia · copy de prova social sem ok
• Não desativa HTTPS · sem inline event handlers (usa addEventListener)
• Não commita .env

SEMPRE
• Valida payload com zod nas Functions
• Hash dados PII antes de enviar pro Pixel CAPI (sha256 lowercase)
• Headers de segurança: CSP, X-Frame-Options, Permissions-Policy
• Loading state em todo botão que dispara request
• Mobile-first em qualquer mudança CSS

═══════════════════════════════════════
8. ENV VARS (.env.example)
═══════════════════════════════════════

KOMMO_WEBHOOK_URL=https://...
KOMMO_API_TOKEN=...
META_PIXEL_ID=465701309646610
META_PIXEL_ACCESS_TOKEN=...
RESEND_API_KEY=...
VERCEL_KV_REST_API_URL=...
VERCEL_KV_REST_API_TOKEN=...

═══════════════════════════════════════
9. CRITÉRIOS DE ACEITAÇÃO FINAIS
═══════════════════════════════════════

✓ Site no ar em www.victoramin.com (HTTPS · raiz redirect 301 pro www)
✓ Domínio verificado em Meta BM
✓ Pixel disparando PageView · Lead · ViewContent
✓ Pixel CAPI espelhando server-side com event_id matching
✓ Form submete · cria lead em Kommo com tag [ORIGEM-SITE] e responsável Victor · redirect pro Instagram
✓ Política de Privacidade LGPD acessível + checkbox no form
✓ Lighthouse Mobile >90 (Performance, A11y, Best Practices, SEO)
✓ Core Web Vitals tudo verde
✓ axe DevTools 0 issues
✓ NVDA navegação completa funcional
✓ Sitemap.xml indexável

═══════════════════════════════════════
10. PRIMEIRA AÇÃO HOJE
═══════════════════════════════════════

Antes de escrever código, me devolve:

1. CHECKLIST de pré-requisitos (Vercel account, GitHub, Kommo API token, Meta CAPI token)
2. ROADMAP em sprints (estimativa otimista mas realista)
3. PRIMEIRA TAREFA da Sprint 1 (passo a passo: criar repo, copiar arquivos, configurar Vercel, apontar DNS Framer)
4. PERGUNTAS BLOQUEANTES de produto

Depois esperamos minha aprovação e vamos pra Sprint 1.

═══════════════════════════════════════
FIM
═══════════════════════════════════════
