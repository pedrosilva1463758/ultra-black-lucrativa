"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";

const ease = [0.22, 1, 0.36, 1];
const REDIRECT_SECONDS = 5;

// Link do grupo: variável NEXT_PUBLIC_WHATSAPP_GROUP_URL na Vercel
const WA_GROUP = process.env.NEXT_PUBLIC_WHATSAPP_GROUP_URL || "";

function WhatsIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.9 9.9 0 0 0 4.74 1.21h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2zm5.8 14.13c-.24.68-1.42 1.3-1.95 1.35-.5.05-.97.23-3.27-.68-2.77-1.09-4.52-3.92-4.66-4.1-.13-.18-1.11-1.48-1.11-2.82 0-1.34.7-2 .95-2.28.25-.27.54-.34.72-.34h.52c.17 0 .39-.06.6.46.23.54.77 1.87.84 2 .07.14.11.3.02.48-.09.18-.14.3-.27.46-.14.16-.29.36-.41.48-.14.14-.28.28-.12.56.16.27.71 1.17 1.52 1.9 1.05.93 1.93 1.22 2.2 1.36.27.13.43.11.59-.07.16-.18.68-.79.86-1.07.18-.27.36-.23.61-.14.25.09 1.57.74 1.84.88.27.13.45.2.52.31.07.11.07.66-.17 1.33z" />
    </svg>
  );
}

export default function ThankYouPage() {
  const params = useSearchParams();
  const [left, setLeft] = useState(REDIRECT_SECONDS);
  const [progress, setProgress] = useState(0);

  const pass = new URLSearchParams();
  ["nome", "whatsapp", "utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"].forEach((k) => { if (params.get(k)) pass.set(k, params.get(k)); });
  const checkinHref = `/checkin?${pass}`;

  useEffect(() => {
    const t = setTimeout(() => setProgress(90), 250);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!WA_GROUP) return;
    if (left <= 0) { window.location.href = WA_GROUP; return; }
    const t = setTimeout(() => setLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [left]);

  return (
    <main className="ty">
      <motion.div className="ty-alert" initial={{ y: -80 }} animate={{ y: 0 }} transition={{ duration: 0.6, ease }}>
        <span className="ty-alert-hi">Espere!</span> Sua inscrição ainda não está totalmente concluída.
      </motion.div>

      <section className="ty-body">
        <motion.div className="ty-progress" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.6, ease }}>
          <motion.div className="ty-progress-fill" initial={{ width: "8%" }} animate={{ width: `${progress}%` }} transition={{ duration: 1.6, ease }}>
            <span>{progress}%</span>
          </motion.div>
        </motion.div>

        <motion.div className="ty-kicker serif" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35, duration: 0.7, ease }}>
          <i /> Falta apenas <i />
        </motion.div>
        <motion.h1 className="ty-title serif gold-text" initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.45, duration: 0.8, ease }}>
          um passo!
        </motion.h1>

        <motion.p className="ty-text" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6, duration: 0.7 }}>
          Clique no <b>botão abaixo</b> e entre no <span>grupo VIP</span>. É por lá que eu mando o link da live e todos os avisos da Ultra Black.
        </motion.p>

        {WA_GROUP && <p className="ty-redirect">{left > 0 ? `Redirecionando em ${left}...` : "Abrindo o WhatsApp..."}</p>}
        <motion.a className="ty-wa" style={WA_GROUP ? undefined : { marginTop: 34 }} href={WA_GROUP || checkinHref} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.75, duration: 0.6, ease }}>
          <WhatsIcon /> Entrar no grupo VIP
        </motion.a>
      </section>
    </main>
  );
}
