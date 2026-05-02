/**
 * Hashing de PII pra Meta CAPI.
 * Specs Meta: https://developers.facebook.com/docs/marketing-api/conversions-api/parameters/customer-information-parameters
 * — sha256 lowercase, sem trim a mais (já normalizamos antes), em hex.
 */
import { createHash } from "node:crypto";

export function sha256(input: string): string {
  return createHash("sha256").update(input).digest("hex");
}

/** Normaliza email: lowercase + trim. */
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/**
 * Normaliza telefone BR pra formato E.164 sem o + (Meta CAPI quer só dígitos).
 * Aceita "11 99999-9999", "(11) 99999-9999", "+55 11 99999-9999" etc.
 * Garante prefixo 55 (Brasil) se ausente.
 */
export function normalizePhoneBR(input: string): string {
  const digits = input.replace(/\D/g, "");
  if (digits.startsWith("55") && digits.length >= 12) return digits;
  // 10 ou 11 dígitos = sem código de país, prefixa 55
  if (digits.length === 10 || digits.length === 11) return `55${digits}`;
  // Fallback: retorna o que tem (CAPI vai aceitar o que conseguir hashear)
  return digits;
}

/** Normaliza nome: lowercase + trim + sem acentos pra hashing CAPI. */
export function normalizeName(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

/** Split simples nome → first/last. Pega primeiro token e último. */
export function splitName(fullName: string): { first: string; last: string } {
  const parts = normalizeName(fullName).split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { first: "", last: "" };
  if (parts.length === 1) return { first: parts[0]!, last: "" };
  return { first: parts[0]!, last: parts[parts.length - 1]! };
}
