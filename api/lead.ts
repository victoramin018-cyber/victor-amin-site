/**
 * POST /api/lead — handler do form de aplicação.
 *
 * Fluxo:
 *  1. Aceita só POST (405 caso contrário)
 *  2. Valida payload com zod (LeadSchema)
 *  3. Honeypot: se hp_website preenchido, retorna 200 fake (silent reject)
 *  4. Dispara em paralelo:
 *     - Kommo CRM (cria Lead com tags + contact + custom fields)
 *     - Meta CAPI (Lead event server-side com user_data hashed)
 *  5. Responde { ok, event_id } pra client refletir no UI + dedup com client Pixel
 *
 * Failure modes:
 *  - Payload inválido → 400 com lista de erros zod
 *  - Honeypot tripado → 200 fake (não dá feedback ao bot)
 *  - Kommo falha mas CAPI sucede → 200 ok com warn em log
 *  - Tudo falha → 502 (cliente cai no fallback wa.me)
 */
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { LeadSchema } from "../lib/schema.js";
import { createKommoLead } from "../lib/kommo.js";
import { sendCAPILead } from "../lib/meta-capi.js";
import { randomUUID } from "node:crypto";

export const config = {
  // Vercel Serverless Function (Node runtime, não Edge — precisa node:crypto).
  runtime: "nodejs20.x",
};

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
): Promise<void> {
  // CORS: site mesmo origin, mas mantém aberto pra healthcheck/preview deploys
  res.setHeader("Access-Control-Allow-Origin", "https://www.victoramin.com");
  res.setHeader("Vary", "Origin");
  res.setHeader("Cache-Control", "no-store");

  if (req.method !== "POST") {
    res.status(405).json({ ok: false, error: "method_not_allowed" });
    return;
  }

  // Parse JSON body (Vercel já parseia se Content-Type: application/json)
  const raw =
    typeof req.body === "string" ? safeJsonParse(req.body) : req.body;
  if (!raw || typeof raw !== "object") {
    res.status(400).json({ ok: false, error: "invalid_body" });
    return;
  }

  const parsed = LeadSchema.safeParse(raw);
  if (!parsed.success) {
    res.status(400).json({
      ok: false,
      error: "validation_failed",
      issues: parsed.error.issues.map((i) => ({
        path: i.path.join("."),
        message: i.message,
      })),
    });
    return;
  }
  const input = parsed.data;

  // Honeypot — bot preencheu, fingimos sucesso
  if (input.hp_website && input.hp_website.length > 0) {
    res.status(200).json({ ok: true, event_id: input.event_id ?? randomUUID() });
    return;
  }

  // Garante event_id (idealmente vem do client pra dedup com Pixel browser)
  const event_id = input.event_id ?? randomUUID();

  // Captura signal do request pra CAPI
  const client_ip = pickIp(req);
  const client_ua = (req.headers["user-agent"] as string | undefined) ?? "";
  const cookies = parseCookies(req.headers.cookie ?? "");
  const fbp = cookies._fbp;
  const fbc = cookies._fbc;
  const event_source_url =
    (req.headers["referer"] as string | undefined) ?? "https://www.victoramin.com/";

  // Dispara Kommo + CAPI em paralelo
  const [kommoResult, capiResult] = await Promise.allSettled([
    createKommoLead(input),
    sendCAPILead({
      event_id,
      event_source_url,
      client_ip,
      client_ua,
      fbp,
      fbc,
      email: input.email,
      phone: input.whatsapp,
      name: input.nome,
      custom_data: {
        content_name: "Aplicação Formulário",
        modalidade: input.modalidade,
        objetivo: input.objetivo,
        investimento: input.investimento,
        urgencia: input.urgencia,
      },
    }),
  ]);

  // Log estruturado pra Vercel logs (JSON inteiro fica grepável)
  const log = {
    event: "lead_submit",
    event_id,
    timestamp: new Date().toISOString(),
    modalidade: input.modalidade,
    urgencia: input.urgencia,
    kommo: settledSummary(kommoResult),
    capi: settledSummary(capiResult),
  };
  console.log(JSON.stringify(log));

  // Sucesso = ao menos UM dos dois canais respondeu ok.
  // (Se Kommo falhar mas CAPI ok, ainda temos lead pra retargeting + Victor pode
  //  recuperar pelo log + email do user no resp.)
  const kommoOk = kommoResult.status === "fulfilled" && kommoResult.value.ok;
  const capiOk = capiResult.status === "fulfilled" && capiResult.value.ok;

  if (!kommoOk && !capiOk) {
    res.status(502).json({
      ok: false,
      error: "upstream_failed",
      event_id,
      // Debug info só em dev
      ...(process.env.NODE_ENV === "development" && {
        debug: { kommo: kommoResult, capi: capiResult },
      }),
    });
    return;
  }

  res.status(200).json({
    ok: true,
    event_id,
    // Client usa pra fbq('track', 'Lead', {}, { eventID: event_id }) e dedupar
    redirect: "https://www.instagram.com/victoraminn/",
  });
}

function pickIp(req: VercelRequest): string {
  const xff = (req.headers["x-forwarded-for"] as string | undefined) ?? "";
  const first = xff.split(",")[0]?.trim();
  if (first) return first;
  const realIp = req.headers["x-real-ip"];
  if (typeof realIp === "string") return realIp;
  return "";
}

function parseCookies(header: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const pair of header.split(";")) {
    const idx = pair.indexOf("=");
    if (idx === -1) continue;
    const k = pair.slice(0, idx).trim();
    const v = pair.slice(idx + 1).trim();
    if (k) out[k] = decodeURIComponent(v);
  }
  return out;
}

function safeJsonParse(s: string): unknown {
  try {
    return JSON.parse(s);
  } catch {
    return null;
  }
}

function settledSummary<T extends { ok: boolean; status: number }>(
  result: PromiseSettledResult<T>,
): { ok: boolean; status: number; reason?: string } {
  if (result.status === "fulfilled") {
    return { ok: result.value.ok, status: result.value.status };
  }
  return {
    ok: false,
    status: 0,
    reason: result.reason instanceof Error ? result.reason.message : String(result.reason),
  };
}
