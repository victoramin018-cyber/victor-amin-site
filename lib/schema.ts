/**
 * Zod schemas para validação de input do formulário de aplicação.
 * Espelha exatamente os campos do <form id="aplicacao-form"> em public/index.html.
 *
 * Mudanças no form precisam ser refletidas aqui — runtime fail é melhor que
 * silent type drift.
 */
import { z } from "zod";

// Listas exatas de opções dos <select> — qualquer valor fora dessas listas é rejeitado.
export const OBJETIVO = [
  "Estética e composição corporal",
  "Postura e dor crônica",
  "Performance esportiva",
  "Preparação para palco (fisiculturismo)",
  "Saúde e qualidade de vida",
  "Mais de um objetivo combinado",
] as const;

export const MODALIDADE = [
  "Personal Presencial · São Paulo Zona Oeste",
  "Personal Presencial · São Paulo Zona Sul",
  "Consultoria Online · de qualquer lugar",
  "Sem preferência · me orienta",
] as const;

export const EXPERIENCIA = [
  "Nunca treinei sério",
  "Menos de 1 ano",
  "1 a 3 anos",
  "3 a 5 anos",
  "Mais de 5 anos",
] as const;

export const INVESTIMENTO = [
  "Até R$ 200",
  "R$ 200 a R$ 500",
  "R$ 500 a R$ 1.500",
  "R$ 1.500 a R$ 3.000",
  "Acima de R$ 3.000",
] as const;

export const URGENCIA = [
  "Esta semana",
  "Nas próximas 2 semanas",
  "No próximo mês",
  "Estou pesquisando · sem urgência",
] as const;

// Regex permissivo de WhatsApp BR — aceita formatos comuns que pessoas digitam.
// Server-side normaliza pra dígitos puros antes de mandar pro Kommo / CAPI.
const WHATSAPP_BR = /^[\s\d()+\-]{10,20}$/;

export const LeadSchema = z.object({
  // Honeypot — bot preenche, humano deixa vazio. Server rejeita silenciosamente
  // se vier preenchido (status 200 fake pra não dar feedback ao bot).
  hp_website: z.string().max(0).optional().default(""),

  // Identidade
  nome: z.string().trim().min(2, "Nome muito curto").max(120),
  idade: z.coerce.number().int().min(14).max(80),
  whatsapp: z
    .string()
    .trim()
    .regex(WHATSAPP_BR, "WhatsApp inválido — use formato com DDD"),
  email: z.string().trim().toLowerCase().email("Email inválido").max(120),

  // Qualificação
  objetivo: z.enum(OBJETIVO),
  modalidade: z.enum(MODALIDADE),
  experiencia: z.enum(EXPERIENCIA),
  investimento: z.enum(INVESTIMENTO),
  urgencia: z.enum(URGENCIA),
  restricao: z.string().trim().max(300).optional().default(""),
  motivo: z.string().trim().min(10, "Conta um pouco mais").max(2000),

  // Dedup CAPI ↔ client Pixel — UUID v4 gerado no browser, propagado pro server.
  // Se faltar, server gera o seu (perde dedup mas evento ainda dispara).
  event_id: z.string().uuid().optional(),
});

export type LeadInput = z.infer<typeof LeadSchema>;
