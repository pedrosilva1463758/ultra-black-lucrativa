"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { QUESTIONS } from "@/lib/questions";
import { Download, Lock } from "./Icons";

const KEY_STORE = "ubf-admin-key";

const COLUMNS = [
  { key: "created_at", label: "Data", fmt: (v) => new Date(v).toLocaleString("pt-BR") },
  { key: "temperatura", label: "Temperatura" },
  { key: "lead_score", label: "Score" },
  { key: "nome", label: "Nome" },
  { key: "email", label: "E-mail" },
  { key: "whatsapp", label: "WhatsApp" },
  ...QUESTIONS.map((q, i) => ({ key: q.key, label: `${i + 1}. ${q.title}` })),
  { key: "maior_trava_outro", label: "6b. Trava (outro)" },
  { key: "tempo_preenchimento_seg", label: "Tempo de preenchimento (s)" },
  { key: "utm_source", label: "utm_source" },
  { key: "utm_medium", label: "utm_medium" },
  { key: "utm_campaign", label: "utm_campaign" },
  { key: "utm_content", label: "utm_content" },
  { key: "utm_term", label: "utm_term" },
  { key: "id", label: "ID" },
];

const cell = (row, col) => {
  const v = row[col.key];
  if (v == null) return "";
  if (Array.isArray(v)) return v.join(" | ");
  return col.fmt ? col.fmt(v) : String(v);
};

function toCSV(rows) {
  const esc = (s) => `"${String(s).replace(/"/g, '""')}"`;
  const head = COLUMNS.map((c) => esc(c.label)).join(";");
  const body = rows.map((r) => COLUMNS.map((c) => esc(cell(r, c))).join(";")).join("\r\n");
  return "﻿" + head + "\r\n" + body;
}

function Bars({ title, counts, total }) {
  const entries = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  return (
    <div className="panel">
      <h3>{title}</h3>
      {entries.map(([label, n]) => {
        const pct = total ? (n / total) * 100 : 0;
        return (
          <div className="bar-row" key={label}>
            <span>{label}</span>
            <em>{n} · {pct.toFixed(0)}%</em>
            <div className="track"><div style={{ width: `${pct}%` }} /></div>
          </div>
        );
      })}
    </div>
  );
}

