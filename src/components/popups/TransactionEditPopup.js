// src/components/popups/TransactionEditPopup.js
import React, { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import styled, { useTheme } from "styled-components";
import * as Lucide from "lucide-react";

/* ================== Overlay & Card ================== */
const Backdrop = styled.div`
  position: fixed; inset: 0;
  z-index: 3000;
  background: rgba(0,0,0,.5);
  backdrop-filter: blur(12px);
  display: grid;
  place-items: center;
  overflow: auto;
  padding: 5vh 12px;      /* spazio sopra e sotto */
`;

const Card = styled.div`
  width: min(1080px, 96vw);      /* più largo */
  max-height: 90vh;              /* ben centrato */
  overflow: auto;
  background: ${({theme})=>theme.card}; color: ${({theme})=>theme.text};
  border-radius: 14px; padding: 14px; box-shadow: 0 10px 24px rgba(0,0,0,.4);
  display: grid; gap: 10px;
`;

/* ================== Tooltip “i” ================== */
const HintWrap = styled.span`
  position: relative; display:inline-flex; align-items:center; justify-content:center;
  width:20px; height:20px; border-radius:999px; margin-left:6px;
  background:${({theme})=>theme.cardHover}; border:1px solid ${({theme})=>theme.separator};
  font-size:.8rem; font-weight:700; line-height:1; cursor:default; user-select:none;
  &:hover > div{ opacity:1; transform:translateY(0); pointer-events:auto; }
`;
const HintPop = styled.div`
  position:absolute; top:calc(100% + 8px); left:0; z-index:9999;
  width: clamp(260px, 48vw, 420px);
  padding:10px 12px; border-radius:10px;
  background:${({theme})=>theme.flyoutSolid}; color:${({theme})=>theme.text};
  border:1px solid ${({theme})=>theme.separator}; box-shadow:0 10px 24px rgba(0,0,0,.28);
  opacity:0; transform:translateY(-4px); transition:.12s ease;
  font-size:.9rem; line-height:1.35; white-space: normal;
`;

/* ================== Flyout comuni (scuri) ================== */
const TagSuggestBox = styled.div`
  position: absolute; z-index: 9999; left: 0; right: 0; margin-top: 6px;
  border-radius: 10px; padding: 8px;
  background:${({theme})=>theme.flyoutSolid || "#0F2F35"};
  color: ${({theme})=>theme.text};
  border: 1px solid ${({theme})=>theme.separator};
  box-shadow: 0 14px 30px rgba(0,0,0,.35);

  .row{
    display:flex; align-items:center; justify-content:space-between;
    gap:8px; padding:6px 8px; border-radius:8px; cursor:pointer;
  }
  .row:hover{ background: ${({theme})=>theme.cardHover}; }
  .count{ opacity:.7; font-size:.85rem; }
`;
const AttachMenu = styled.div`
  position: absolute; z-index: 1200; right: 0; top: 36px;
  background:${({theme})=>theme.flyoutSolid}; color:${({theme})=>theme.text};
  border:1px solid ${({theme})=>theme.separator}; border-radius:10px;
  box-shadow:0 12px 28px rgba(0,0,0,.35);
  padding:6px; min-width: 260px; display:grid; gap:4px;
`;
const BenefSuggestBox = styled.div`
  position:absolute; z-index:1100; left:0; right:0; top: calc(100% + 6px);
  background:${({theme})=>theme.flyoutSolid || "#0F2F35"};
  border:1px solid ${({theme})=>theme.separator};
  border-radius:10px; box-shadow:0 12px 28px rgba(0,0,0,.30); padding:6px;
  max-height:240px; overflow:auto; display:grid; gap:4px;
  .row{display:flex;justify-content:space-between;gap:8px;align-items:center;cursor:pointer;padding:6px 8px;border-radius:8px;}
  .row:hover{background:${({theme})=>theme.cardHover};}
  small{opacity:.65;}
  .foot{display:flex;gap:8px;justify-content:flex-end;padding-top:6px;border-top:1px solid ${({theme})=>theme.separator};}
`;

const InlineNote = styled.div`font-size:.8rem; opacity:.75;`;

/* ================== Form layout ================== */
const Row = styled.div`
  display: grid; grid-template-columns: 1fr 1fr; gap: 8px;
  @media(max-width:720px){grid-template-columns:1fr;}
`;

const RowTypeDate = styled.div`
  display:grid; grid-template-columns: 1fr 2fr 1fr; gap:8px;
  @media(max-width:860px){grid-template-columns:1fr;}
`;

const Field = styled.label`display: grid; gap: 4px; font-size: .85rem;`;
const Input = styled.input`
  border:1px solid ${({theme})=>theme.separator||"rgba(255,255,255,.18)"};
  background:${({theme})=>theme.cardHover||"rgba(255,255,255,.06)"}; color:inherit;
  border-radius:10px; padding:8px;
`;
const Select = styled.select`
  border:1px solid ${({theme})=>theme.separator};
  background:${({theme})=>theme.card};
  color:inherit; border-radius:10px; padding:8px;
  &:focus{ outline:none; box-shadow:0 0 0 2px ${({theme})=>theme.accent || "#61d095"}33; }
`;
const Footer = styled.div`display:flex; justify-content:flex-end; gap:8px; margin-top: 6px;`;
const Btn = styled.button`
  border:0; border-radius:10px; padding:8px 12px; cursor:pointer;
  background:${({theme})=>theme.cardHover||"rgba(255,255,255,.1)"}; color:inherit;
`;

/* ================== Helpers ================== */
const parseDateEU = (s) => {
  if (!s) return null;
  // accetta anche: "Tuesday 02/07/2025 08:51"
  const m = String(s).match(/(\w+)?\s*(\d{2})\/(\d{2})\/(\d{4})\s+(\d{2}):(\d{2})/);
  if (!m) return null;
  const [, , dd, mm, yyyy, HH, MM] = m;
  return new Date(+yyyy, +mm - 1, +dd, +HH, +MM);
};
const toISOforInput = (d) => {
  if (!(d instanceof Date) || isNaN(d)) return "";
  const pad = (n)=>String(n).padStart(2,"0");
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};
const evalMath = (s) => {
  if (!/^[0-9+\-*/().,\s]+$/.test(s)) return NaN;
  const cleaned = String(s).replace(",", ".");
  try { return Function(`"use strict";return (${cleaned})`)(); } catch { return NaN; }
};

// Normalizzazioni
const asStr = (v) => {
  if (v == null) return "";
  if (typeof v === "string" || typeof v === "number") return String(v);
  if (typeof v === "boolean") return v ? "true" : "false";
  if (typeof v === "object") return String(v.name ?? v.label ?? v.id ?? "");
  return "";
};
const normTags = (arr) => Array.isArray(arr) ? arr.map(asStr).filter(Boolean) : [];

// Accounts catalog
const useAccountCatalog = (accounts) => {
  const catalog = useMemo(
    () => (accounts || []).map(a => ({
      id:   asStr(a?.id ?? a?.name ?? a),
      name: asStr(a?.name ?? a?.id  ?? a),
    })),
    [accounts]
  );
  const toName = useCallback((val) => {
    const s = asStr(val);
    const hit = catalog.find(x => x.id === s || x.name === s);
    return hit ? hit.name : s;
  }, [catalog]);
  const options = useMemo(() => catalog.map(x => x.name).filter(Boolean), [catalog]);
  return { toName, options };
};

/* ================== Component ================== */
export default function TransactionEditPopup({
  tx,
  accounts = [],
  categories = [],
  transactions = [],
  beneficiaries = [],
  onClose,
  onSave,
  onAddBeneficiary, // opzionale
  mode   // "create" | "edit"
}) {
  const theme = useTheme();

  // Normalizza subito il tx
  const normalizedTx = useMemo(() => ({
    ...tx,
    type:         asStr(tx?.type),
    beneficiary:  asStr(tx?.beneficiary),
    accountId:    asStr(tx?.accountId),
    accountTo:    asStr(tx?.accountTo),
    categoryId:   asStr(tx?.categoryId),
    categoryName: asStr(tx?.categoryName),
    subcategory:  asStr(tx?.subcategory),
    comment:      asStr(tx?.comment),
    tag:          normTags(tx?.tag),
  }), [tx]);

  // Account: value/label = name
  const { toName: accountNameOf, options: accountOptions } = useAccountCatalog(accounts);

  // Date defaults
  const initialDate = useMemo(()=> parseDateEU(tx?.date) || new Date(), [tx]);
  const initialISO  = useMemo(()=> toISOforInput(initialDate), [initialDate]);
  const initialCompetence = useMemo(()=> (tx?.competenceMonth || (initialISO ? initialISO.slice(0,7) : "")), [tx, initialISO]);

  const [form, setForm] = useState(() => ({
    ...normalizedTx,
    accountId: accountNameOf(normalizedTx?.accountId),
    accountTo: accountNameOf(normalizedTx?.accountTo),
    importo: Number(normalizedTx?.importo) || 0,
    dateISO: initialISO,
    competenceMonth: initialCompetence,
    attachments: Array.isArray(normalizedTx.attachments) ? normalizedTx.attachments : []
  }));
  const set = (k,v)=>setForm(f=>({...f,[k]:v}));

  // Blocca scroll e ESC per chiudere
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e) => { if (e.key === "Escape") onClose?.(); };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  // Importo: raw + sync
  const [amountRaw, setAmountRaw] = useState(() => {
    const n = Number(normalizedTx?.importo);
    return Number.isFinite(n) ? String(n) : "";
  });
  useEffect(() => {
    const n = Number(form.importo);
    setAmountRaw(Number.isFinite(n) ? String(n) : "");
  }, [form.importo]);

  // Categorie locali (per “+ nuova”)
  const [localCats, setLocalCats] = useState(categories || []);

  /* ========== TAG: conteggi/suggerimenti come ARRAY ========== */
  const [tagQ, setTagQ] = useState("");
  const [tagBoxOpen, setTagBoxOpen] = useState(false);
  const tagInputRef = useRef(null);

  const tagCountsArr = useMemo(() => {
    const m = new Map();
    (transactions || []).forEach(t => {
      const list = Array.isArray(t.tag) ? t.tag : (t.tag ? String(t.tag).split(",") : []);
      list.forEach(raw => {
        const k = String(raw).trim();
        if (!k) return;
        m.set(k, (m.get(k) || 0) + 1);
      });
    });
    const arr = Array.from(m.entries()).map(([name, count]) => ({ name, count }));
    arr.sort((a,b) => (b.count - a.count) || a.name.localeCompare(b.name));
    return arr;
  }, [transactions]);

  const tagSugg = useMemo(() => {
    const q = tagQ.trim().toLowerCase();
    if (!q) return tagCountsArr.slice(0, 12);
    return tagCountsArr.filter(x => x.name.toLowerCase().includes(q)).slice(0, 12);
  }, [tagCountsArr, tagQ]);

  const addTag = (name) => {
    const t = String(name || "").trim();
    if (!t) return;
    const list = Array.isArray(form.tag) ? form.tag : [];
    if (!list.includes(t)) set("tag", [...list, t]);
    setTagQ("");
  };

  /* ========== Beneficiario: suggerimenti/contatori ========== */
  const [benefSOpen, setBenefSOpen] = useState(false);
  const beneficiaryStats = useMemo(()=>{
    const m = new Map(); const last = new Map();
    (transactions||[]).forEach(t=>{
      const b = String(t.beneficiary||"").trim(); if(!b) return;
      m.set(b, (m.get(b)||0)+1);
      const ts = new Date(t.date||Date.now()).getTime();
      if (!last.has(b) || ts>last.get(b)) last.set(b, ts);
    });
    const byCount = Array.from(m.entries()).sort((a,b)=>b[1]-a[1]).map(([b,c])=>({b,c}));
    const recent = Array.from(last.entries()).sort((a,b)=>b[1]-a[1]).map(([b])=>b).slice(0,6);
    return { byCount, recent, countOf:(x)=>m.get(x)||0 };
  }, [transactions]);

  const addBeneficiary = useCallback(
    (name) => { if (typeof onAddBeneficiary === "function") onAddBeneficiary(name); },
    [onAddBeneficiary]
  );

  /* ========== Posizione / Mappa ========== */
  const [useGPS, setUseGPS] = useState(false);
  const [mapQ, setMapQ] = useState(form.location?.query || "");
  const [mapSugg, setMapSugg] = useState([]);
  const [fetchingGPS, setFetchingGPS] = useState(false);

  useEffect(()=>{
    const q = mapQ.trim();
    const h = setTimeout(async ()=>{
      if (!q) { setMapSugg([]); return; }
      const near = Number.isFinite(form.location?.lat) && Number.isFinite(form.location?.lng);
      const {lat, lng} = (form.location||{});
      const box = near ? `${lng-0.08},${lat-0.06},${lng+0.08},${lat+0.06}` : null;

      const urls = [
        near
          ? `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(q)}&addressdetails=1&limit=8&viewbox=${box}&bounded=1&accept-language=it`
          : null,
        `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(q)}&addressdetails=1&limit=8&accept-language=it`
      ].filter(Boolean);

      for (const url of urls) {
        try{
          const res = await fetch(url, { headers: { "Accept":"application/json" } });
          const j = await res.json();
          if (Array.isArray(j) && j.length) { setMapSugg(j); return; }
        }catch{}
      }
      setMapSugg([]);
    }, 220);
    return ()=>clearTimeout(h);
  }, [mapQ, form.location?.lat, form.location?.lng]);

  const reverseGeocode = async (lat, lon)=>{
    try{
      const r = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}&addressdetails=1&accept-language=it`);
      const j = await r.json();
      const label = j?.display_name || `${lat.toFixed(5)}, ${lon.toFixed(5)}`;
      setMapQ(label);
      set("location", { ...(form.location||{}), lat, lng: lon, query: label, display_name: label, confirmed:false });
    }catch{
      const label = `${lat.toFixed(5)}, ${lon.toFixed(5)}`;
      setMapQ(label);
      set("location", { ...(form.location||{}), lat, lng: lon, query: label, confirmed:false });
    }
  };

  /* ========== Categorie/Sub ========== */
  const catById = useMemo(()=>{
    const m = new Map();
    (categories||[]).forEach(c => m.set(String(c.id), c));
    return m;
  }, [categories]);
  const catByName = useMemo(()=>{
    const m = new Map();
    (categories||[]).forEach(c => c.name && m.set(String(c.name).toLowerCase(), c));
    return m;
  }, [categories]);
  const subOptions = useMemo(()=>{
    const cid = asStr(form.categoryId);
    const cname = String(form.categoryName || "").toLowerCase();
    const fromCat = (catById.get(cid) || catByName.get(cname));
    const listFromCat = (fromCat && Array.isArray(fromCat.subcategories)) ? fromCat.subcategories : [];
    const fromTx = new Set();
    (transactions || []).forEach(t => {
      const tCid = asStr(t.categoryId);
      const tCname = String(t.categoryName||"").toLowerCase();
      const sameId = cid && tCid === cid;
      const sameName = cname && tCname === cname;
      if ((sameId || sameName) && t.subcategory) fromTx.add(asStr(t.subcategory));
    });
    const merged = Array.from(new Set([ ...(listFromCat||[]).map(asStr), ...Array.from(fromTx) ])).filter(Boolean);
    return merged.sort((a,b)=> String(a).localeCompare(String(b)));
  }, [form.categoryId, form.categoryName, transactions, catById, catByName]);

  useEffect(()=>{
    if (form.subcategory && !subOptions.includes(form.subcategory)) {
      set("subcategory", "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subOptions.join("|")]);

  /* ========== Trasferimento: default conti ========== */
  useEffect(() => {
    if (form.type !== "Trasferimento") set("accountTo", "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.type]);
  useEffect(() => {
    if (form.type === "Trasferimento" && !form.accountTo && !normalizedTx?.accountTo) {
      const opts = (accounts||[]).map(a=>asStr(a?.name ?? a)).filter(Boolean);
      const fallback = opts.find(a => a !== form.accountId) || form.accountId || opts[0] || "";
      set("accountTo", fallback);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.type, form.accountId, accounts]);

  /* ========== Allegati: normalizza da attachmentsStr su mount ========== */
  const fileInputRef = useRef(null);
  useEffect(() => {
    const list = String(tx?.attachmentsStr||"")
      .split("|")
      .map(s=>s.trim())
      .filter(Boolean)
      .map(name => ({ id: `imp-${name}`, name, source: "import" }));
    if (list.length) set("attachments", list);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ================== Render ================== */
  return createPortal(
    <Backdrop onClick={onClose}>
      <Card onClick={(e)=>e.stopPropagation()}>
        <h3 style={{margin:0,display:"flex",alignItems:"center",gap:8}}>
          {(mode === "create" || tx?.id === "new")
            ? (<><Lucide.PlusCircle size={16}/> Nuova transazione</>)
            : (<><Lucide.Edit2 size={16}/> Modifica transazione</>)
          }
        </h3>

        {/* Tipo + Data (2/3) + Mese competenza (1/3) */}
        <RowTypeDate>
          <Field>Tipo
            <Select value={form.type||""} onChange={e=>set("type", e.target.value)}>
              <option value="Entrata">Entrata</option>
              <option value="Uscita">Uscita</option>
              <option value="Trasferimento">Trasferimento</option>
            </Select>
          </Field>

          <Field>Data/ora
            <Input
              type="datetime-local"
              value={form.dateISO || ""}
              onChange={(e)=>{
                const iso = e.target.value;
                set("dateISO", iso);
                const d = new Date(iso);
                const pad = n=> String(n).padStart(2,"0");
                const weekday = d.toLocaleDateString("en-GB",{weekday:"long"});
                const formatted = `${weekday} ${pad(d.getDate())}/${pad(d.getMonth()+1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
                set("date", formatted);
                if (!tx?.competenceMonth) set("competenceMonth", iso.slice(0,7));
              }}
            />
          </Field>

          <Field>Mese di competenza
            <Input type="month" value={form.competenceMonth || ""} onChange={(e)=>set("competenceMonth", e.target.value)} />
          </Field>
        </RowTypeDate>


        {/* Importo + Beneficiario */}
        <Row>
          <Field>Importo
            <div style={{display:"flex", alignItems:"center", gap:6}}>
              <Input
                value={amountRaw}
                onChange={(e)=>setAmountRaw(e.target.value)}
                onKeyDown={(e)=>{
                  if (e.key === "Enter") {
                    const v = amountRaw.trim();
                    if (v.startsWith("=")) {
                      const n = evalMath(v.slice(1));
                      if (Number.isFinite(n)) { set("importo", n); setAmountRaw(String(n)); }
                    } else {
                      const n = Number(v.replace(",", "."));
                      if (Number.isFinite(n)) { set("importo", n); setAmountRaw(String(n)); }
                    }
                  }
                }}
                placeholder="es. =10*2 oppure 25,50"
              />
              <HintWrap>i
                <HintPop>
                  Digita <strong>=</strong> per calcolare una formula. Esempi:<br/>
                  <code>=10*2</code>, <code>=100-12.5</code>, <code>=15/3</code>.<br/>
                  Premi Invio per confermare.
                </HintPop>
              </HintWrap>
            </div>
          </Field>

          <Field>Beneficiario
            <div style={{position:"relative"}}>
              <div style={{display:"grid", gridTemplateColumns:"1fr auto", gap:8}}>
                <input
                  value={form.beneficiary || ""}
                  onChange={(e)=>set("beneficiary", e.target.value)}
                  placeholder="Digita e scegli…"
                  style={{border:"1px solid rgba(255,255,255,.18)", background:"transparent", color:"inherit", borderRadius:10, padding:8}}
                  onFocus={()=>setBenefSOpen(true)}
                  onBlur={()=>setTimeout(()=>setBenefSOpen(false), 120)}
                />
                <Btn type="button" onClick={()=>addBeneficiary?.(form.beneficiary || "")}>Aggiungi in rubrica</Btn>
              </div>
              {benefSOpen && (
                <BenefSuggestBox>
                  {beneficiaryStats.recent.length>0 && (
                    <>
                      <div style={{fontSize:".8rem", opacity:.75, padding:"2px 6px"}}>Recenti</div>
                      {beneficiaryStats.recent.map(b=>(
                        <div key={"r-"+b} className="row" onMouseDown={()=>set("beneficiary", b)}>
                          <span>{b}</span>
                          <small>{beneficiaryStats.countOf(b)} usi</small>
                        </div>
                      ))}
                    </>
                  )}
                  <div style={{fontSize:".8rem", opacity:.75, padding:"6px 6px 2px"}}>Suggeriti</div>
                  {beneficiaryStats.byCount
                    .filter(x => !form.beneficiary || x.b.toLowerCase().includes(String(form.beneficiary).toLowerCase()))
                    .slice(0, 10)
                    .map(x=>(
                      <div key={x.b} className="row" onMouseDown={()=>set("beneficiary", x.b)}>
                        <span>{x.b}</span><small>{x.c} usi</small>
                      </div>
                    ))}
                </BenefSuggestBox>
              )}
            </div>
            <InlineNote>Scrivi per cercare: vedi recenti, conteggio usi e lista completa.</InlineNote>
          </Field>
        </Row>

        {/* Categoria/Sub */}
        <Row>
          <Field>Categoria
            <Select
              value={form.categoryId || ""}
              onChange={e=>{
                const v = e.target.value;
                if (v === "__add__") {
                  const name = window.prompt("Nome nuova categoria:");
                  if (!name) return;
                  const id = `cat_${Date.now()}`;
                  const neo = { id, name, subcategories: [] };
                  setLocalCats(prev => [...prev, neo]);
                  set("categoryId", id);
                  set("categoryName", name);
                } else {
                  set("categoryId", v);
                  const c = localCats.find(x => String(x.id) === v);
                  set("categoryName", c?.name || "");
                }
              }}
            >
              <option value="">—</option>
              {localCats.map(c=><option key={String(c.id)} value={String(c.id)}>{String(c.name)}</option>)}
              <option value="__add__">+ Aggiungi nuova…</option>
            </Select>
          </Field>

          <Field>Subcategoria
            <Select
              value={form.subcategory||""}
              onChange={e=>{
                if (e.target.value === "__add_new__") {
                  const name = window.prompt("Nuova sottocategoria:");
                  if (name) set("subcategory", name.trim());
                } else {
                  set("subcategory", e.target.value);
                }
              }}
            >
              <option value="">—</option>
              {subOptions.map(s => <option key={s} value={s}>{s}</option>)}
              <option value="__add_new__">+ Aggiungi nuova…</option>
            </Select>
          </Field>
        </Row>

        {/* Conti */}
        {form.type === "Trasferimento" ? (
          <Row>
            <Field>Conto origine
              <Select value={form.accountId || ""} onChange={e => set("accountId", e.target.value)}>
                <option value="">—</option>
                {accountOptions.map(a => <option key={a} value={a}>{a}</option>)}
              </Select>
            </Field>

            <Field>Conto destinazione
              <Select value={form.accountTo || ""} onChange={e => set("accountTo", e.target.value)}>
                <option value="">—</option>
                {accountOptions.map(a => <option key={a} value={a}>{a}</option>)}
              </Select>
            </Field>
          </Row>
          ) : (
          <Row>
            <Field>Conto
              <Select value={form.accountId || ""} onChange={e => set("accountId", e.target.value)}>
                <option value="">—</option>
                {accountOptions.map(a => <option key={a} value={a}>{a}</option>)}
              </Select>
            </Field>
            <div />
          </Row>
        )}

        {/* Tag (sx) + Note (dx) */}
        <Row style={{alignItems:"start"}}>
          <Field>Tag
            <div style={{position:"relative"}}>
              <div
                style={{display:"flex",flexWrap:"wrap",gap:6,padding:6,border:"1px solid rgba(255,255,255,.18)",borderRadius:10}}
                onMouseDown={(e)=>{
                  if (e.target.tagName !== "BUTTON") {
                    e.preventDefault();
                    e.currentTarget.querySelector("input")?.focus();
                  }
                }}
              >
                {(form.tag||[]).map((t,i)=>(
                  <span key={`${t}-${i}`} style={{padding:"4px 8px",borderRadius:999,background:"rgba(255,255,255,.08)"}}>
                    #{t}{" "}
                    <button type="button" onClick={()=>set("tag", form.tag.filter((_,idx)=>idx!==i))} style={{marginLeft:6}}>×</button>
                  </span>
                ))}
                <input
                  ref={tagInputRef}
                  value={tagQ}
                  onFocus={()=>setTagBoxOpen(true)}
                  onBlur={()=>setTimeout(()=>setTagBoxOpen(false), 120)}
                  placeholder="Aggiungi tag…"
                  onChange={e=>setTagQ(e.target.value)}
                  onKeyDown={(e)=>{
                    if (e.key === "Enter") {
                      const v = e.currentTarget.value.trim().replace(/^#/, "");
                      if (v) set("tag", [...new Set([...(form.tag||[]), v])]);
                      e.currentTarget.value = ""; setTagQ("");
                    }
                  }}
                  style={{border:0,background:"transparent",color:"inherit",outline:"none",flex:"1 1 240px",minWidth:160}}
                />
              </div>
              {tagBoxOpen && !!tagSugg.length && (
                <TagSuggestBox>
                  {tagSugg.map(({name,count})=>(
                    <div key={name} className="row" onMouseDown={()=>addTag(name)}>
                      <span>#{name}</span>
                      <small className="count">{count} usi</small>
                    </div>
                  ))}
                </TagSuggestBox>
              )}
            </div>
          </Field>

          <Field>Note
            <Input value={form.comment||""} onChange={e=>set("comment", e.target.value)}/>
          </Field>
        </Row>

        {/* Allegati (sx) + Cerca posizione (dx) */}
        <Row style={{alignItems:"start"}}>
          {/* Allegati come chip + graffetta */}
          <Field>Allegati
            <div style={{display:"grid", gridTemplateColumns:"1fr auto", gap:8, alignItems:"start"}}>
              <div
                style={{display:"flex",flexWrap:"wrap",gap:6,padding:6,border:"1px solid rgba(255,255,255,.18)",borderRadius:10, minHeight:40}}
              >
                {(form.attachments||[]).length === 0 && (
                  <span style={{opacity:.65, fontSize:".9rem"}}>Nessun allegato</span>
                )}
                {(form.attachments||[]).map((a,idx)=>(
                  <span key={(a.id||a.name||"att")+idx} style={{padding:"4px 8px", borderRadius:999, background:"rgba(255,255,255,.08)"}}>
                    {a.name}
                    <button
                      type="button"
                      onClick={()=> set("attachments", (form.attachments||[]).filter((_,i)=>i!==idx))}
                      style={{marginLeft:6}}
                      title="Rimuovi"
                    >×</button>
                  </span>
                ))}
              </div>

              <div>
                <Btn type="button" onClick={()=>fileInputRef.current?.click()} title="Aggiungi allegati">
                  <Lucide.Paperclip size={16} />
                </Btn>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  style={{display:"none"}}
                  onChange={(e)=>{
                    const files = Array.from(e.target.files||[]).map(f=>({ id: crypto.randomUUID(), name:f.name, source:"pc"}));
                    set("attachments", [...(form.attachments||[]), ...files]);
                    e.target.value = "";
                  }}
                />
              </div>
            </div>
          </Field>

          {/* Cerca posizione con bottoni in linea */}
          <Field>Cerca posizione
            <div style={{display:"grid", gridTemplateColumns:"1fr auto auto", gap:8, alignItems:"center", position:"relative"}}>
              <Input
                value={mapQ}
                onChange={(e)=>setMapQ(e.target.value)}
                placeholder="Cerca luogo, locale, CAP…"
                onFocus={()=>set("mapOpen", true)}
                onBlur={()=>setTimeout(()=>set("mapOpen", false), 120)}
              />
              <Btn
                onClick={async (e)=>{
                  e.preventDefault();
                  const on = !useGPS; setUseGPS(on);
                  if (on) {
                    setFetchingGPS(true);
                    navigator.geolocation?.getCurrentPosition?.(
                      async ({coords}) => {
                        setFetchingGPS(false);
                        await reverseGeocode(coords.latitude, coords.longitude);
                      },
                      ()=> setFetchingGPS(false)
                    );
                  }
                }}
                style={{
                  padding:"8px 10px",
                  background: useGPS ? (theme.accent || "#61d095") : theme.cardHover,
                  color: useGPS ? "#001" : theme.text
                }}
                title="Usa posizione attuale"
              >
                {fetchingGPS ? "…" : "Posizione attuale"}
              </Btn>
              <Btn
                onClick={(e)=>{ e.preventDefault(); set("location", { ...(form.location||{}), confirmed:true }); }}
                title="Conferma la posizione selezionata"
                style={{padding:"8px 10px"}}
              >
                Conferma
              </Btn>

              {/* suggest */}
              {form.mapOpen && mapSugg.length>0 && (
                <div style={{
                  position:"absolute", zIndex:1500, left:0, right:0, top:"calc(100% + 6px)",
                  background: theme.flyoutSolid || "#0F2F35",
                  border:`1px solid ${theme.separator}`, borderRadius:10, boxShadow:"0 12px 28px rgba(0,0,0,.30)",
                  padding:6, maxHeight:240, overflow:"auto"
                }}>
                  {mapSugg.map(s=>(
                    <div key={s.place_id}
                      onMouseDown={()=>{
                        const lat = +s.lat, lon = +s.lon, label = s.display_name;
                        setMapQ(label);
                        set("location", { ...(form.location||{}), lat, lng: lon, query: label, display_name: label, confirmed:false });
                      }}
                      style={{display:"flex", gap:8, alignItems:"center", padding:"6px 8px", borderRadius:8, cursor:"pointer"}}
                    >
                      <Lucide.MapPin size={16}/> <span style={{opacity:.9}}>{s.display_name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Field>
        </Row>

        {/* Allegati sotto i Tag (sx), chip + graffetta a destra */}
        <Row>
          <Field>Allegati
            <div style={{display:"grid", gridTemplateColumns:"1fr auto", gap:8, alignItems:"start"}}>
              {/* chips */}
              <div
                style={{display:"flex",flexWrap:"wrap",gap:6,padding:6,border:"1px solid rgba(255,255,255,.18)",borderRadius:10, minHeight:40}}
              >
                {(form.attachments||[]).length === 0 && (
                  <span style={{opacity:.65, fontSize:".9rem"}}>Nessun allegato</span>
                )}
                {(form.attachments||[]).map((a,idx)=>(
                  <span key={(a.id||a.name||"att")+idx} style={{padding:"4px 8px", borderRadius:999, background:"rgba(255,255,255,.08)"}}>
                    {a.name}
                    <button
                      type="button"
                      onClick={()=> set("attachments", (form.attachments||[]).filter((_,i)=>i!==idx))}
                      style={{marginLeft:6}}
                      title="Rimuovi"
                    >×</button>
                  </span>
                ))}
              </div>

              {/* graffetta per aggiungere */}
              <div>
                <Btn type="button" onClick={()=>fileInputRef.current?.click()} title="Aggiungi allegati">
                  <Lucide.Paperclip size={16} />
                </Btn>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  style={{display:"none"}}
                  onChange={(e)=>{
                    const files = Array.from(e.target.files||[]).map(f=>({ id: crypto.randomUUID(), name:f.name, source:"pc"}));
                    set("attachments", [...(form.attachments||[]), ...files]);
                    e.target.value = "";
                  }}
                />
              </div>
            </div>
          </Field>
          <div /> {/* colonna destra vuota per allineare alla griglia */}
        </Row>

        {/* Mappa full-width */}
        <div style={{borderRadius:10, overflow:"hidden", border:`1px solid ${theme.separator}`}}>
          <iframe
            title="map"
            src={
              Number.isFinite(form.location?.lat) && Number.isFinite(form.location?.lng)
                ? `https://www.google.com/maps?q=${form.location.lat},${form.location.lng}&output=embed`
                : (mapQ ? `https://www.google.com/maps?q=${encodeURIComponent(mapQ)}&output=embed`
                        : `https://www.openstreetmap.org/export/embed.html?bbox=-20%2C35%2C40%2C60&layer=mapnik`)
            }
            style={{width:"100%", height:"clamp(180px, 24vh, 260px)", border:0, display:"block"}}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>

        {/* Footer */}
        <Footer>
          <Btn onClick={onClose}>Annulla</Btn>
          <Btn onClick={()=>onSave?.(form)} style={{background:"#61d095"}}>Salva</Btn>
        </Footer>
        
      </Card>
    </Backdrop>
  , document.body);
}
