"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { EVENT } from "@/lib/questions";
import { Arrow, Calendar, Check, Clock, Lock } from "./Icons";

// ✏️ Textos da página de captura — edite à vontade
const COPY = {
  eyebrow: "Live gratuita e ao vivo",
  sub: "A noite em que eu vou te mostrar como aproveitar a Black Friday pra começar a vender pela internet como afiliada — mesmo que você esteja começando do zero.",
  bullets: [
    "Como escolher produtos que vendem de verdade na Black Friday",
    "Como gravar vídeo de achadinho sem precisar mostrar o rosto",
    "Shopee, TikTok Shop ou cortes: qual caminho faz mais sentido pra você começar",
  ],
  cta: "Quero garantir minha vaga",
};

const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"];
const ease = [0.22, 1, 0.36, 1];

function maskPhone(v) {
  const d = v.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 2) return d ? `(${d}` : "";
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

function Ambient() {
  const [dust, setDust] = useState([]);
  useEffect(() => {
    setDust(Array.from({ length: 24 }, (_, i) => ({ id: i, left: Math.random() * 100, bottom: -10 - Math.random() * 20, size: 1 + Math.random() * 2.5, dur: 9 + Math.random() * 14, delay: -Math.random() * 20 })));
  }, []);
  return (
    <>
      <div className="ambient" aria-hidden>
        {dust.map((d) => <span key={d.id} className="dust" style={{ left: `${d.left}%`, bottom: `${d.bottom}%`, width: d.size, height: d.size, animationDuration: `${d.dur}s`, animationDelay: `${d.delay}s` }} />)}
      </div>
      <div className="grain" aria-hidden />
    </>
  );
}

