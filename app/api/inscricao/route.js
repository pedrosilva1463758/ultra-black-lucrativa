import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { congratsEmail } from "@/lib/emailTemplate";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "@/lib/config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: false },
});

const BREVO = "https://api.brevo.com/v3";
const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/;
const clip = (v, n = 200) => (typeof v === "string" ? v.trim().slice(0, n) : null) || null;

function toE164BR(raw) {
  const d = (raw || "").replace(/\D/g, "");
  if (!d) return null;
  if (d.startsWith("55") && d.length >= 12) return `+${d}`;
  if (d.length === 10 || d.length === 11) return `+55${d}`;
  return null;
}

async function brevo(path, body) {
  const res = await fetch(`${BREVO}${path}`, {
    method: "POST",
    headers: { "api-key": process.env.BREVO_API_KEY, "content-type": "application/json", accept: "application/json" },
    body: JSON.stringify(body),
  });
  if (res.ok || res.status === 204) return { ok: true };
  const txt = await res.text().catch(() => "");
  return { ok: false, status: res.status, error: txt.slice(0, 300) };
}

async function upsertContact({ nome, email, phone }) {
  const listId = Number(process.env.BREVO_LIST_ID);
  const base = { email, updateEnabled: true, ...(listId ? { listIds: [listId] } : {}) };
  const first = nome.split(/\s+/)[0];
  const lastName = nome.split(/\s+/).slice(1).join(" ");
  // tenta com telefone; se o Brevo recusar o formato/duplicidade, salva sem
  if (phone) {
    const r = await brevo("/contacts", { ...base, attributes: { FIRSTNAME: first, LASTNAME: lastName, SMS: phone, WHATSAPP: phone } });
    if (r.ok) return r;
  }
  return brevo("/contacts", { ...base, attributes: { FIRSTNAME: first, LASTNAME: lastName } });
}

export async function POST(req) {
  let body;
  try { body = await req.json(); } catch { return NextResponse.json({ ok: false, error: "Requisição inválida." }, { status: 400 }); }

  // honeypot anti-bot
  if (body.website) return NextResponse.json({ ok: true });

  const nome = clip(body.nome, 120);
  const email = clip(body.email, 200)?.toLowerCase();
  const whatsappDigits = (body.whatsapp || "").replace(/\D/g, "").slice(0, 15) || null;

  if (!nome || nome.length < 2) return NextResponse.json({ ok: false, error: "Digite seu nome." }, { status: 422 });
  if (!email || !EMAIL_RE.test(email)) return NextResponse.json({ ok: false, error: "Esse e-mail não parece válido." }, { status: 422 });
  if (whatsappDigits && whatsappDigits.length < 10) return NextResponse.json({ ok: false, error: "Confere o número do WhatsApp com DDD." }, { status: 422 });

  const { data, error } = await supabase.rpc("ubf_register_lead", {
    p_nome: nome,
    p_email: email,
    p_whatsapp: whatsappDigits,
    p_utm_source: clip(body.utm_source),
    p_utm_medium: clip(body.utm_medium),
    p_utm_campaign: clip(body.utm_campaign),
    p_utm_content: clip(body.utm_content),
    p_utm_term: clip(body.utm_term),
  });
  if (error || !data?.[0]) {
    console.error("[inscricao] supabase", error);
    return NextResponse.json({ ok: false, error: "Não consegui salvar sua inscrição agora. Tenta de novo em instantes." }, { status: 500 });
  }
  const { lead_id, is_new, should_send } = data[0];

  let emailStatus = "pulado (já enviado na última hora)";
  if (should_send) {
    if (!process.env.BREVO_API_KEY) {
      emailStatus = "erro: BREVO_API_KEY não configurada";
      console.warn("[inscricao] BREVO_API_KEY vazia — lead salvo, e-mail NÃO enviado");
    } else {
      const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || new URL(req.url).origin).replace(/\/$/, "");
      const mail = congratsEmail({
        nome,
        email,
        whatsapp: whatsappDigits,
        siteUrl,
        whatsappGroupUrl: process.env.NEXT_PUBLIC_WHATSAPP_GROUP_URL || "",
      });
      const [contact, sent] = await Promise.all([
        upsertContact({ nome, email, phone: toE164BR(whatsappDigits) }),
        brevo("/smtp/email", {
          sender: { name: process.env.BREVO_SENDER_NAME || "Karen", email: process.env.BREVO_SENDER_EMAIL },
          to: [{ email, name: nome }],
          subject: mail.subject,
          htmlContent: mail.html,
          textContent: mail.text,
          tags: ["ultra-black-inscricao"],
        }),
      ]);
      if (!contact.ok) console.error("[inscricao] brevo contato", contact);
      if (!sent.ok) console.error("[inscricao] brevo email", sent);
      emailStatus = sent.ok ? (contact.ok ? "enviado" : "enviado (contato não entrou na lista)") : `erro: ${sent.status} ${sent.error}`;
    }
    await supabase.rpc("ubf_mark_email", { p_lead: lead_id, p_status: emailStatus });
  }

  return NextResponse.json({ ok: true, is_new, email_status: emailStatus.startsWith("erro") ? "falhou" : "ok" });
}
