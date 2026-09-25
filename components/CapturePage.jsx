"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { EVENT } from "@/lib/questions";
import { Arrow, Calendar, Check, Clock, Lock } from "./Icons";

// ✏️ Textos da página de captura — edite à vontade
const COPY = {
  eyebrow: "Live gratuita e ao vivo",
  sub: "No dia 08/10, às 20h, vou abrir ao vivo a estratégia completa pra você sair do lado de quem gasta na Black e passar pro lado de quem recebe comissão de cada compra, até a virada do ano…",
  bullets: [
    "Como escolher produtos que vendem de verdade na Black Friday",
    "Como gravar vídeo de achadinho sem precisar mostrar o rosto",
    "Shopee, TikTok Shop ou cortes: qual caminho faz mais sentido pra você começar",
  ],
  cta: "Quero garantir minha vaga",
};


const PILARES = [
  { n: "1º Pilar", t1: "A Janela", t2: "de Ouro", img: "/img/pilar1.webp", text: "Entender por que entre a Black e a virada do ano quem começa do zero tem mais chance do que em qualquer outro mês." },
  { n: "2º Pilar", t1: "Achadinhos que", t2: "vendem sozinhos", img: "/img/pilar2.webp", text: "Saber escolher o produto que o povo já tá caçando, sem ter estoque e sem gastar um real com mercadoria." },
  { n: "3º Pilar", t1: "TikTok Shop", t2: "sem aparecer", img: "/img/pilar3.webp", text: "Gravar vídeo de mão e de produto que leva a pessoa direto pro teu link, sem mostrar o rosto em nenhum momento." },
  { n: "4º Pilar", t1: "Shopee e", t2: "cortes virais", img: "/img/pilar4.webp", text: "Usar corte de conteúdo que já viralizou pra puxar gente pro teu link na Shopee, todo dia." },
  { n: "5º Pilar", t1: "Mão na massa", t2: "com a Karen", img: "/img/pilar5.webp", text: "Não ficar sozinho na parte difícil: a Karen acompanha de perto até a primeira venda." },
];

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