function Countdown() {
  const [left, setLeft] = useState(null);
  useEffect(() => {
    const t = new Date(EVENT.startISO).getTime();
    const tick = () => setLeft(Math.max(0, t - Date.now()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  if (!left) return null;
  const d = Math.floor(left / 864e5), h = Math.floor((left % 864e5) / 36e5), m = Math.floor((left % 36e5) / 6e4), s = Math.floor((left % 6e4) / 1e3);
  const box = (v, l) => <div className="cd-box"><b>{String(v).padStart(2, "0")}</b><small>{l}</small></div>;
  return <div className="countdown">{box(d, "dias")}{box(h, "horas")}{box(m, "min")}{box(s, "seg")}</div>;
}

function gcal() {
  const f = (iso) => iso.replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  return `https://calendar.google.com/calendar/render?${new URLSearchParams({ action: "TEMPLATE", text: "Ultra Black Lucrativa · Live com a Karen", dates: `${f(EVENT.startISO)}/${f(EVENT.endISO)}`, details: "Live Ultra Black Lucrativa às 20h (horário de Brasília)." })}`;
}

export default function CapturePage() {
  const [form, setForm] = useState({ nome: "", email: "", whatsapp: "", website: "" });
  const [utm, setUtm] = useState({});
  const [status, setStatus] = useState("idle"); // idle | sending | done
  const [error, setError] = useState("");
  const [touched, setTouched] = useState({});
  const nameRef = useRef(null);
  const waGroup = process.env.NEXT_PUBLIC_WHATSAPP_GROUP_URL;

  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const u = {};
    UTM_KEYS.forEach((k) => { if (p.get(k)) u[k] = p.get(k).slice(0, 200); });
    setUtm(u);
  }, []);

  const errs = {
    nome: form.nome.trim().length < 2 ? "Digite seu nome" : "",
    email: !/^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test(form.email.trim()) ? "Digite um e-mail válido" : "",
    whatsapp: form.whatsapp.replace(/\D/g, "").length < 10 ? "WhatsApp com DDD" : "",
  };
  const valid = !errs.nome && !errs.email && !errs.whatsapp;

  const submit = async (e) => {
    e.preventDefault();
    setTouched({ nome: true, email: true, whatsapp: true });
    if (!valid || status === "sending") return;
    setStatus("sending");
    setError("");
    try {
      const res = await fetch("/api/inscricao", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ ...form, ...utm }) });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.ok) throw new Error(json.error || "Não deu certo agora. Tenta de novo.");
      setStatus("done");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setError(err.message);
      setStatus("idle");
    }
  };

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: k === "whatsapp" ? maskPhone(e.target.value) : e.target.value }));
  const first = form.nome.trim().split(/\s+/)[0];
  const checkinHref = `/checkin?${new URLSearchParams({ nome: form.nome.trim(), email: form.email.trim(), whatsapp: form.whatsapp.replace(/\D/g, ""), ...utm })}`;
  const fade = (i) => ({ initial: { opacity: 0, y: 24 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.1 + i * 0.08, duration: 0.8, ease } });

  return (
    <>
      <Ambient />
      <main className="landing">
        <section className="hero capture">
          <motion.div className="hero-media" initial={{ opacity: 0, scale: 1.06 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1.6, ease }}>
            <img src="/img/hero-mobile.jpg" alt="Karen com cofre dourado e ampulheta" />
          </motion.div>

          <div className="hero-copy">
            <AnimatePresence mode="wait">
              {status !== "done" ? (
                <motion.div key="form" exit={{ opacity: 0, y: -20, filter: "blur(6px)" }} transition={{ duration: 0.4 }}>
                  <motion.div className="eyebrow" {...fade(0)}>{COPY.eyebrow}</motion.div>
                  <motion.h1 className="hero-title serif" {...fade(1)}>
                    <span>Ultra Black</span>
                    <span className="gold-text">Lucrativa</span>
                  </motion.h1>
                  <motion.div className="date-chip" {...fade(2)}><Calendar /> {EVENT.dateLabel} · online</motion.div>
                  <motion.p className="capture-sub" {...fade(3)}>{COPY.sub}</motion.p>
                  <motion.ul className="bullets" {...fade(4)}>
                    {COPY.bullets.map((b) => <li key={b}><span><Check /></span>{b}</li>)}
                  </motion.ul>

                  <motion.form className="capture-card" onSubmit={submit} noValidate {...fade(5)}>
                    <div className="field">
                      <input ref={nameRef} id="nome" placeholder=" " autoComplete="name" value={form.nome} onChange={set("nome")} onBlur={() => setTouched((t) => ({ ...t, nome: true }))} className={touched.nome && errs.nome ? "bad" : ""} />
                      <label htmlFor="nome">Seu primeiro nome</label>
                      {touched.nome && errs.nome && <small>{errs.nome}</small>}
                    </div>
                    <div className="field">
                      <input id="email" type="email" inputMode="email" placeholder=" " autoComplete="email" value={form.email} onChange={set("email")} onBlur={() => setTouched((t) => ({ ...t, email: true }))} className={touched.email && errs.email ? "bad" : ""} />
                      <label htmlFor="email">Seu melhor e-mail</label>
                      {touched.email && errs.email && <small>{errs.email}</small>}
                    </div>
                    <div className="field">
                      <input id="whatsapp" type="tel" inputMode="tel" placeholder=" " autoComplete="tel-national" value={form.whatsapp} onChange={set("whatsapp")} onBlur={() => setTouched((t) => ({ ...t, whatsapp: true }))} className={touched.whatsapp && errs.whatsapp ? "bad" : ""} />
                      <label htmlFor="whatsapp">WhatsApp com DDD</label>
                      {touched.whatsapp && errs.whatsapp && <small>{errs.whatsapp}</small>}
                    </div>
                    <input className="hp" tabIndex={-1} autoComplete="off" value={form.website} onChange={set("website")} aria-hidden />
                    <button className="btn-gold full" disabled={status === "sending"}>
                      {status === "sending" ? <><span className="spinner" /> Garantindo sua vaga…</> : <>{COPY.cta} <Arrow /></>}
                    </button>
                    {error && <p className="error-msg">{error}</p>}
                    <p className="legal"><Lock /> Seus dados estão seguros. Ao se inscrever, você aceita receber e-mails e mensagens sobre o evento.</p>
                  </motion.form>

                  <motion.div {...fade(6)}><Countdown /></motion.div>
                </motion.div>
              ) : (
                <motion.div key="done" className="capture-done" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease }}>
                  <motion.div className="seal small" initial={{ scale: 0, rotate: -90 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", stiffness: 180, damping: 14, delay: 0.15 }}>
                    <Check width={30} height={30} />
                  </motion.div>
                  <div className="eyebrow">Inscrição confirmada</div>
                  <h1 className="serif" style={{ fontSize: "clamp(40px,5.4vw,64px)", fontWeight: 500, lineHeight: 1.05, margin: "14px 0 16px" }}>
                    Parabéns{first ? `, ${first}` : ""}! <span className="gold-text">Sua vaga tá garantida.</span>
                  </h1>
                  <p className="capture-sub">Acabei de mandar um e-mail pra <b style={{ color: "var(--gold-1)" }}>{form.email.trim()}</b> com todos os detalhes. Se não aparecer em alguns minutos, olha a caixa de spam ou promoções.</p>
                  <div className="next-steps">
                    {waGroup && (
                      <a className="next" href={waGroup} target="_blank" rel="noreferrer">
                        <b>1</b><div><strong>Entra no grupo do WhatsApp</strong><span>É lá que o link da live chega.</span></div><Arrow />
                      </a>
                    )}
                    <a className="next highlight" href={checkinHref}>
                      <b>{waGroup ? 2 : 1}</b><div><strong>Faz seu check-in (5 min)</strong><span>Me conta onde você tá hoje pra eu preparar a live pra você.</span></div><Arrow />
                    </a>
                    <a className="next" href={gcal()} target="_blank" rel="noreferrer">
                      <b>{waGroup ? 3 : 2}</b><div><strong>Salva na agenda</strong><span>{EVENT.dateLabel}, horário de Brasília.</span></div><Arrow />
                    </a>
                  </div>
                  <p className="sign serif" style={{ fontStyle: "italic", fontSize: 22, color: "var(--gold-1)", marginTop: 26 }}>Karen &lt;3</p>
                </motion.div>
              )}
            </AnimatePresence>
            <div className="meta-row" style={{ marginTop: 22 }}><span><Clock /> Ao vivo · {EVENT.dateLabel}</span></div>
          </div>
        </section>
      </main>
    </>
  );
}
