/**
 * Meta Conversions API client (server-side Pixel events).
 *
 * Spec: https://developers.facebook.com/docs/marketing-api/conversions-api
 *
 * Por que CAPI espelhando client Pixel:
 *  - iOS 14.5+ App Tracking Transparency limita pixel client-side
 *  - Adblockers cortam fbevents.js
 *  - Server tem mais signal (IP real, UA real, fbclid)
 *  - Dedup por event_id evita double-count quando os dois conseguem disparar
 *
 * Fluxo:
 *  1. Browser gera event_id (UUID v4)
 *  2. Browser dispara fbq('track', 'Lead', { eventID: event_id, ...custom_data })
 *  3. Browser POST /api/lead com event_id no body
 *  4. Server dispara CAPI com mesmo event_id + user_data hashed
 *  5. Meta dedupe via event_id+event_name dentro de 48h
 */
import { sha256, normalizeEmail, normalizePhoneBR, splitName } from "./hash.js";

const PIXEL_ID = process.env.META_PIXEL_ID || "465701309646610";
const ACCESS_TOKEN = process.env.META_CAPI_ACCESS_TOKEN || "";
const TEST_EVENT_CODE = process.env.META_CAPI_TEST_EVENT_CODE || "";
const API_VERSION = "v21.0";

export interface CAPILeadPayload {
  event_id: string;
  event_source_url: string;
  client_ip: string;
  client_ua: string;
  fbp?: string; // _fbp cookie (Facebook browser ID)
  fbc?: string; // _fbc cookie (Facebook click ID derivado de fbclid)
  email: string;
  phone: string;
  name: string;
  custom_data?: Record<string, string | number | undefined>;
}

/**
 * Dispara um evento Lead no Meta CAPI.
 * Retorna { ok, status, body } — caller decide o que logar.
 *
 * NÃO levanta exception em falha de rede/API: o lead já foi criado no Kommo
 * (ou pelo menos tentado), o usuário precisa receber sucesso. Failures de CAPI
 * vão pro log estruturado pra investigação posterior.
 */
export async function sendCAPILead(p: CAPILeadPayload): Promise<{
  ok: boolean;
  status: number;
  body: unknown;
}> {
  if (!ACCESS_TOKEN) {
    return {
      ok: false,
      status: 0,
      body: { error: "META_CAPI_ACCESS_TOKEN ausente — CAPI desabilitado" },
    };
  }

  const { first, last } = splitName(p.name);
  const normalizedEmail = normalizeEmail(p.email);
  const normalizedPhone = normalizePhoneBR(p.phone);

  const event = {
    event_name: "Lead",
    event_time: Math.floor(Date.now() / 1000),
    event_id: p.event_id,
    event_source_url: p.event_source_url,
    action_source: "website" as const,
    user_data: {
      em: [sha256(normalizedEmail)],
      ph: [sha256(normalizedPhone)],
      fn: first ? [sha256(first)] : undefined,
      ln: last ? [sha256(last)] : undefined,
      client_ip_address: p.client_ip,
      client_user_agent: p.client_ua,
      fbp: p.fbp,
      fbc: p.fbc,
    },
    custom_data: p.custom_data,
  };

  const body: Record<string, unknown> = { data: [event] };
  if (TEST_EVENT_CODE) body.test_event_code = TEST_EVENT_CODE;

  const url = `https://graph.facebook.com/${API_VERSION}/${PIXEL_ID}/events?access_token=${encodeURIComponent(
    ACCESS_TOKEN,
  )}`;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const responseBody: unknown = await res.json().catch(() => ({}));
    return { ok: res.ok, status: res.status, body: responseBody };
  } catch (err) {
    return {
      ok: false,
      status: 0,
      body: { error: err instanceof Error ? err.message : String(err) },
    };
  }
}
