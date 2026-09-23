import { EVENT } from "./questions";

const esc = (s = "") => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

export function gcalLink() {
  const f = (iso) => iso.replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const p = new URLSearchParams({
    action: "TEMPLATE",
    text: "Ultra Black Lucrativa · Live com a Karen",
    dates: `${f(EVENT.startISO)}/${f(EVENT.endISO)}`,
    details: "Live Ultra Black Lucrativa às 20h (horário de Brasília).",
  });
  return `https://calendar.google.com/calendar/render?${p}`;
}

// E-mail no estilo "mensagem pessoal": texto simples, sem banner/botões,
// poucos links e um pedido de resposta — ajuda a cair na aba Principal do Gmail.
export function congratsEmail({ nome, email, whatsappGroupUrl, siteUrl = "https://www.karentalissaa.com" }) {
  const first = (nome || "").trim().split(/\s+/)[0] || "";
  const f = esc(first);
  const group = whatsappGroupUrl;

  const html = `<!doctype html>
<html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#ffffff;">
<div style="max-width:560px;padding:20px 16px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.6;color:#222222;">
<img src="${siteUrl}/img/email-banner.jpg" width="560" alt="Ultra Black Lucrativa · 08 de outubro às 20h" style="display:block;width:100%;max-width:560px;height:auto;border:0;border-radius:10px;margin:0 0 18px 0;">
<p>Oi${f ? `, ${f}` : ""}! Tudo bem?</p>
<p>Aqui é a Karen. Passando pra confirmar que a sua vaga na Ultra Black Lucrativa tá garantida.</p>
<p>A live é no dia <b>08 de outubro, às 20h</b> (horário de Brasília).</p>
${group ? `<p>O link da live eu vou mandar no grupo do WhatsApp. Se você ainda não entrou, entra por aqui:<br><a href="${group}" style="color:#1a73e8;">${group}</a></p>` : ""}
<p>E me faz um favor: <b>responde esse e-mail com um "ok"</b> pra eu saber que chegou certinho pra você. Assim os próximos avisos também não se perdem.</p>
<p>Te espero lá!</p>
<p>Um beijo,<br>Karen</p>
</div>
</body></html>`;

  const text = [
    `Oi${first ? `, ${first}` : ""}! Tudo bem?`,
    ``,
    `Aqui é a Karen. Passando pra confirmar que a sua vaga na Ultra Black Lucrativa tá garantida.`,
    ``,
    `A live é no dia 08 de outubro, às 20h (horário de Brasília).`,
    ``,
    group ? `O link da live eu vou mandar no grupo do WhatsApp. Se você ainda não entrou, entra por aqui:\n${group}\n` : null,
    `E me faz um favor: responde esse e-mail com um "ok" pra eu saber que chegou certinho pra você. Assim os próximos avisos também não se perdem.`,
    ``,
    `Te espero lá!`,
    ``,
    `Um beijo,`,
    `Karen`,
  ].filter((l) => l !== null).join("\n");

  return {
    subject: `${first ? first + ", s" : "S"}ua vaga tá confirmada`,
    html,
    text,
  };
}