export default function AdminPanel() {
  const [key, setKey] = useState("");
  const [authed, setAuthed] = useState(false);
  const [rows, setRows] = useState([]);
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [temp, setTemp] = useState("Todos");
  const [q, setQ] = useState("");
  const [sort, setSort] = useState({ key: "created_at", asc: false });

  const load = async (k) => {
    setLoading(true);
    setErr("");
    const { data, error } = await supabase.rpc("ubf_admin_list", { p_key: k });
    setLoading(false);
    if (error) {
      setErr(error.message.includes("chave") ? "Chave inválida." : "Erro ao carregar: " + error.message);
      setAuthed(false);
      return;
    }
    try { sessionStorage.setItem(KEY_STORE, k); } catch {}
    setRows(data || []);
    const lr = await supabase.rpc("ubf_admin_leads", { p_key: k });
    setLeads(lr.data || []);
    setAuthed(true);
  };

  useEffect(() => {
    let k = null;
    try { k = sessionStorage.getItem(KEY_STORE); } catch {}
    if (k) { setKey(k); load(k); }
  }, []);

  const filtered = useMemo(() => {
    let r = rows;
    if (temp !== "Todos") r = r.filter((x) => x.temperatura === temp);
    if (q.trim()) {
      const s = q.toLowerCase();
      r = r.filter((x) => COLUMNS.some((c) => cell(x, c).toLowerCase().includes(s)));
    }
    const dir = sort.asc ? 1 : -1;
    return [...r].sort((a, b) => {
      const va = a[sort.key], vb = b[sort.key];
      if (va == null) return 1;
      if (vb == null) return -1;
      return (va > vb ? 1 : va < vb ? -1 : 0) * dir;
    });
  }, [rows, temp, q, sort]);

  const stats = useMemo(() => {
    const n = filtered.length;
    const avg = (k) => (n ? filtered.reduce((s, r) => s + (r[k] || 0), 0) / n : 0);
    const today = new Date().toDateString();
    return {
      n,
      today: filtered.filter((r) => new Date(r.created_at).toDateString() === today).length,
      score: avg("lead_score"),
      hot: filtered.filter((r) => r.temperatura === "Quente").length,
      live: filtered.filter((r) => r.presenca_live === "Vou, já deixei o lembrete").length,
      nota: avg("nota_vontade"),
      time: avg("tempo_preenchimento_seg"),
    };
  }, [filtered]);

  const dist = useMemo(() => {
    return QUESTIONS.filter((x) => x.type === "single" || x.type === "multi" || x.type === "scale").map((qq) => {
      const counts = {};
      if (qq.type === "scale") for (let i = qq.min; i <= qq.max; i++) counts[String(i)] = 0;
      else qq.options.forEach((o) => (counts[o] = 0));
      filtered.forEach((r) => {
        const v = r[qq.key];
        (Array.isArray(v) ? v : [v]).forEach((x) => { if (x != null) counts[String(x)] = (counts[String(x)] || 0) + 1; });
      });
      return { title: qq.title, counts };
    });
  }, [filtered]);

  const downloadLeads = () => {
    const cols = [["created_at", "Data"], ["nome", "Nome"], ["email", "E-mail"], ["whatsapp", "WhatsApp"], ["email_status", "E-mail de parabéns"], ["inscricoes", "Nº inscrições"], ["utm_source", "utm_source"], ["utm_medium", "utm_medium"], ["utm_campaign", "utm_campaign"], ["utm_content", "utm_content"], ["utm_term", "utm_term"]];
    const esc = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const checked = new Set(rows.map((r) => (r.email || "").toLowerCase()));
    const csv = "\uFEFF" + [...cols.map((c) => c[1]), "Fez check-in"].map(esc).join(";") + "\r\n" +
      leads.map((l) => [...cols.map(([k]) => (k === "created_at" ? new Date(l[k]).toLocaleString("pt-BR") : l[k])), checked.has(l.email) ? "Sim" : "Não"].map(esc).join(";")).join("\r\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    a.download = `inscritos-ultra-black-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  const download = () => {
    const blob = new Blob([toCSV(filtered)], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `checkin-ultra-black-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  if (!authed) {
    return (
      <main className="admin">
        <form className="admin-login" onSubmit={(e) => { e.preventDefault(); load(key); }}>
          <div className="eyebrow" style={{ justifyContent: "center" }}><Lock /> Área restrita</div>
          <h1 style={{ marginTop: 12 }}>Painel do <span className="gold-text">Check-in</span></h1>
          <input className="other-input" type="password" placeholder="Chave de acesso" value={key} onChange={(e) => setKey(e.target.value)} autoFocus />
          <button className="btn-gold" disabled={!key || loading} style={{ width: "100%", justifyContent: "center" }}>{loading ? "Entrando…" : "Entrar"}</button>
          {err && <p className="error-msg">{err}</p>}
        </form>
      </main>
    );
  }

  const pct = (x) => (stats.n ? `${Math.round((x / stats.n) * 100)}%` : "0%");

  return (
    <main className="admin">
      <div className="admin-head">
        <div>
          <div className="eyebrow">Ultra Black Lucrativa</div>
          <h1 style={{ marginTop: 8 }}>Qualificação dos <span className="gold-text">leads</span></h1>
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button className="btn-outline" onClick={downloadLeads}><Download /> Inscritos ({leads.length})</button>
          <button className="btn-outline" onClick={() => load(key)}>{loading ? "Atualizando…" : "Atualizar"}</button>
          <button className="btn-gold" style={{ padding: "14px 22px" }} onClick={download}><Download /> Baixar planilha (CSV/Excel)</button>
        </div>
      </div>

      <div className="kpis">
        <div className="kpi"><small>Inscritos na captura</small><b>{leads.length}</b><span>{leads.filter((l) => (l.email_status || "").startsWith("enviado")).length} receberam o e-mail</span></div>
        <div className="kpi"><small>Taxa de check-in</small><b>{leads.length ? Math.round((rows.length / leads.length) * 100) : 0}%</b><span>check-ins ÷ inscritos</span></div>
        <div className="kpi"><small>Check-ins</small><b>{stats.n}</b><span>{stats.today} hoje</span></div>
        <div className="kpi"><small>Score médio</small><b>{stats.score.toFixed(0)}</b><span>de 0 a 100</span></div>
        <div className="kpi"><small>Leads quentes</small><b>{stats.hot}</b><span>{pct(stats.hot)} do total</span></div>
        <div className="kpi"><small>Confirmaram a live</small><b>{stats.live}</b><span>{pct(stats.live)} "já deixei o lembrete"</span></div>
        <div className="kpi"><small>Vontade média</small><b>{stats.nota.toFixed(1)}</b><span>nota de 0 a 10</span></div>
        <div className="kpi"><small>Tempo médio</small><b>{Math.round(stats.time / 60)}m{String(Math.round(stats.time % 60)).padStart(2, "0")}</b><span>pra preencher</span></div>
      </div>

      <div className="toolbar">
        <div className="seg">
          {["Todos", "Quente", "Morno", "Frio"].map((t) => (
            <button key={t} className={temp === t ? "on" : ""} onClick={() => setTemp(t)}>{t}</button>
          ))}
        </div>
        <input className="other-input" placeholder="Buscar em qualquer resposta…" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>

      <div className="panels">
        {dist.map((d) => <Bars key={d.title} title={d.title} counts={d.counts} total={stats.n} />)}
        <div className="panel" style={{ gridColumn: "span 2", maxHeight: 520, overflow: "auto" }}>
          <h3>Perguntas pra live ({filtered.length})</h3>
          {filtered.map((r) => (
            <p key={r.id} style={{ fontSize: 14, lineHeight: 1.55, padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,.06)" }}>
              <span className={`tag ${r.temperatura}`} style={{ marginRight: 8 }}>{r.lead_score}</span>{r.pergunta_live}
            </p>
          ))}
        </div>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              {COLUMNS.map((c) => (
                <th key={c.key} onClick={() => setSort((s) => ({ key: c.key, asc: s.key === c.key ? !s.asc : false }))} title={c.label}>
                  {c.label.length > 38 ? c.label.slice(0, 36) + "…" : c.label}{sort.key === c.key ? (sort.asc ? " ↑" : " ↓") : ""}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r.id}>
                {COLUMNS.map((c) => (
                  <td key={c.key}>{c.key === "temperatura" ? <span className={`tag ${r.temperatura}`}>{r.temperatura}</span> : cell(r, c)}</td>
                ))}
              </tr>
            ))}
            {!filtered.length && <tr><td colSpan={COLUMNS.length} style={{ color: "var(--muted)", padding: 30 }}>Nenhum check-in ainda.</td></tr>}
          </tbody>
        </table>
      </div>
    </main>
  );
}
