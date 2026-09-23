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

export default function CapturePage() {
  const [form, setForm] = useState({ nome: "", whatsapp: "", website: "" });
  const [utm, setUtm] = useState({});
  const [status, setStatus] = useState("idle"); // idle | sending
  const [error, setError] = useState("");
  const [touched, setTouched] = useState({});
  const nameRef = useRef(null);
  const [modalOpen, setModalOpen] = useState(false);
  const openModal = () => { setError(""); setModalOpen(true); };
  const closeModal = () => { if (status !== "sending") setModalOpen(false); };

  useEffect(() => {
    if (!modalOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const t = setTimeout(() => nameRef.current?.focus(), 250);
    const onKey = (e) => { if (e.key === "Escape") setModalOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => { document.body.style.overflow = prev; clearTimeout(t); window.removeEventListener("keydown", onKey); };
  }, [modalOpen]);

  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const u = {};
    UTM_KEYS.forEach((k) => { if (p.get(k)) u[k] = p.get(k).slice(0, 200); });
    setUtm(u);
  }, []);

  const errs = {
    nome: form.nome.trim().length < 2 ? "Digite seu nome" : "",
    whatsapp: form.whatsapp.replace(/\D/g, "").length < 10 ? "WhatsApp com DDD" : "",
  };
  const valid = !errs.nome && !errs.whatsapp;

  const submit = async (e) => {
    e.preventDefault();
    setTouched({ nome: true, whatsapp: true });
    if (!valid || status === "sending") return;
    setStatus("sending");
    setError("");
    try {
      const res = await fetch("/api/inscricao", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ ...form, ...utm }) });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.ok) throw new Error(json.error || "Não deu certo agora. Tenta de novo.");
      const q = new URLSearchParams({ nome: form.nome.trim(), whatsapp: form.whatsapp.replace(/\D/g, ""), ...utm });
      window.location.assign(`/obrigado?${q}`);
    } catch (err) {
      setError(err.message);
      setStatus("idle");
    }
  };

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: k === "whatsapp" ? maskPhone(e.target.value) : e.target.value }));
  const fade = (i) => ({ initial: { opacity: 0, y: 24 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.1 + i * 0.08, duration: 0.8, ease } });

  return (
    <>
      <Ambient />
      <main className="landing">
        <section className="hero capture">
          <motion.div className="hero-media hero-bg" initial={{ opacity: 0, scale: 1.04 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1.6, ease }}>
            <img src="/img/hero-bg.jpg" srcSet="/img/hero-bg-sm.jpg 1000w, /img/hero-bg.jpg 2560w" sizes="100vw" alt="Karen com cofre dourado e ampulheta" fetchPriority="high" />
          </motion.div>

          <div className="hero-copy">
            <AnimatePresence mode="wait">
              {true ? (
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

                  <motion.div className="cta-row" {...fade(5)}>
                    <button type="button" className="btn-gold cta-big" onClick={openModal}>
                      {COPY.cta} <Arrow />
                    </button>
                  </motion.div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        </section>

        <section className="sec2">
          <motion.div className="sec2-media" initial={{ opacity: 0, x: -40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, amount: 0.3 }} transition={{ duration: 0.9, ease }}>
            <img src="/img/secao2.webp" srcSet="/img/secao2-sm.webp 820w, /img/secao2.webp 1230w" sizes="(max-width: 900px) 92vw, 46vw" alt="Karen mostrando vendas aprovadas no celular" loading="lazy" />
          </motion.div>
          <motion.div className="sec2-copy" initial={{ opacity: 0, x: 40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, amount: 0.3 }} transition={{ duration: 0.9, ease, delay: 0.1 }}>
            <h2 className="sec2-title">A estratégia que me <span className="gold-text">faz faturar R$ 100k todos os meses</span> para você copiar e colar.</h2>
            <p>Todo ano o Brasil inteiro enche o carrinho entre a Black Friday e o Réveillon.</p>
            <p>E todo ano eu fico do outro lado recebendo comissões...</p>
            <p>Pela primeira vez vou juntar tudo o que faço na época mais <b>LUCRATIVA</b> do ano, pra quem nunca vendeu nada começar da melhor forma possível.</p>
            <button type="button" className="btn-gold cta-big" onClick={openModal}>{COPY.cta} <Arrow /></button>
          </motion.div>
        </section>
      </main>
        <AnimatePresence>
          {modalOpen && (
            <motion.div className="modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={(e) => { if (e.target === e.currentTarget) closeModal(); }}>
              <motion.form
                className="modal-card"
                role="dialog"
                aria-modal="true"
                aria-labelledby="modal-title"
                onSubmit={submit}
                noValidate
                initial={{ opacity: 0, y: 40, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 30, scale: 0.97 }}
                transition={{ duration: 0.45, ease }}
              >
                <button type="button" className="modal-close" onClick={closeModal} aria-label="Fechar">×</button>
                <div className="eyebrow">Vaga gratuita</div>
                <h2 id="modal-title" className="serif modal-title">Garanta sua vaga na <span className="gold-text">Ultra Black</span></h2>
                <p className="modal-sub"><Calendar /> {EVENT.dateLabel} · ao vivo e online</p>
                <div className="field">
                  <input ref={nameRef} id="nome" placeholder=" " autoComplete="given-name" value={form.nome} onChange={set("nome")} onBlur={() => setTouched((t) => ({ ...t, nome: true }))} className={touched.nome && errs.nome ? "bad" : ""} />
                  <label htmlFor="nome">Seu primeiro nome</label>
                  {touched.nome && errs.nome && <small>{errs.nome}</small>}
                </div>
                <div className="field">
                  <input id="whatsapp" type="tel" inputMode="tel" placeholder=" " autoComplete="tel-national" value={form.whatsapp} onChange={set("whatsapp")} onBlur={() => setTouched((t) => ({ ...t, whatsapp: true }))} className={touched.whatsapp && errs.whatsapp ? "bad" : ""} />
                  <label htmlFor="whatsapp">WhatsApp com DDD</label>
                  {touched.whatsapp && errs.whatsapp && <small>{errs.whatsapp}</small>}
                </div>
                <input className="hp" tabIndex={-1} autoComplete="off" value={form.website} onChange={set("website")} aria-hidden />
                <button className="btn-gold full" disabled={status === "sending"}>
                  {status === "sending" ? <><span className="spinner" /> Garantindo sua vaga…</> : <>Confirmar minha vaga <Arrow /></>}
                </button>
                {error && <p className="error-msg">{error}</p>}
                <p className="legal"><Lock /> Seus dados estão seguros. Ao se inscrever, você aceita receber mensagens sobre o evento.</p>
              </motion.form>
            </motion.div>
          )}
        </AnimatePresence>
    </>
  );
}
