#!/usr/bin/env node
/**
 * Setup Kommo custom fields para qualificação estruturada.
 *
 * Uso:
 *   KOMMO_LONG_LIVED_TOKEN=eyJ... node tools/setup_kommo_fields.mjs
 *   KOMMO_LONG_LIVED_TOKEN=eyJ... KOMMO_SUBDOMAIN=victoramin018 node tools/setup_kommo_fields.mjs --list
 *
 * Comportamento:
 *  - Lista custom fields existentes em Leads
 *  - Para cada campo desejado: se já existe (match por nome), reusa o ID;
 *    se não existe, cria com tipo + enum options corretos
 *  - Imprime IDs finais no formato pronto pra Vercel env (KOMMO_CF_*_ID=12345)
 *
 * IMPORTANTE: enum strings espelham EXATAMENTE schema.ts. Se mudar lá, rerode aqui
 * (ou o lead.create vai falhar com "value not in enum" no Kommo).
 */

const TOKEN = process.env.KOMMO_LONG_LIVED_TOKEN;
const SUBDOMAIN = process.env.KOMMO_SUBDOMAIN || "victoramin018";
const LIST_ONLY = process.argv.includes("--list");
const DRY = process.argv.includes("--dry-run");

if (!TOKEN) {
  console.error("✗ KOMMO_LONG_LIVED_TOKEN ausente no env. Aborta.");
  console.error("  Pega o token: vercel env pull .env.local && cat .env.local");
  process.exit(1);
}

const BASE = `https://${SUBDOMAIN}.kommo.com/api/v4`;
const HEADERS = {
  Authorization: `Bearer ${TOKEN}`,
  "Content-Type": "application/json",
};

// Espelhado de lib/schema.ts — qualquer drift quebra a integração.
const OBJETIVO = [
  "Estética e composição corporal",
  "Postura e dor crônica",
  "Performance esportiva",
  "Preparação para palco (fisiculturismo)",
  "Saúde e qualidade de vida",
  "Mais de um objetivo combinado",
];
const EXPERIENCIA = [
  "Nunca treinei sério",
  "Menos de 1 ano",
  "1 a 3 anos",
  "3 a 5 anos",
  "Mais de 5 anos",
];
const INVESTIMENTO = [
  "Até R$ 200",
  "R$ 200 a R$ 500",
  "R$ 500 a R$ 1.500",
  "R$ 1.500 a R$ 3.000",
  "Acima de R$ 3.000",
];
const URGENCIA = [
  "Esta semana",
  "Nas próximas 2 semanas",
  "No próximo mês",
  "Estou pesquisando · sem urgência",
];

// Definição dos 7 fields. envKey alinha com KOMMO_CF_*_ID em lib/kommo.ts.
const FIELDS = [
  {
    envKey: "KOMMO_CF_IDADE_ID",
    name: "Idade (site)",
    type: "numeric",
  },
  {
    envKey: "KOMMO_CF_OBJETIVO_ID",
    name: "Objetivo principal (site)",
    type: "select",
    enums: OBJETIVO,
  },
  {
    envKey: "KOMMO_CF_EXPERIENCIA_ID",
    name: "Tempo treinando (site)",
    type: "select",
    enums: EXPERIENCIA,
  },
  {
    envKey: "KOMMO_CF_INVESTIMENTO_ID",
    name: "Faixa de investimento mensal (site)",
    type: "select",
    enums: INVESTIMENTO,
  },
  {
    envKey: "KOMMO_CF_URGENCIA_ID",
    name: "Quando quer começar (site)",
    type: "select",
    enums: URGENCIA,
  },
  {
    envKey: "KOMMO_CF_RESTRICAO_ID",
    name: "Restrição médica (site)",
    type: "textarea",
  },
  {
    envKey: "KOMMO_CF_MOTIVO_ID",
    name: "Motivo da aplicação (site)",
    type: "textarea",
  },
];