export default function CapturePage({ redirectTo = "/obrigado" }) {
  const [form, setForm] = useState({ nome: "", whatsapp: "", email: "", website: "" });
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
    email: !/^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test(form.email.trim()) ? "Digite um e-mail válido" : "",
  };
  const valid = !errs.nome && !errs.whatsapp && !errs.email;

  const submit = async (e) => {
    e.preventDefault();
    setTouched({ nome: true, whatsapp: true, email: true });
    if (!valid || status === "sending") return;
    setStatus("sending");
    setError("");
    try {
      const res = await fetch("/api/inscricao", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ ...form, ...utm, origem: redirectTo === "/checkin" ? "pc" : "home" }) });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.ok) throw new Error(json.error || "Não deu certo agora. Tenta de novo.");
      // painel de captação (TripleA): registra o lead antes de sair da página
      try { window.TripleA?.lead?.({ nome: form.nome.trim(), email: form.email.trim(), telefone: "+55" + form.whatsapp.replace(/\D/g, "") }); } catch {}
      const q = new URLSearchParams({ nome: form.nome.trim(), whatsapp: form.whatsapp.replace(/\D/g, ""), email: form.email.trim(), ...utm });
      window.location.assign(`${redirectTo}?${q}`);
    } catch (err) {
      setError(err.message);
      setStatus("idle");
    }
  };

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: k === "whatsapp" ? maskPhone(e.target.value) : e.target.value }));
  const fade = (i) => ({ initial: { opacity: 0, y: 24 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.1 + i * 0.08, duration: 0.8, ease } });

  return (
    <>
      {/* rastreador do painel de captação (React coloca no <head>) */}
      <script async src="https://hub.brunoguerra.com.br/api/public/captacao/script" data-projeto="cmugzp0rm0004gm0ak4wgalpr" />
      <Ambient />
      <main className="landing">
        <section className="hero capture">
          <motion.div className="hero-media hero-bg" initial={{ opacity: 0, scale: 1.04 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1.6, ease }}>
            <picture>
              <source media="(max-width: 900px)" srcSet="/img/hero-mobile-bg.jpg" />
              <img src="/img/hero-bg.jpg" srcSet="/img/hero-bg-sm.jpg 1000w, /img/hero-bg.jpg 2560w" sizes="100vw" alt="Karen com cofre dourado e ampulheta" fetchPriority="high" />
            </picture>
          </motion.div>

          <div className="hero-copy">
            <AnimatePresence mode="wait">
              {true ? (
                <motion.div key="form" exit={{ opacity: 0, y: -20, filter: "blur(6px)" }} transition={{ duration: 0.4 }}>
                  <motion.h1 className="hero-title hero-title-long serif" {...fade(1)}>
                    A nossa Ultra <span className="gold-text">Black Lucrativa</span> começa aqui!
                  </motion.h1>
                  <motion.div className="date-chip" {...fade(2)}><Calendar /> {EVENT.dateLabel} · online</motion.div>
                  <motion.p className="capture-sub" {...fade(3)}>{COPY.sub}</motion.p>

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


        <div className="marquee" aria-label="Ultra Black Lucrativa · Karen Talissa · 08/10 às 20h">
          <div className="marquee-track" aria-hidden>
            {Array.from({ length: 2 }).map((_, k) => (
              <span key={k}>
                {Array.from({ length: 6 }).map((__, i) => (
                  <span key={i}>Ultra Black Lucrativa · Karen Talissa · 08/10 às 20h · </span>
                ))}
              </span>
            ))}
          </div>
        </div>
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

        <section className="sec3">
          <motion.h2 className="sec3-title" initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.4 }} transition={{ duration: 0.7, ease }}>
            Os <span className="gold-text">5 pilares</span> da Ultra Black
          </motion.h2>
          <div className="pillars">
            {PILARES.map((p, i) => (
              <motion.article key={p.n} className="pillar" initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.25 }} transition={{ duration: 0.7, ease, delay: (i % 3) * 0.1 }}>
                <div className="pillar-img">
                  {p.img ? <img src={p.img} alt={`${p.t1} ${p.t2}`} loading="lazy" /> : <div className="pillar-ph"><span>{p.icon}</span></div>}
                </div>
                <h3>
                  <span className="pillar-n gold-text">{p.n}</span>
                  <span className="pillar-t1">{p.t1}</span>
                  <span className="pillar-t2 gold-text">{p.t2}</span>
                </h3>
                <p>{p.text}</p>
              </motion.article>
            ))}
          </div>
          <motion.div className="sec3-cta" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <button type="button" className="btn-gold cta-big" onClick={openModal}>{COPY.cta} <Arrow /></button>
          </motion.div>
        </section>
        <div className="marquee" aria-label="Ultra Black Lucrativa · Karen Talissa · 08/10 às 20h">
          <div className="marquee-track" aria-hidden>
            {Array.from({ length: 2 }).map((_, k) => (
              <span key={k}>
                {Array.from({ length: 6 }).map((__, i) => (
                  <span key={i}>Ultra Black Lucrativa · Karen Talissa · 08/10 às 20h · </span>
                ))}
              </span>
            ))}
          </div>
        </div>

        <section className="sec2 sec4">
          <motion.div className="sec2-copy" initial={{ opacity: 0, x: -40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, amount: 0.3 }} transition={{ duration: 0.9, ease }}>
            <h2 className="sec2-title">Exclusivo pra <span className="gold-text">quem estiver ao vivo</span></h2>
            <p>A maior oferta que o mercado já viu...</p>
            <p>"Pra quem estiver presente na live, vai ter uma ultra-oferta exclusiva da Ultra Black Lucrativa, a menor condição que já fiz, além de ter a oportunidade de participar de um sorteio de um IPAD lacrado!</p>
            <img className="sec4-ipad" src="/img/ipad.webp" alt="iPad lacrado sorteado na live" loading="lazy" />
            <p>E os primeiros a entrar ainda levam bônus que não voltam em nenhum outro momento"</p>
            <p>Se tu tá cansada de toda Black ser só mais uma fatura, teu lugar é nessa live.</p>
            <button type="button" className="btn-gold cta-big" onClick={openModal}>Quero fazer minha pré-inscrição! <Arrow /></button>
          </motion.div>
          <motion.div className="sec2-media sec4-media" initial={{ opacity: 0, x: 40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, amount: 0.3 }} transition={{ duration: 0.9, ease, delay: 0.1 }}>
            <img src="/img/secao4.webp" alt="Karen ao vivo" loading="lazy" />
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
                <h2 id="modal-title" className="serif modal-title">Garanta sua vaga na <span className="gold-text">Ultra Black Lucrativa</span></h2>
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
                <div className="field">
                  <input id="email" type="email" inputMode="email" placeholder=" " autoComplete="email" value={form.email} onChange={set("email")} onBlur={() => setTouched((t) => ({ ...t, email: true }))} className={touched.email && errs.email ? "bad" : ""} />
                  <label htmlFor="email">Seu melhor e-mail</label>
                  {touched.email && errs.email && <small>{errs.email}</small>}
                </div>
                <input className="hp" tabIndex={-1} autoComplete="off" value={form.website} onChange={set("website")} aria-hidden />
                <button className="btn-gold full" disabled={status === "sending"}>
                  {status === "sending" ? <><span className="spinner" /> Garantindo sua vaga…</> : <>Confirmar minha vaga <Arrow /></>}
                </button>
                {error && <p className="error-msg">{error}</p>}
                <p className="legal modal-legal"><Lock /> Seus dados estão seguros. Ao se inscrever, você aceita receber mensagens sobre o evento.</p>
              </motion.form>
            </motion.div>
          )}
        </AnimatePresence>
    </>
  );
}
