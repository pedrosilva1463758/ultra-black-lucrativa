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

export function congratsEmail({ nome, email, whatsapp, siteUrl, whatsappGroupUrl }) {
  const first = esc((nome || "").trim().split(/\s+/)[0] || "");
  const checkinUrl = `${siteUrl}/checkin?${new URLSearchParams({ nome: nome || "", email: email || "", ...(whatsapp ? { whatsapp } : {}), utm_source: "email", utm_campaign: "confirmacao" })}`;
  const banner = `${siteUrl}/img/email-banner.jpg`;
  const gold = "#E9B24F";

  const btn = (href, label, primary = true) => `
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 auto;">
      <tr><td align="center" bgcolor="${primary ? gold : "#0c0a07"}" style="border-radius:999px;${primary ? "" : `border:1px solid ${gold};`}">
        <a href="${href}" target="_blank" style="display:inline-block;padding:16px 34px;font-family:Arial,Helvetica,sans-serif;font-size:16px;font-weight:bold;color:${primary ? "#1b1206" : gold};text-decoration:none;border-radius:999px;">${label}</a>
      </td></tr>
    </table>`;

  const step = (n, title, text, button) => `
    <tr><td style="padding:0 0 26px 0;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#120f0a;border:1px solid #3a2d17;border-radius:16px;">
        <tr><td style="padding:24px 24px 22px 24px;font-family:Arial,Helvetica,sans-serif;">
          <div style="font-size:12px;letter-spacing:3px;color:${gold};font-weight:bold;">PASSO ${n}</div>
          <div style="font-family:Georgia,'Times New Roman',serif;font-size:22px;color:#F6F1E8;margin:8px 0 6px 0;">${title}</div>
          <div style="font-size:15px;line-height:23px;color:#C9BFB0;margin-bottom:18px;">${text}</div>
          ${button}
        </td></tr>
      </table>
    </td></tr>`;

  const steps = [
    step(1, "Salva o dia na sua agenda", `A live é <b style="color:#F6F1E8;">${EVENT.dateLabel.toLowerCase()} (horário de Brasília)</b>. Coloca o lembrete agora pra não perder.`, btn(gcalLink(), "Adicionar na agenda", false)),
    whatsappGroupUrl
      ? step(2, "Entra no grupo do WhatsApp", "É por lá que eu mando o link da live e os avisos importantes. Quem tá no grupo não perde nada.", btn(whatsappGroupUrl, "Entrar no grupo", true))
      : "",
    step(whatsappGroupUrl ? 3 : 2, "Faz o seu check-in", "São umas perguntas rapidinhas (uns 5 minutos) pra eu preparar a live do jeito que faz sentido pra você. As dúvidas que mais aparecerem, eu respondo ao vivo.", btn(checkinUrl, "Fazer meu check-in", !whatsappGroupUrl)),
  ].join("");

  const html = `<!doctype html>
<html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="dark"><meta name="supported-color-schemes" content="dark">
<title>Inscrição confirmada · Ultra Black Lucrativa</title></head>
<body style="margin:0;padding:0;background:#050505;">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">Tá confirmado! Te espero ${EVENT.dateLabel.toLowerCase()}. Veja os próximos passos.</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#050505" style="background:#050505;">
  <tr><td align="center" style="padding:24px 12px;">
    <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px;">
      <tr><td style="border-radius:18px 18px 0 0;overflow:hidden;">
        <img src="${banner}" width="600" alt="Ultra Black Lucrativa · ${EVENT.dateLabel}" style="display:block;width:100%;max-width:600px;height:auto;border:0;border-radius:18px 18px 0 0;">
      </td></tr>
      <tr><td bgcolor="#0b0906" style="background:#0b0906;padding:36px 32px 12px 32px;border-radius:0 0 18px 18px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr><td align="center" style="font-family:Arial,Helvetica,sans-serif;font-size:12px;letter-spacing:4px;color:${gold};font-weight:bold;padding-bottom:12px;">INSCRIÇÃO CONFIRMADA</td></tr>
          <tr><td align="center" style="font-family:Georgia,'Times New Roman',serif;font-size:34px;line-height:40px;color:#F6F1E8;padding-bottom:16px;">Parabéns${first ? `, ${first}` : ""}!<br><span style="color:${gold};">Seu lugar tá garantido.</span></td></tr>
          <tr><td align="center" style="font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:26px;color:#D6CCBD;padding-bottom:26px;">
            Que bom que você decidiu vir! Sua inscrição na <b style="color:#F6F1E8;">Ultra Black Lucrativa</b> foi confirmada.
            Separa esse horário, porque vai ser especial.
          </td></tr>
          <tr><td align="center" style="padding-bottom:32px;">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border:1px solid #5a4420;border-radius:999px;">
              <tr><td style="padding:12px 22px;font-family:Arial,Helvetica,sans-serif;font-size:15px;color:#FBE39A;font-weight:bold;">📅 ${EVENT.dateLabel} · ao vivo e online</td></tr>
            </table>
          </td></tr>
          ${steps}
          <tr><td align="center" style="font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:24px;color:#C9BFB0;padding:6px 0 4px 0;">Até lá!</td></tr>
          <tr><td align="center" style="font-family:Georgia,'Times New Roman',serif;font-style:italic;font-size:24px;color:#FBE39A;padding-bottom:30px;">Karen &lt;3</td></tr>
        </table>
      </td></tr>
      <tr><td align="center" style="font-family:Arial,Helvetica,sans-serif;font-size:11px;line-height:17px;color:#6D655A;padding:20px 20px 0 20px;">
        Você recebeu este e-mail porque se inscreveu na Ultra Black Lucrativa com ${esc(email)}.<br>
        Pra não perder os avisos, adicione este remetente aos seus contatos.
      </td></tr>
    </table>
  </td></tr>
</table>
</body></html>`;

  const text = [
    `Parabéns${first ? `, ${first}` : ""}! Sua inscrição na Ultra Black Lucrativa está confirmada.`,
    ``,
    `Live: ${EVENT.dateLabel} (horário de Brasília).`,
    ``,
    `1) Salve na agenda: ${gcalLink()}`,
    whatsappGroupUrl ? `2) Entre no grupo do WhatsApp: ${whatsappGroupUrl}` : null,
    `${whatsappGroupUrl ? 3 : 2}) Faça seu check-in: ${checkinUrl}`,
    ``,
    `Karen <3`,
  ].filter((l) => l !== null).join("\n");

  return {
    subject: `${first ? first + ", s" : "S"}ua vaga na Ultra Black Lucrativa tá confirmada ✨`,
    html,
    text,
  };
}