async function listExisting() {
  // Paginate (Kommo retorna até 250 por page; nosso caso < 50, mas seguro)
  const fields = [];
  let page = 1;
  while (true) {
    const res = await fetch(
      `${BASE}/leads/custom_fields?page=${page}&limit=250`,
      { headers: HEADERS },
    );
    if (res.status === 204) break;
    if (!res.ok) {
      const txt = await res.text();
      throw new Error(`GET custom_fields falhou ${res.status}: ${txt}`);
    }
    const json = await res.json();
    const batch = json?._embedded?.custom_fields ?? [];
    fields.push(...batch);
    if (batch.length < 250) break;
    page += 1;
  }
  return fields;
}

async function createField(def, sortBase) {
  const payload = {
    name: def.name,
    type: def.type,
    sort: sortBase,
  };
  if (def.enums) {
    payload.enums = def.enums.map((value, i) => ({ value, sort: i + 1 }));
  }
  if (DRY) {
    console.log(`  [dry-run] POST custom_fields: ${JSON.stringify(payload)}`);
    return { id: 0, ...payload };
  }
  const res = await fetch(`${BASE}/leads/custom_fields`, {
    method: "POST",
    headers: HEADERS,
    body: JSON.stringify([payload]),
  });
  const txt = await res.text();
  if (!res.ok) {
    throw new Error(`POST custom_fields falhou ${res.status}: ${txt}`);
  }
  const json = JSON.parse(txt);
  const created = json?._embedded?.custom_fields?.[0];
  if (!created?.id) {
    throw new Error(`Resposta inesperada: ${txt}`);
  }
  return created;
}

async function main() {
  console.log(`→ Conectando a https://${SUBDOMAIN}.kommo.com/api/v4`);
  const existing = await listExisting();
  console.log(`  ${existing.length} custom fields existentes em Leads`);

  if (LIST_ONLY) {
    console.log("\n📋 CAMPOS EXISTENTES:");
    for (const f of existing) {
      const enums = f.enums
        ? ` [${f.enums.length} opções]`
        : "";
      console.log(`  · #${f.id}  ${f.name}  (${f.type})${enums}`);
    }
    return;
  }

  const byName = new Map(existing.map((f) => [f.name.toLowerCase(), f]));
  const results = [];

  let sortBase = 500;
  for (const def of FIELDS) {
    const hit = byName.get(def.name.toLowerCase());
    if (hit) {
      console.log(`✓ Reusando #${hit.id}  "${def.name}"  (${hit.type})`);
      results.push({ envKey: def.envKey, id: hit.id, reused: true });
    } else {
      console.log(`+ Criando "${def.name}" (${def.type})…`);
      try {
        const created = await createField(def, sortBase);
        console.log(`  → ID #${created.id}`);
        results.push({ envKey: def.envKey, id: created.id, reused: false });
      } catch (err) {
        console.error(`  ✗ Falhou: ${err.message}`);
        results.push({ envKey: def.envKey, id: null, error: err.message });
      }
    }
    sortBase += 10;
  }

  console.log("\n========================================");
  console.log("📋 ENV VARS PRA COLAR NO VERCEL:");
  console.log("========================================\n");
  for (const r of results) {
    if (r.id) {
      console.log(`${r.envKey}=${r.id}`);
    } else {
      console.log(`# ${r.envKey} — FALHOU: ${r.error}`);
    }
  }
  console.log("\n→ Adicione cada uma com: vercel env add <NAME> production");
  console.log("→ Após adicionar todas, rode: vercel --prod (redeploy pra carregar envs)");
  console.log("\n→ Ou use o painel: https://vercel.com/victoramin018-cybers-projects/victor-amin-site/settings/environment-variables");

  const failed = results.filter((r) => !r.id);
  if (failed.length > 0) {
    console.error(`\n⚠ ${failed.length} campo(s) falharam — review acima`);
    process.exit(2);
  }
}

main().catch((err) => {
  console.error("\n✗ FATAL:", err.message);
  process.exit(1);
});
