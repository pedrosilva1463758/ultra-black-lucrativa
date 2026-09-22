"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { EVENT } from "@/lib/questions";
import { Arrow, Calendar, Check } from "./Icons";

const ease = [0.22, 1, 0.36, 1];
const fmt = (iso) => iso.replace(/[-:]/g, "").replace(/\.\d{3}/, "");

function gcal() {
  return `https://calendar.google.com/calendar/render?${new URLSearchParams({ action: "TEMPLATE", text: "Ultra Black Lucrativa · Live com a Karen", dates: `${fmt(EVENT.startISO)}/${fmt(EVENT.endISO)}`, details: "Live Ultra Black Lucrativa às 20h (horário de Brasília)." })}`;
}
function ics() {
  const body = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//UltraBlack//PT", "BEGIN:VEVENT", `UID:ultra-black-${fmt(EVENT.startISO)}`, `DTSTAMP:${fmt(EVENT.startISO)}`, `DTSTART:${fmt(EVENT.startISO)}`, `DTEND:${fmt(EVENT.endISO)}`, "SUMMARY:Ultra Black Lucrativa · Live com a Karen", "BEGIN:VALARM", "TRIGGER:-PT30M", "ACTION:DISPLAY", "DESCRIPTION:A live começa em 30 minutos!", "END:VALARM", "END:VEVENT", "END:VCALENDAR"].join("\r\n");
  return "data:text/calendar;charset=utf-8," + encodeURIComponent(body);
}

function Confetti() {
  const [bits, setBits] = useState([]);
  useEffect(() => {
    const c = ["#fbe39a", "#e9b24f", "#c47f2c", "#fff4d0"];
    setBits(Array.from({ length: 80 }, (_, i) => ({ id: i, left: Math.random() * 100, delay: Math.random() * 0.8, dur: 2.4 + Math.random() * 2.2, color: c[i % 4], rot: Math.random() * 360 })));
  }, []);
  return <div className="confetti" aria-hidden>{bits.map((b) => <i key={b.id} style={{ left: `${b.left}%`, background: b.color, animationDelay: `${b.delay}s`, animationDuration: `${b.dur}s`, transform: `rotate(${b.rot}deg)` }} />)}</div>;
}

export default function ThankYouPage() {
  const params = useSearchParams();
  const nome = (params.get("nome") || "").trim();
  const first = nome.split(/\s+/)[0];
  const waGroup = process.env.NEXT_PUBLIC_WHATSAPP_GROUP_URL;
  const pass = new URLSearchParams();
  ["nome", "whatsapp", "email", "utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"].forEach((k) => { if (params.get(k)) pass.set(k, params.get(k)); });
  const checkinHref = `/checkin?${pass}`;
  let n = 0;

  return (
    <>
      <Confetti />
      <div className="grain" aria-hidden />
      <main className="landing">
        <section className="hero capture">
          <motion.div className="hero-media hero-bg" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.4, ease }}>
            <img src="/img/hero-bg.jpg" srcSet="/img/hero-bg-sm.jpg 1000w, /img/hero-bg.jpg 2560w" sizes="100vw" alt="" />
          </motion.div>
          <div className="hero-copy">
            <motion.div className="capture-done" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease }}>
              <motion.div className="seal small" initial={{ scale: 0, rotate: -90 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", stiffness: 180, damping: 14, delay: 0.15 }}>
                <Check width={30} height={30} />
              </motion.div>
              <div className="eyebrow">Inscrição confirmada</div>
              <h1 className="serif" style={{ fontSize: "clamp(40px,5.4vw,64px)", fontWeight: 500, lineHeight: 1.05, margin: "14px 0 16px" }}>
                Parabéns{first ? `, ${first}` : ""}! <span className="gold-text">Sua vaga tá garantida.</span>
              </h1>
              <div className="date-chip"><Calendar /> {EVENT.dateLabel} · ao vivo e online</div>
              <p className="capture-sub">Agora faz esses passos rapidinhos pra não perder nada da live:</p>
              <div className="next-steps">
                {waGroup && (
                  <a className="next highlight" href={waGroup} target="_blank" rel="noreferrer">
                    <b>{++n}</b><div><strong>Entra no grupo do WhatsApp</strong><span>É lá que o link da live chega.</span></div><Arrow />
                  </a>
                )}
                <a className={`next ${waGroup ? "" : "highlight"}`} href={checkinHref}>
                  <b>{++n}</b><div><strong>Faz seu check-in (5 min)</strong><span>Me conta onde você tá hoje pra eu preparar a live pra você.</span></div><Arrow />
                </a>
                <a className="next" href={gcal()} target="_blank" rel="noreferrer">
                  <b>{++n}</b><div><strong>Salva no Google Agenda</strong><span>{EVENT.dateLabel}, horário de Brasília.</span></div><Arrow />
                </a>
                <a className="next" href={ics()} download="ultra-black-lucrativa.ics">
                  <b>{++n}</b><div><strong>Salva no iPhone / Outlook</strong><span>Com lembrete 30 minutos antes.</span></div><Arrow />
                </a>
              </div>
              <p className="serif" style={{ fontStyle: "italic", fontSize: 22, color: "var(--gold-1)", marginTop: 26 }}>Karen &lt;3</p>
            </motion.div>
          </div>
        </section>
      </main>
    </>
  );
}
