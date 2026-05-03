/**
 * Kommo CRM client (https://developers.kommo.com/).
 *
 * Cria um Lead no Kommo via API REST v4 com complex create payload:
 *  - lead com pipeline_id + status_id (se configurados via env)
 *  - contact embedded (nome + telefone + email)
 *  - tags ["ORIGEM-SITE", modalidade, urgencia]
 *  - custom_fields_values com idade, objetivo, experiencia, investimento, etc.
 *
 * Estratégia de fallback graciosa:
 *  - Se KOMMO_LONG_LIVED_TOKEN ausente → log warning, retorna ok=false
 *    (lead vai pra CAPI mesmo assim, usuário recebe sucesso, fica em log pra revisão)
 *  - Se KOMMO_PIPELINE_ID/STATUS_ID ausentes → cria sem (vai pro pipeline default)
 *  - Se custom_fields IDs não configurados → mete tudo como Note no lead
 *    (pior caso ainda funcional · Victor lê a Note no Kommo)
 */
import type { LeadInput } from "./schema.js";

const SUBDOMAIN = process.env.KOMMO_SUBDOMAIN || "victoramin018";
const TOKEN = process.env.KOMMO_LONG_LIVED_TOKEN || "";
const PIPELINE_ID = process.env.KOMMO_PIPELINE_ID
  ? Number(process.env.KOMMO_PIPELINE_ID)
  : undefined;
const STATUS_ID = process.env.KOMMO_STATUS_ID
  ? Number(process.env.KOMMO_STATUS_ID)
  : undefined;

// IDs de custom fields (configurar no Kommo Settings → Lead Fields → ver ID via API).
// Sem esses, payload qualificador vai como Note de fallback.
const CF = {
  idade: numEnv("KOMMO_CF_IDADE_ID"),
  objetivo: numEnv("KOMMO_CF_OBJETIVO_ID"),
  experiencia: numEnv("KOMMO_CF_EXPERIENCIA_ID"),
  investimento: numEnv("KOMMO_CF_INVESTIMENTO_ID"),
  urgencia: numEnv("KOMMO_CF_URGENCIA_ID"),
  restricao: numEnv("KOMMO_CF_RESTRICAO_ID"),
  motivo: numEnv("KOMMO_CF_MOTIVO_ID"),
};

function numEnv(key: string): number | undefined {
  const v = process.env[key];
  return v ? Number(v) : undefined;
}

interface KommoCreateResult {
  ok: boolean;
  status: number;
  leadId?: number;
  body: unknown;
}

export async function createKommoLead(input: LeadInput): Promise<KommoCreateResult> {
  if (!TOKEN) {
    return {
      ok: false,
      status: 0,
      body: { error: "KOMMO_LONG_LIVED_TOKEN ausente — Kommo desabilitado" },
    };
  }

  const customFields: Array<{ field_id: number; values: Array<{ value: string }> }> = [];
  if (CF.idade) customFields.push(cf(CF.idade, String(input.idade)));
  if (CF.objetivo) customFields.push(cf(CF.objetivo, input.objetivo));
  if (CF.experiencia) customFields.push(cf(CF.experiencia, input.experiencia));
  if (CF.investimento) customFields.push(cf(CF.investimento, input.investimento));
  if (CF.urgencia) customFields.push(cf(CF.urgencia, input.urgencia));
  if (CF.restricao && input.restricao) customFields.push(cf(CF.restricao, input.restricao));
  if (CF.motivo) customFields.push(cf(CF.motivo, input.motivo));

  // Tags: marca origem + modalidade + urgência pra rotear/segmentar no Kommo.
  const tags = [
    { name: "ORIGEM-SITE" },
    { name: input.modalidade.split("·")[0]?.trim() ?? input.modalidade },
    { name: input.urgencia },
  ];

  // Embed contact (Kommo cria contato e vincula ao lead automaticamente).
  const contact = {
    name: input.nome,
    custom_fields_values: [
      { field_code: "PHONE", values: [{ value: input.whatsapp, enum_code: "MOB" }] },
      { field_code: "EMAIL", values: [{ value: input.email, enum_code: "WORK" }] },
    ],
  };

  const lead: Record<string, unknown> = {
    name: `[SITE] ${input.nome} · ${input.modalidade.split("·")[0]?.trim() ?? input.modalidade}`,
    _embedded: {
      contacts: [contact],
      tags,
    },
  };
  if (PIPELINE_ID) lead.pipeline_id = PIPELINE_ID;
  if (STATUS_ID) lead.status_id = STATUS_ID;
  if (customFields.length > 0) lead.custom_fields_values = customFields;

  const url = `https://${SUBDOMAIN}.kommo.com/api/v4/leads/complex`;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify([lead]),
    });
    const body: unknown = await res.json().catch(() => ({}));
    const leadId = extractLeadId(body);

    // Se faltam custom field IDs, anexa Note com payload bruto pro Victor ler no Kommo.
    if (res.ok && leadId && customFields.length === 0) {
      await attachFallbackNote(leadId, input).catch(() => {
        /* note é best-effort — silent fail */
      });
    }

    return { ok: res.ok, status: res.status, leadId, body };
  } catch (err) {
    return {
      ok: false,
      status: 0,
      body: { error: err instanceof Error ? err.message : String(err) },
    };
  }
}

function cf(field_id: number, value: string) {
  return { field_id, values: [{ value }] };
}

function extractLeadId(body: unknown): number | undefined {
  if (!body) return undefined;
  // /leads/complex retorna array root: [{id, contact_id, ...}]
  if (Array.isArray(body) && body.length > 0) {
    const first = body[0];
    if (first && typeof first === "object") {
      const id = (first as Record<string, unknown>).id;
      if (typeof id === "number") return id;
    }
  }
  // /leads (regular) retorna { _embedded: { leads: [{id, ...}] } }
  if (typeof body === "object") {
    const root = body as Record<string, unknown>;
    const embedded = root._embedded;
    if (embedded && typeof embedded === "object") {
      const leads = (embedded as Record<string, unknown>).leads;
      if (Array.isArray(leads) && leads.length > 0) {
        const first = leads[0];
        if (first && typeof first === "object") {
          const id = (first as Record<string, unknown>).id;
          if (typeof id === "number") return id;
        }
      }
    }
  }
  return undefined;
}

/**
 * Fallback: se custom fields não estão configurados via env, joga as respostas
 * brutas como Note no Lead — Victor ainda consegue ler tudo no Kommo.
 */
async function attachFallbackNote(leadId: number, input: LeadInput): Promise<void> {
  const text = [
    `📋 APLICAÇÃO SITE · respostas brutas`,
    ``,
    `Idade: ${input.idade}`,
    `Objetivo: ${input.objetivo}`,
    `Experiência: ${input.experiencia}`,
    `Investimento: ${input.investimento}`,
    `Quando começar: ${input.urgencia}`,
    `Restrição: ${input.restricao || "nenhuma"}`,
    ``,
    `Motivo:`,
    input.motivo,
  ].join("\n");

  const url = `https://${SUBDOMAIN}.kommo.com/api/v4/leads/${leadId}/notes`;
  await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify([{ note_type: "common", params: { text } }]),
  });
}
