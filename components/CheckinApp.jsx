"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { STEPS, QUESTIONS, TOTAL_QUESTIONS, EVENT } from "@/lib/questions";
import { supabase } from "@/lib/supabase";
import { Arrow, Back, Calendar, Check, Clock, Download, List, Lock } from "./Icons";

const DRAFT_KEY = "ubf-checkin-draft-v1";
const LETTERS = "ABCDEFGHIJ";

const SCALE_FEEDBACK = [
  "Tudo bem, a curiosidade já é o primeiro passo.",
  "Tudo bem, a curiosidade já é o primeiro passo.",
  "Tá chegando devagarinho…",
  "Tá chegando devagarinho…",
  "Já tem uma vontadezinha aí.",
  "Metade do caminho já é alguma coisa!",
  "Opa, tá ficando sério.",
  "Gostei dessa energia.",
  "Isso! Bora fazer acontecer.",
  "Quase lá… dá pra sentir a decisão.",
  "Decidida! Te espero no dia 08.",
];

const safeStorage = {
  get(k) { try { return JSON.parse(localStorage.getItem(k)); } catch { return null; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
  del(k) { try { localStorage.removeItem(k); } catch {} },
};

function isAnswered(step, answers) {
  const v = answers[step.key];
  if (step.optional) return true;
  if (step.type === "single") {
    if (!v) return false;
    if (step.other && v === step.other.option) return !!(answers[step.other.key] || "").trim();
    return true;
  }
  if (step.type === "multi") return Array.isArray(v) && v.length > 0;
  if (step.type === "scale") return typeof v === "number";
  if (step.type === "text") return !!(v || "").trim();
  return true;
}

/* ---------------- Ambient ---------------- */
function Ambient() {
  const [dust, setDust] = useState([]);
  useEffect(() => {
    setDust(
      Array.from({ length: 26 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        bottom: -10 - Math.random() * 20,
        size: 1 + Math.random() * 2.5,
        dur: 9 + Math.random() * 14,
        delay: -Math.random() * 20,
      }))
    );
  }, []);
  return (
    <>
      <div className="ambient" aria-hidden>
        {dust.map((d) => (
          <span key={d.id} className="dust" style={{ left: `${d.left}%`, bottom: `${d.bottom}%`, width: d.size, height: d.size, animationDuration: `${d.dur}s`, animationDelay: `${d.delay}s` }} />
        ))}
      </div>
      <div className="grain" aria-hidden />
    </>
  );
}

/* ---------------- Countdown ---------------- */
function Countdown() {
  const [left, setLeft] = useState(null);
  useEffect(() => {
    const target = new Date(EVENT.startISO).getTime();
    const tick = () => setLeft(Math.max(0, target - Date.now()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  if (left === null || left === 0) return null;
  const d = Math.floor(left / 864e5), h = Math.floor((left % 864e5) / 36e5), m = Math.floor((left % 36e5) / 6e4), s = Math.floor((left % 6e4) / 1e3);
  const box = (v, l) => (
    <div className="cd-box"><b>{String(v).padStart(2, "0")}</b><small>{l}</small></div>
  );
  return <div className="countdown" aria-label="Contagem regressiva para a live">{box(d, "dias")}{box(h, "horas")}{box(m, "min")}{box(s, "seg")}</div>;
}

/* ---------------- Landing ---------------- */
function Landing({ onStart, hasDraft }) {
  const fade = (i) => ({ initial: { opacity: 0, y: 24 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.15 + i * 0.1, duration: 0.8, ease: [0.22, 1, 0.36, 1] } });
  return (
    <main className="landing">
      <section className="hero">
        <motion.div className="hero-media" initial={{ opacity: 0, scale: 1.06 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1] }}>
          <img src="/img/hero-mobile.jpg" alt="Karen com cofre dourado e ampulheta" />
        </motion.div>
        <div className="hero-copy">
          <motion.div className="eyebrow" {...fade(0)}>Check-in</motion.div>
          <motion.h1 className="hero-title serif" {...fade(1)}>
            <span>Ultra Black</span>
            <span className="gold-text">Lucrativa</span>
          </motion.h1>
          <motion.div className="date-chip" {...fade(2)}><Calendar /> {EVENT.dateLabel}</motion.div>
          <motion.div {...fade(3)}><Countdown /></motion.div>
          <motion.div className="letter" {...fade(4)}>
            <p>Oi! Que bom que você tá aqui.</p>
            <p>Antes do dia 08, eu quero te conhecer melhor. São umas perguntas rapidinhas, leva uns 5 minutos, e cada resposta me ajuda a preparar a Ultra Black Friday do jeito que faz sentido pra você. As dúvidas que mais aparecerem aqui, eu respondo ao vivo.</p>
            <p>Só eu e a minha equipe vamos ler as suas respostas.</p>
            <p className="sign">Karen &lt;3</p>
          </motion.div>
          <motion.div className="cta-row" {...fade(5)}>
            <button className="btn-gold" onClick={onStart} autoFocus>
              {hasDraft ? "Continuar meu check-in" : "Fazer meu check-in"} <Arrow />
            </button>
            <span className="meta-row" style={{ gap: 8 }}><span>aperte <kbd>Enter ↵</kbd></span></span>
          </motion.div>
          <motion.div className="meta-row" style={{ marginTop: 22 }} {...fade(6)}>
            <span><Clock /> ~5 minutos</span>
            <span><List /> {TOTAL_QUESTIONS} perguntas</span>
            <span><Lock /> Respostas privadas</span>
          </motion.div>
        </div>
      </section>
    </main>
  );
}

/* ---------------- Question renderers ---------------- */
function SingleChoice({ step, value, otherValue, onPick, onOther, blinkOpt }) {
  const otherRef = useRef(null);
  useEffect(() => {
    if (step.other && value === step.other.option) setTimeout(() => otherRef.current?.focus(), 60);
  }, [value, step.other]);
  const twoCol = step.options.length >= 7;
  return (
    <>
      <div className={`options ${twoCol ? "two-col" : ""}`} role="radiogroup">
        {step.options.map((opt, i) => {
          const sel = value === opt;
          return (
            <motion.button
              key={opt}
              type="button"
              role="radio"
              aria-checked={sel}
              className={`option ${sel ? "selected" : ""} ${blinkOpt === opt ? "blink" : ""}`}
              onClick={() => onPick(opt)}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12 + i * 0.04, duration: 0.45 }}
            >
              <span className="key">{LETTERS[i]}</span>
              <span>{opt === "Outro" ? "Outro…" : opt}</span>
              <span className="check">{sel && <Check />}</span>
            </motion.button>
          );
        })}
      </div>
      <AnimatePresence>
        {step.other && value === step.other.option && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
            <input
              ref={otherRef}
              className="other-input"
              placeholder={step.other.placeholder}
              value={otherValue || ""}
              maxLength={500}
              onChange={(e) => onOther(e.target.value)}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function MultiChoice({ step, value = [], onToggle }) {
  return (
    <div className="options" role="group">
      {step.options.map((opt, i) => {
        const sel = value.includes(opt);
        return (
          <motion.button
            key={opt}
            type="button"
            role="checkbox"
            aria-checked={sel}
            className={`option multi ${sel ? "selected" : ""}`}
            onClick={() => onToggle(opt)}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 + i * 0.04, duration: 0.45 }}
          >
            <span className="key">{LETTERS[i]}</span>
            <span>{opt}</span>
            <span className="check">{sel && <Check />}</span>
          </motion.button>
        );
      })}
    </div>
  );
}

function Scale({ step, value, onPick }) {
  const nums = Array.from({ length: step.max - step.min + 1 }, (_, i) => step.min + i);
  return (
    <>
      <div className="scale" role="radiogroup">
        {nums.map((n, i) => (
          <motion.button
            key={n}
            type="button"
            role="radio"
            aria-checked={value === n}
            className={value === n ? "on" : typeof value === "number" && n < value ? "fill" : ""}
            onClick={() => onPick(n)}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.03 }}
          >
            {n}
          </motion.button>
        ))}
      </div>
      <div className="scale-labels"><span>{step.minLabel}</span><span>{step.maxLabel}</span></div>
      <div className="scale-feedback">
        <AnimatePresence mode="wait">
          {typeof value === "number" && (
            <motion.div key={value} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}>
              {SCALE_FEEDBACK[value]}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}

function TextAnswer({ step, value, onChange }) {
  const ref = useRef(null);
  useEffect(() => { setTimeout(() => ref.current?.focus(), 350); }, [step.key]);
  return (
    <>
      <textarea
        ref={ref}
        className="text-input"
        placeholder={step.placeholder}
        value={value || ""}
        maxLength={step.maxLength}
        onChange={(e) => onChange(e.target.value)}
      />
      <div className="char-count">{(value || "").length}/{step.maxLength}</div>
    </>
  );
}

/* ---------------- Done ---------------- */
function icsHref() {
  const f = (iso) => iso.replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const ics = [
    "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//UltraBlack//Checkin//PT", "BEGIN:VEVENT",
    `UID:ultra-black-${f(EVENT.startISO)}@checkin`, `DTSTAMP:${f(new Date().toISOString())}`,
    `DTSTART:${f(EVENT.startISO)}`, `DTEND:${f(EVENT.endISO)}`,
    "SUMMARY:Ultra Black Lucrativa · Live com a Karen", "DESCRIPTION:Live Ultra Black Lucrativa às 20h (horário de Brasília).",
    "BEGIN:VALARM", "TRIGGER:-PT30M", "ACTION:DISPLAY", "DESCRIPTION:A live começa em 30 minutos!", "END:VALARM",
    "END:VEVENT", "END:VCALENDAR",
  ].join("\r\n");
  return "data:text/calendar;charset=utf-8," + encodeURIComponent(ics);
}
function gcalHref() {
  const f = (iso) => iso.replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const p = new URLSearchParams({
    action: "TEMPLATE",
    text: "Ultra Black Lucrativa · Live com a Karen",
    dates: `${f(EVENT.startISO)}/${f(EVENT.endISO)}`,
    details: "Live Ultra Black Lucrativa às 20h (horário de Brasília).",
  });
  return `https://calendar.google.com/calendar/render?${p}`;
}

function Confetti() {
  const [bits, setBits] = useState([]);
  useEffect(() => {
    const colors = ["#fbe39a", "#e9b24f", "#c47f2c", "#fff4d0"];
    setBits(Array.from({ length: 90 }, (_, i) => ({ id: i, left: Math.random() * 100, delay: Math.random() * 0.8, dur: 2.4 + Math.random() * 2.2, color: colors[i % 4], rot: Math.random() * 360 })));
  }, []);
  return <div className="confetti" aria-hidden>{bits.map((b) => <i key={b.id} style={{ left: `${b.left}%`, background: b.color, animationDelay: `${b.delay}s`, animationDuration: `${b.dur}s`, transform: `rotate(${b.rot}deg)` }} />)}</div>;
}

function Done() {
  return (
    <main className="form-shell">
      <Confetti />
      <div className="stage" style={{ paddingBottom: 60 }}>
        <motion.div className="done" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}>
          <motion.div className="seal" initial={{ scale: 0, rotate: -90 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", stiffness: 180, damping: 14, delay: 0.2 }}>
            <Check width={40} height={40} />
          </motion.div>
          <div className="eyebrow" style={{ justifyContent: "center" }}>Check-in feito</div>
          <h1 style={{ marginTop: 14 }}>Pronto, <span className="gold-text">recebi tudo!</span></h1>
          <p>Obrigada por separar esse tempinho pra mim. Eu vou ler com carinho e preparar a Ultra Black Friday pensando em você.</p>
          <p>Agora o mais importante: <b style={{ color: "var(--gold-1)" }}>não perde a live</b>. Deixa o lembrete na sua agenda.</p>
          <div className="date-chip" style={{ marginTop: 26 }}><Calendar /> {EVENT.dateLabel}</div>
          <div className="actions">
            <a className="btn-gold" href={gcalHref()} target="_blank" rel="noreferrer">Salvar no Google Agenda <Arrow /></a>
            <a className="btn-outline" href={icsHref()} download="ultra-black-lucrativa.ics"><Download /> Apple / Outlook</a>
          </div>
          <p className="sign serif" style={{ fontStyle: "italic", fontSize: 22, color: "var(--gold-1)", marginTop: 34 }}>Karen &lt;3</p>
        </motion.div>
      </div>
    </main>
  );
}

/* ---------------- Main ---------------- */
export default function CheckinApp() {
  const [phase, setPhase] = useState("landing");
  const [idx, setIdx] = useState(0);
  const [dir, setDir] = useState(1);
  const [answers, setAnswers] = useState({});
  const [meta, setMeta] = useState({});
  const [hasDraft, setHasDraft] = useState(false);
  const [blinkOpt, setBlinkOpt] = useState(null);
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const startedAt = useRef(null);
  const advanceTimer = useRef(null);

  const step = STEPS[idx];
  const qNumber = useMemo(() => STEPS.slice(0, idx + 1).filter((s) => s.type !== "section").length, [idx]);
  const answeredCount = QUESTIONS.filter((q) => !q.optional && isAnswered(q, answers)).length;
  const progress = answeredCount / QUESTIONS.filter((q) => !q.optional).length;
  const isLast = idx === STEPS.length - 1;

  // Load draft + URL params
  useEffect(() => {
    const d = safeStorage.get(DRAFT_KEY);
    if (d && d.answers && Object.keys(d.answers).length) {
      setAnswers(d.answers);
      setIdx(Math.min(d.idx || 0, STEPS.length - 1));
      startedAt.current = d.startedAt || null;
      setHasDraft(true);
    }
    const p = new URLSearchParams(window.location.search);
    const m = {};
    ["nome", "email", "whatsapp", "utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"].forEach((k) => {
      const v = p.get(k) || (k === "nome" ? p.get("name") : k === "whatsapp" ? p.get("phone") || p.get("telefone") : null);
      if (v) m[k] = v.slice(0, 200);
    });
    setMeta(m);
  }, []);

  // Save draft
  useEffect(() => {
    if (phase === "form") safeStorage.set(DRAFT_KEY, { answers, idx, startedAt: startedAt.current });
  }, [answers, idx, phase]);

  useEffect(() => () => clearTimeout(advanceTimer.current), []);

  const start = () => {
    if (!startedAt.current) startedAt.current = Date.now();
    setPhase("form");
    window.scrollTo({ top: 0 });
  };

  const go = useCallback((delta) => {
    clearTimeout(advanceTimer.current);
    setError("");
    setDir(delta);
    setIdx((i) => Math.max(0, Math.min(STEPS.length - 1, i + delta)));
  }, []);

  const sendingRef = useRef(false);
  const submit = useCallback(async () => {
    if (sendingRef.current) return;
    const missing = QUESTIONS.findIndex((q) => !isAnswered(q, answers));
    if (missing !== -1) {
      const target = STEPS.indexOf(QUESTIONS[missing]);
      setDir(target > idx ? 1 : -1);
      setIdx(target);
      setError("Faltou responder esta pergunta.");
      return;
    }
    sendingRef.current = true;
    setSending(true);
    setError("");
    const row = {
      ...meta,
      ...Object.fromEntries(QUESTIONS.map((q) => [q.key, answers[q.key] ?? null])),
      maior_trava_outro: answers.maior_trava === "Outro" ? (answers.maior_trava_outro || "").trim() : null,
      pergunta_live: (answers.pergunta_live || "").trim(),
      comentario_extra: (answers.comentario_extra || "").trim() || null,
      tempo_preenchimento_seg: startedAt.current ? Math.round((Date.now() - startedAt.current) / 1000) : null,
      user_agent: navigator.userAgent.slice(0, 300),
    };
    const { error: err } = await supabase.from("ubf_checkins").insert(row);
    if (err) {
      sendingRef.current = false;
      setSending(false);
      console.error(err);
      setError("Não consegui enviar agora. Confere sua internet e tenta de novo.");
      return;
    }
    safeStorage.del(DRAFT_KEY);
    setPhase("done");
  }, [answers, meta, idx]);

  const next = useCallback(() => {
    if (step.type !== "section" && !isAnswered(step, answers)) {
      setError(step.type === "multi" ? "Marca pelo menos uma opção." : "Responde essa pra gente seguir.");
      return;
    }
    if (isLast) submit();
    else go(1);
  }, [step, answers, isLast, submit, go]);

  const setAnswer = (key, val) => { setError(""); setAnswers((a) => ({ ...a, [key]: val })); };

  const pickSingle = (opt) => {
    setAnswer(step.key, opt);
    if (step.other && opt === step.other.option) return;
    setBlinkOpt(opt);
    clearTimeout(advanceTimer.current);
    advanceTimer.current = setTimeout(() => { setBlinkOpt(null); go(1); }, 420);
  };
  const toggleMulti = (opt) => {
    const cur = answers[step.key] || [];
    let nextVal;
    if (cur.includes(opt)) nextVal = cur.filter((o) => o !== opt);
    else if (step.exclusive && opt === step.exclusive) nextVal = [opt];
    else nextVal = [...cur.filter((o) => o !== step.exclusive), opt];
    setAnswer(step.key, nextVal);
  };
  const pickScale = (n) => {
    setAnswer(step.key, n);
    clearTimeout(advanceTimer.current);
    advanceTimer.current = setTimeout(() => go(1), 1100);
  };

  // Keyboard
  useEffect(() => {
    const onKey = (e) => {
      if (phase === "landing" && e.key === "Enter") { e.preventDefault(); start(); return; }
      if (phase !== "form") return;
      const tag = e.target.tagName;
      const typing = tag === "TEXTAREA" || tag === "INPUT";
      if (e.key === "Enter") {
        if (tag === "TEXTAREA" && !(e.metaKey || e.ctrlKey)) return;
        e.preventDefault();
        next();
        return;
      }
      if (typing || e.metaKey || e.ctrlKey || e.altKey) return;
      if ((step.type === "single" || step.type === "multi")) {
        const i = LETTERS.indexOf(e.key.toUpperCase());
        if (i >= 0 && i < step.options.length) {
          step.type === "single" ? pickSingle(step.options[i]) : toggleMulti(step.options[i]);
        }
      }
      if (step.type === "scale" && /^[0-9]$/.test(e.key)) {
        const cur = answers[step.key];
        pickScale(e.key === "0" && cur === 1 ? 10 : Number(e.key));
      }
      if (e.key === "ArrowLeft" && idx > 0) go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  if (phase === "landing") return (<><Ambient /><Landing onStart={start} hasDraft={hasDraft} /></>);
  if (phase === "done") return (<><Ambient /><Done /></>);

  const variants = {
    enter: (d) => ({ opacity: 0, y: d > 0 ? 50 : -50, filter: "blur(6px)" }),
    center: { opacity: 1, y: 0, filter: "blur(0px)" },
    exit: (d) => ({ opacity: 0, y: d > 0 ? -50 : 50, filter: "blur(6px)" }),
  };

  const needsButton = step.type !== "single" || (step.other && answers[step.key] === step.other.option);

  return (
    <>
      <Ambient />
      <main className="form-shell">
        <header className="topbar">
          <div className="brand">
            <img src="/img/hero-mobile.jpg" alt="" />
            <div><b>Ultra Black <span className="gold-text">Lucrativa</span></b><small>Check-in · {EVENT.dateLabel}</small></div>
          </div>
          <div className="progress-wrap">
            <div className="progress"><motion.div animate={{ width: `${Math.max(3, progress * 100)}%` }} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }} /></div>
            <span className="progress-label">{Math.round(progress * 100)}%</span>
          </div>
        </header>

        <div className="stage">
          <AnimatePresence mode="wait" custom={dir}>
            <motion.div
              key={idx}
              className="card"
              custom={dir}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            >
              {step.type === "section" ? (
                <div className="section-card">
                  <div className="eyebrow">{step.eyebrow}</div>
                  <h2 className="big">{step.title.split(" ").slice(0, -1).join(" ")} <span className="gold-text">{step.title.split(" ").slice(-1)}</span></h2>
                  <div className="section-line" />
                  <p>{step.text}</p>
                </div>
              ) : (
                <>
                  <div className="q-number"><span className="pill">{String(qNumber).padStart(2, "0")} / {TOTAL_QUESTIONS}</span>{step.optional && <span style={{ color: "var(--muted)" }}>opcional</span>}</div>
                  <h2 className="q-title">{step.title}{!step.optional && <span className="req">*</span>}</h2>
                  <p className={`q-hint ${step.hint ? "" : "empty"}`}>{step.hint || (step.type === "single" ? "Escolha uma opção." : "")}</p>
                  {step.type === "single" && (
                    <SingleChoice step={step} value={answers[step.key]} otherValue={step.other && answers[step.other.key]} onPick={pickSingle} onOther={(v) => setAnswer(step.other.key, v)} blinkOpt={blinkOpt} />
                  )}
                  {step.type === "multi" && <MultiChoice step={step} value={answers[step.key]} onToggle={toggleMulti} />}
                  {step.type === "scale" && <Scale step={step} value={answers[step.key]} onPick={pickScale} />}
                  {step.type === "text" && <TextAnswer step={step} value={answers[step.key]} onChange={(v) => setAnswer(step.key, v)} />}
                </>
              )}
              <AnimatePresence>{error && <motion.p className="error-msg" initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: [0, -6, 6, -3, 0] }} exit={{ opacity: 0 }}>{error}</motion.p>}</AnimatePresence>
            </motion.div>
          </AnimatePresence>
        </div>

        <nav className="footer-nav">
          <div className="footer-inner">
            <button className="btn-ghost" onClick={() => (idx === 0 ? setPhase("landing") : go(-1))}><Back /> Voltar</button>
            <span className="hint">
              {step.type === "text" ? <><kbd>⌘</kbd>+<kbd>Enter ↵</kbd> pra seguir</> : step.type === "single" || step.type === "multi" ? <>Use as teclas <kbd>A</kbd><kbd>B</kbd><kbd>C</kbd>… e <kbd>Enter ↵</kbd></> : <>aperte <kbd>Enter ↵</kbd></>}
            </span>
            {(needsButton || step.type === "section" || answers[step.key]) && (
              <button className="btn-gold" style={{ padding: "14px 24px" }} onClick={next} disabled={sending}>
                {sending ? "Enviando…" : isLast ? "Enviar check-in" : step.type === "section" ? "Bora" : "Continuar"} <Arrow />
              </button>
            )}
          </div>
        </nav>
      </main>
    </>
  );
}
