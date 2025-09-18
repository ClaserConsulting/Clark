// 📁 src/pages/Dashboard/widgets/RecentTransactions.jsx
import React, { useState, useMemo, useEffect, useRef, useLayoutEffect } from "react";
import styled, { useTheme, keyframes, css } from "styled-components";
import { createPortal } from "react-dom";
import * as Lucide from "lucide-react";
import TransactionEditPopup from "../../../components/popups/TransactionEditPopup";

/* ---------- helpers ---------- */

// Indicatore allegati nella lista delle transazioni
const parseAttachments = (s) => String(s||"")
  .split("|")
  .map(x=>x.trim())
  .filter(Boolean);

// "Tuesday 02/07/2025 08:51" -> Date
const parseDateEU = (s) => {
  if (!s) return null;
  const m = String(s).match(/(\d{2})\/(\d{2})\/(\d{4})\s+(\d{2}):(\d{2})/);
  if (!m) return null;
  const [, dd, mm, yyyy, HH, MM] = m;
  return new Date(+yyyy, +mm - 1, +dd, +HH, +MM);
};

// Ordina DESC per data
const sortByDateDesc = (arr = []) =>
  [...arr].sort((a, b) => {
    const da = parseDateEU(a?.date)?.getTime() ?? 0;
    const db = parseDateEU(b?.date)?.getTime() ?? 0;
    return db - da;
  });

// "shopping-cart" -> "ShoppingCart"
const toPascal = (kebab = "") =>
  kebab.split("-").map(s => s.charAt(0).toUpperCase() + s.slice(1)).join("");

const fmtAmount = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? `${n.toFixed(2)}€` : "—";
};

// saldo pre/post: usa balanceBefore/After se presenti, altrimenti calcola
const getBeforeAfter = (tx) => {
  const before = tx?.balanceBefore;
  const after  = tx?.balanceAfter;
  if (Number.isFinite(before) && Number.isFinite(after)) return { before, after };

  const amt = Number(tx?.importo);
  if (!Number.isFinite(amt)) return null;
  if (Number.isFinite(before)) return { before, after: before + amt };
  if (Number.isFinite(after))  return { before: after - amt, after };
  return null;
};

// indice categorie per id e per nome
const buildCatIndex = (cats = []) => {
  const map = new Map();
  (cats || []).forEach(c => {
    map.set(c.id, c);
    if (c.name) map.set(c.name.toLowerCase(), c);
  });
  return map;
};

/* ---------- styled ---------- */

const Header = styled.div`
  display:flex; align-items:center; justify-content:space-between;
  gap:8px; margin-bottom:8px;
`;
const Actions = styled.div`display:flex; gap:6px; align-items:center;`;

const IconBtn = styled.button`
  position: relative;
  width: 28px; height: 28px;
  display: grid; place-items: center;
  border: 0; border-radius: 8px;
  background: transparent; color: ${({theme})=>theme.text};
  cursor: pointer;
  &:hover{ background: ${({theme})=>theme.cardHover}; }
`;

const Btn = styled.button`
  border: 1px solid ${({theme})=>theme.separator};
  border-radius: 10px;
  padding: 6px 10px;
  background: ${({theme})=>theme.card};
  color: ${({theme})=>theme.text};
  cursor: pointer;
  &:hover{ background: ${({theme})=>theme.cardHover}; }
`;

const BtnAccent = styled(Btn)`
  background: rgba(97,208,149,.18);
  border-color: rgba(97,208,149,.45);
  &:hover{ background: rgba(97,208,149,.28); }
`;


// pannello a scomparsa
const FilterPanel = styled.div`
  position: relative;
  overflow: visible;  /* 👈 consenti ai dropdown di uscire dal pannello */
  border:1px solid ${({theme})=>theme.separator};
  background:${({theme})=>theme.card}; color:${({theme})=>theme.text};
  border-radius:14px; padding:14px; margin-bottom:10px;
  box-shadow:0 12px 28px rgba(0,0,0,.25);
  animation: slideDown .18s ease-out both;
  @keyframes slideDown { from { opacity:0; transform:translateY(-6px);} to { opacity:1; transform:translateY(0);} }
`;

const PanelEraser = styled.button`
  position: absolute; top: 8px; right: 8px;
  width: 28px; height: 28px; border-radius: 999px;
  display:grid; place-items:center; cursor:pointer;
  border: 1px solid ${({theme})=>theme.separator};
  background: ${({theme})=>theme.cardHover}; color: ${({theme})=>theme.text};
  &:hover{ background: ${({theme})=>theme.card}; }
  svg{ width: 16px; height: 16px; }
`;

const FilterGrid = styled.div`
  display:grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap:10px;
`;

const Field = styled.div`display:grid; gap:4px;`;

const Label = styled.div`font-size:.78rem; text-transform:uppercase; font-weight:800; opacity:.85;letter-spacing:.3px;`;

const List = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-width: 0;
`;

const Row = styled.div`
  position: relative;
  width: 100%;
  min-width: 0;
  border-radius: 12px;

  /* sfondo in base al type + card base */
  background:
    ${({ $type }) =>
      $type === "Uscita"
        ? "linear-gradient(0deg, rgba(255,107,107,0.10), rgba(255,107,107,0.20))"
        : $type === "Entrata"
        ? "linear-gradient(0deg, rgba(97,208,149,0.10), rgba(97,208,149,0.20))"
        : $type === "Trasferimento"
        ? "linear-gradient(0deg, rgba(255, 255, 255, 0.10), rgba(255, 255, 255, 0.22))"
        : "none"};
  background-color: ${({ theme }) => theme.card};
  box-shadow: 0 1px 6px ${({ theme }) => theme.tileShadow};

  display: grid;
  grid-template-columns: 32px 1fr auto 28px; /* icona cat | testo | amount | azioni */
  align-items: center;
  gap: 12px;
  padding: 12px 12px 10px;
  color: ${({ theme }) => theme.text};
  border-left: 3px solid
    ${({ $type }) =>
      $type === "Uscita" ? "#ff6b6b"
      : $type === "Entrata" ? "#61d095"
      : $type === "Trasferimento" ? "#ffffffff"
      : "transparent"};

  > * { min-width: 0; }
  cursor: pointer;

  &:hover .actions button { opacity: 0.95; }
`;

const CatIconWrap = styled.div`
  display: grid;
  place-items: center;
  color: #fff; /* icona categoria bianca */
  svg { width: 18px; height: 18px; stroke-width: 2; }
`;

const Main = styled.div`
  min-width: 0;
  display: grid;
  grid-template-columns: 1fr;
  gap: 2px;

  .title {
    font-weight: 600;
    color: ${({ theme }) => theme.text};
    white-space: normal;
    word-break: break-word;
  }
  .meta {
    font-size: 0.8rem;
    opacity: 0.75;
    white-space: normal;
    word-break: break-word;
  }
`;

const Amount = styled.div`
  font-weight: 700;
  white-space: nowrap;
  justify-self: end;
  color: ${({ $type, theme }) => {
    if ($type === "Uscita") return "#ff6b6b";
    if ($type === "Entrata") return theme.success || "#61d095";
    if ($type === "Trasferimento") return theme.$active || "#ffffffff";
    return theme.text;
  }};
`;

const ActionsStack = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  align-items: center;
  justify-content: center;

  &.actions button {
    background: transparent;
    border: 0;
    display: grid;
    place-items: center;
    padding: 2px;
    line-height: 0;
    color: #fff;
    opacity: 0;
    cursor: pointer;
    transition: opacity .12s ease, transform .12s ease;
  }
  &.actions button:hover { opacity: 0.75; transform: translateY(-1px); }

  svg { width: 16px; height: 16px; stroke-width: 2; }
`;

const expandAnim = keyframes`
  from { opacity: 0; transform: translateY(-6px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const Details = styled.div`
  margin-top: 6px;
  padding: 12px;
  border-radius: 12px;
  background:
    linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02)),
    ${({ theme }) => theme.cardHover || "rgba(255,255,255,0.06)"};
  border: 1px solid ${({ theme }) => theme.separator || "rgba(255,255,255,.12)"};
  animation: ${expandAnim} .18s ease-out;

  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

/* strip saldo pre → post */
const BalancesStrip = styled.div`
  grid-column: 1 / -1;
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 10px;
  background: rgba(255,255,255,0.04);
  border: 1px dashed ${({ theme }) => theme.separator || "rgba(255,255,255,.18)"};

  .label { font-size: .75rem; opacity: .7; }
  .value { font-weight: 700; font-size: .95rem; white-space: nowrap; }
  .arrow { opacity: .7; font-weight: 700; color: ${({ theme }) => theme.text}; }
`;

const MiniCard = styled.div`
  position: relative;
  padding: 10px 12px;
  border-radius: 10px;
  background: ${({ theme }) => theme.card};
  box-shadow: 0 1px 4px ${({ theme }) => theme.tileShadow};
  transition: box-shadow .12s ease, transform .12s ease;

  ${({ $active }) => $active && css`
    box-shadow: 0 0 0 2px rgba(127,179,255,.6) inset, 0 6px 16px rgba(127,179,255,.20);
    background: linear-gradient(0deg, rgba(255,255,255,.08), rgba(255,255,255,.08));
    transform: translateY(-1px);
  `}

  .label { font-size: .75rem; opacity: .7; margin-bottom: 2px; }
  .value { font-weight: 700; font-size: .95rem; word-break: break-word; }

  .analyze {
    position: absolute; top: 6px; right: 6px;
    border: 0; background: transparent; color: #fff; opacity: .55;
    transition: opacity .12s ease, transform .12s ease; cursor: pointer; line-height: 0;
  }
  .analyze:hover { opacity: 1; transform: translateY(-1px); }
`;

const SubBadge = styled.span`
  display: inline-block;
  font-size: .72rem;
  line-height: 1;
  padding: 4px 8px;
  border-radius: 999px;
  margin-top: 6px;
  background: ${({ theme }) => theme.cardHover || "rgba(255,255,255,0.08)"};
  border: 1px solid ${({ theme }) => theme.separator || "rgba(255,255,255,0.16)"};
  opacity: .9;
`;

const PopMenu = styled.div`
  position: absolute;
  top: 6px;
  right: 6px;
  z-index: 10;
  background: ${({ theme }) => theme.card};
  color: ${({ theme }) => theme.text};
  border: 1px solid ${({ theme }) => theme.separator || "rgba(255,255,255,0.16)"};
  border-radius: 10px;
  box-shadow: 0 10px 24px rgba(0,0,0,0.35);
  padding: 6px;
  display: grid;
  gap: 4px;
`;

const PopItem = styled.button`
  border: 0;
  background: transparent;
  color: inherit;
  text-align: left;
  padding: 8px 10px;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  &:hover { background: ${({ theme }) => theme.cardHover || "rgba(255,255,255,0.08)"}; }
`;

// --- gerarchia categoria/sub con connettore collegato ---
const Chips = styled.div`
  display: grid;
  gap: 8px;
  margin-top: 4px;
  position: relative;
`;

const CategoryRow = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const CategoryNode = styled.button`
  border: 0;
  background: transparent;
  padding: 2px 0;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  color: ${({ theme }) => theme.text};

  .ico { display: grid; place-items: center; width: 18px; height: 18px; }
  .ico svg { width: 18px; height: 18px; stroke-width: 2; }
  .txt { font-weight: 700; font-size: .95rem; letter-spacing: .2px; opacity: .95; }

  &:hover .ico svg { stroke: #fff; }
  &:hover .txt { opacity: 1; }

  ${({ $active }) => $active && css`
    .ico svg { stroke: #fff; fill: #fff; filter: drop-shadow(0 0 6px rgba(255,255,255,.75)); }
    .txt { text-shadow: 0 0 6px rgba(255,255,255,.25); }
  `}
`;

const SubRow = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
  padding-left: 34px;
`;

/* pill piccola per la sottocategoria */
const ChipSub = styled.button`
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  border-radius: 999px;
  border: 1px solid ${({ theme }) => theme.separator || "rgba(255,255,255,.18)"};
  background: ${({ theme }) => theme.card};
  color: ${({ theme }) => theme.text};
  cursor: pointer;
  font-size: .82rem;
  transition: transform .12s ease, background .12s ease, box-shadow .12s ease;
  &:hover { transform: translateY(-1px); background: ${({ theme }) => theme.cardHover || "rgba(255,255,255,.08)"}; }

  .ico { display: grid; place-items: center; width: 16px; height: 16px; }
  .ico svg { width: 16px; height: 16px; stroke-width: 2; }
  .txt { font-weight: 600; }

  ${({ $active }) => $active && css`
    box-shadow: 0 0 0 2px rgba(127,179,255,.55) inset;
    .ico svg { stroke: #fff; fill: #fff; filter: drop-shadow(0 0 6px rgba(255,255,255,.75)); }
  `}
`;

const Tag = styled.button`
  font-size: .75rem; padding: 4px 8px; border-radius: 999px;
  background: ${({ theme }) => theme.card};
  border: 1px solid ${({ theme }) => theme.separator || "rgba(255,255,255,.18)"};
  color: ${({ theme }) => theme.text};
  opacity: .85; cursor: pointer;
  transition: transform .12s ease, opacity .12s ease, box-shadow .12s ease;
  &:hover { opacity: 1; transform: translateY(-1px); }

  ${({ $active }) => $active && css`
    box-shadow: 0 0 0 2px rgba(127,179,255,.6) inset;
    background: linear-gradient(0deg, rgba(255,255,255,.08), rgba(255,255,255,.08));
  `}
`;

const Tags = styled.div`
  grid-column: 1 / -1;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 2px;
`;

const ListControls = styled.div`
  display: flex;
  gap: 8px;
  justify-content: center;
  padding: 8px 0 2px;
`;

const ControlBtn = styled.button`
  border: 0; border-radius: 999px; padding: 6px 12px; font-size: .85rem;
  background: ${({ theme }) => theme.cardHover || "rgba(255,255,255,.08)"};
  color: ${({ theme }) => theme.text};
  cursor: pointer; opacity: .9; &:hover { opacity: 1; }
`;

const ActiveFiltersBar = styled.div`
  position: relative;
  margin: 4px 0 8px;
  display: flex; flex-wrap: wrap; gap: 6px; align-items: center;
  padding-right: 40px; /* spazio per la gommina in alto dx */
`;

const SummaryEraser = styled.button`
  position: absolute; top: -2px; right: 0;
  width: 28px; height: 28px; border-radius: 999px;
  display:grid; place-items:center; cursor:pointer;
  border: 1px solid ${({theme})=>theme.separator};
  background: ${({theme})=>theme.cardHover}; color: ${({theme})=>theme.text};
  &:hover{ background: ${({theme})=>theme.card}; }
  svg{ width: 16px; height: 16px; }
`;

const FiltersDivider = styled.div`
  height: 1px;
  width: 100%;
  margin: 6px 0 8px;
  background: linear-gradient(
    90deg,
    transparent 0%,
    ${({theme})=>theme.separator} 12%,
    ${({theme})=>theme.separator} 88%,
    transparent 100%
  );
  opacity: .7;
`;

const Pill = styled.span`
  display:inline-flex; align-items:center; gap:6px;
  padding:6px 10px; border-radius:999px;
  background:${({theme})=>theme.cardHover}; border:1px solid ${({theme})=>theme.separator};
  font-size:.8rem;
  .k{opacity:.7;text-transform:uppercase;font-weight:800;font-size:.72rem;letter-spacing:.3px;}
  button{border:0;background:transparent;color:inherit;cursor:pointer;opacity:.8;}
  button:hover{opacity:1}
`;

const SmallClear = styled.button`
  margin-left:auto;border:0;border-radius:999px;padding:6px 10px;cursor:pointer;
  background:${({theme})=>theme.cardHover};color:${({theme})=>theme.text};
`;

const SlicerShell = styled.div`
  position: relative;
  ${({$open}) => $open && css`z-index: 20;`} /* 👈 sta sopra agli altri slicer */
`;

const SlicerHead = styled.button`
  width: 100%;
  display: flex; align-items: center; justify-content: space-between;
  gap: 8px;
  padding: 8px 10px;
  border-radius: 10px;
  border: 1px solid ${({theme})=>theme.separator};
  background: ${({theme})=>theme.card};
  color: ${({theme})=>theme.text};
  cursor: pointer;
  font-size: .9rem;
  &:hover{ background: ${({theme})=>theme.cardHover}; }
  .label{opacity:.85}
  .val{opacity:.6; font-size:.85rem}
`;

const Caret = styled.span`
  display:inline-grid; place-items:center;
  transform: ${({$open})=>$open?"rotate(180deg)":"none"};
  transition: transform .12s ease;
`;

const SlicerFlyout = styled.div`
  position: fixed; /* fuori dagli stacking context */
  z-index: 9999;
  border-radius: 12px;
  padding: 10px;
  width: var(--flyout-w, 240px);

/* 🔒 SOLIDO: ignora le trasparenze del tema */
  background: ${({theme}) => theme.flyoutSolid || "#0F2F35"};   /* fallback verde/blu scuro */
  color: ${({theme}) => theme.text};
  border: 1px solid ${({theme}) => theme.separator};
  box-shadow: 0 14px 30px rgba(0,0,0,.35);

  /* niente blur/overlay */
  backdrop-filter: none;

  /* caret con lo stesso bg solido */
  &::after{
    content:"";
    position:absolute; top:-6px; right:16px;
    width:12px; height:12px; transform:rotate(45deg);
    background: ${({theme}) => theme.flyoutSolid || "#0F2F35"};
    border-left: 1px solid ${({theme}) => theme.separator};
    border-top: 1px solid ${({theme}) => theme.separator};
    filter: drop-shadow(0 4px 8px rgba(0,0,0,.25));
  }

  transform-origin: top right;
  animation: slicerIn .14s ease-out both;
  @keyframes slicerIn {
    from { opacity: 0; transform: translateY(-6px) scale(.98); }
    to   { opacity: 1; transform: translateY(0) scale(1); }
  }
`;

const SlicerSearch = styled.input`
  width:100%;
  border:0; outline: none;
  background: ${({theme})=>theme.card};
  color: ${({theme})=>theme.text};
  border-radius: 8px;
  padding: 6px 8px;
  margin-bottom: 6px;
  font-size: .9rem;
`;

const SlicerList = styled.div`
  max-height: 200px; overflow:auto; display:grid; gap:4px;
  label{ display:flex; align-items:center; gap:8px; cursor:pointer; }
  input[type="checkbox"]{ accent-color: currentColor; }
`;

const SlicerActions = styled.div`
  display:flex; gap:8px; justify-content:flex-end; margin-top:8px;
  button{
    border:0; border-radius:10px; cursor:pointer; padding:6px 10px;
    background:${({theme})=>theme.cardHover}; color:${({theme})=>theme.text};
  }
`;

const MapLink = styled.button`
  border:0; background:${({theme})=>theme.cardHover}; color:${({theme})=>theme.text};
  border-radius:10px; padding:6px 10px; cursor:pointer;
  &:hover{ background:${({theme})=>theme.card}; }
`;

/* ---------- componenti ---------- */
function Slicer({ label, options=[], selected=[], onChange, placeholder="Cerca…" }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const headRef = useRef(null);
  const menuRef = useRef(null);
  const [pos, setPos] = useState({ left: 0, top: 0, width: 260 });

  // chiudi fuori-clic
  useEffect(()=>{
    const onDoc = (e)=>{
      if (!open) return;
      const h = headRef.current, m = menuRef.current;
      if (h && h.contains(e.target)) return;
      if (m && m.contains(e.target)) return;
      setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return ()=>document.removeEventListener("mousedown", onDoc);
  }, [open]);

  // calcola posizione flyout alla apertura e su resize/scroll
  const place = () => {
    const r = headRef.current?.getBoundingClientRect();
    if (!r) return;
    const gap = 6;
    let left = r.left;
    const width = r.width;
    let top = r.bottom + gap;

    // clamp a viewport
    const maxLeft = window.innerWidth - width - 8;
    left = Math.max(8, Math.min(left, maxLeft));
    const maxTop = window.innerHeight - 12;
    if (top > maxTop) top = Math.max(8, r.top - gap - (menuRef.current?.offsetHeight || 0)); // sopra

    setPos({ left, top, width });
  };

  useLayoutEffect(()=>{
    if (!open) return;
    place();
    const on = () => place();
    window.addEventListener("resize", on);
    window.addEventListener("scroll", on, true);
    return ()=>{
      window.removeEventListener("resize", on);
      window.removeEventListener("scroll", on, true);
    };
  }, [open]);

  const shown = useMemo(()=>{
    const s = q.trim().toLowerCase();
    return !s ? options : options.filter(o => String(o).toLowerCase().includes(s));
  }, [options, q]);

  const toggle = (val)=>{
    const has = selected.includes(val);
    onChange?.(has ? selected.filter(v=>v!==val) : [...selected, val]);
  };

  const summary = selected.length === 0 ? "Tutti" : (selected.length === 1 ? selected[0] : `${selected.length} selezionati`);

  return (
    <SlicerShell>
      <SlicerHead ref={headRef} onClick={()=>setOpen(v=>!v)}>
        <span className="label">{label}</span>
        <span className="val">{summary}</span>
        <Caret $open={open}><Lucide.ChevronDown size={16}/></Caret>
      </SlicerHead>

      {open && createPortal(
        <SlicerFlyout
          ref={menuRef}
          style={{ left: pos.left, top: pos.top, '--flyout-w': `${pos.width}px` }}
        >
          <SlicerSearch placeholder={placeholder} value={q} onChange={e=>setQ(e.target.value)} />
          <SlicerList>
            {shown.map(v=>(
              <label key={v}>
                <input type="checkbox" checked={selected.includes(v)} onChange={()=>toggle(v)} />
                <span style={{whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis"}}>{v}</span>
              </label>
            ))}
            {shown.length===0 && <div style={{opacity:.6, fontSize:".85rem"}}>Nessun risultato…</div>}
          </SlicerList>
          <SlicerActions>
            <button onClick={()=>onChange?.([])}>Pulisci</button>
            <button onClick={()=>onChange?.(options)}>Tutti</button>
          </SlicerActions>
        </SlicerFlyout>,
        document.body
      )}
    </SlicerShell>
  );
}

function CategoryIcon({ icon = "Circle", size = 18 }) {
  const IconComp = Lucide[toPascal(icon)] || Lucide.Circle;
  return <IconComp width={size} height={size} stroke="currentColor" />;
}

function RowItem({ tx, category, open, onToggle, onEdit, onDelete, onAnalyze, analysis }) {
  const theme = useTheme();
  const [attOpen, setAttOpen] = useState(false);
  const attBtnRef = useRef(null);
  const attMenuRef = useRef(null);
  const [showAttMenu, setShowAttMenu] = useState(false);
  const beforeAfter = getBeforeAfter(tx);
  const isBenActive = analysis?.dimension === "beneficiary" &&
    String(analysis.value || "").toLowerCase() === String(tx?.beneficiary || "").toLowerCase();

  const isCatActive = analysis?.dimension === "category" && (
    analysis.value === category?.id ||
    String(analysis.value || "").toLowerCase() === String(tx?.categoryName || "").toLowerCase()
  );

  const isSubActive = analysis?.dimension === "subcategory" &&
    String(analysis.value || "").toLowerCase() === String(tx?.subcategory || "").toLowerCase();

  // chiudi quando clicchi fuori (stesso pattern degli Slicer)
  useEffect(()=>{
    if (!attOpen) return;
    const onDoc = (e)=>{
      if (attBtnRef.current?.contains(e.target)) return;
      if (attMenuRef.current?.contains(e.target)) return;
      setAttOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return ()=>document.removeEventListener("mousedown", onDoc);
  }, [attOpen]);

  const toggleAnalyze = (dimension, value) => {
    const same =
      analysis?.dimension === dimension &&
      String(analysis?.value || "").toLowerCase() === String(value || "").toLowerCase();
    onAnalyze?.(same ? null : { dimension, value });
  };

  const flyoutBg = theme?.flyoutSolid || "#0F2F35";
  const sep = theme?.separator || "rgba(255,255,255,.12)";
  const accent = theme?.accent || "#61d095";

  const att = Array.isArray(tx.attachments)
    ? tx.attachments
    : String(tx.attachmentsStr || "")
        .split("|")
        .map((t, i) => t.trim() && { id: `s-${i}`, title: t.trim() })
        .filter(Boolean);

  const hasAtt = att.length > 0;

  return (
    <>
      <Row $type={tx?.type} onClick={onToggle} role="button" tabIndex={0}>
        <CatIconWrap>
          <CategoryIcon icon={category?.icon} />
        </CatIconWrap>

        <Main>
          <div className="title">
            {(category?.name || tx?.categoryName || "—")}{tx?.beneficiary ? ` · ${tx.beneficiary}` : ""}
          </div>
          <div className="meta">
            <Lucide.Tag style={{ opacity: .6, verticalAlign: "-2px" }} size={14} /> {tx?.subcategory || "—"}
            {" · "}
            {tx?.date || "—"}
          </div>
        </Main>

        <Amount $type={tx?.type}>{fmtAmount(tx?.importo)}</Amount>

        <ActionsStack className="actions" onClick={(e) => e.stopPropagation()} style={{ overflow: "visible" }}>
          {/* Allegati */}
          <div style={{position:"relative"}}>
            <IconBtn ref={attBtnRef} title="Allegati" onClick={(e)=>{ e.stopPropagation(); setAttOpen(v=>!v); }}>
              <Lucide.Paperclip />
              {!!(att?.length) && (
                <span
                  style={{
                    position: "absolute", top: -2, right: -2,
                    width: 8, height: 8, borderRadius: "50%",
                    background: theme?.accent || "#61d095",
                    boxShadow: "0 0 0 2px rgba(0,0,0,.25)"
                  }}
                />
              )}
            </IconBtn>
            {attOpen && (
              <div
                ref={attMenuRef}
                style={{
                  position:"absolute", right:0, top:"calc(100% + 6px)", minWidth:220,
                  background: theme?.flyoutSolid || "#0F2F35",
                  border: `1px solid ${theme?.separator || "rgba(255,255,255,.12)"}`,
                  borderRadius:10, padding:8, zIndex:2000, boxShadow:"0 14px 30px rgba(0,0,0,.35)"
                }}
                onClick={(e)=>e.stopPropagation()}
              >
              <div style={{display:"grid", gap:6, maxHeight:220, overflow:"auto"}}>
                {(att||[]).map(a=>(
                  <div key={a.id} style={{display:"flex", alignItems:"center", justifyContent:"space-between", gap:8}}>
                    <span style={{display:"inline-flex", alignItems:"center", gap:8, minWidth:0}}>
                      <Lucide.File size={14} />
                      <span style={{overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap"}} title={a.title}>{a.title}</span>
                    </span>
                    <button style={{border:0, background:"transparent", cursor:"pointer"}} title="Rimuovi">×</button>
                  </div>
                ))}
              </div>
                <div style={{display:"grid", gap:6, marginTop:8}}>
                  <div style={{fontSize:".8rem", opacity:.7}}>Aggiungi</div>
                  <div style={{display:"flex", gap:6}}>
                    <button
                      style={{border:0, borderRadius:10, padding:"6px 10px", cursor:"pointer"}}
                      onClick={()=>{
                        // 🔌 qui aprirai il picker ClarkDrive
                        onEdit?.(tx); // fallback: apri l’edit (se vuoi aprire direttamente gli allegati nel popup, vedi patch B5)
                      }}
                      >
                      da ClarkDrive
                    </button>
                    <button
                      style={{border:0, borderRadius:10, padding:"6px 10px", cursor:"pointer"}}
                      onClick={()=>{
                        onEdit?.(tx);
                        // opzionale: dispatch per aprire subito il file picker del popup
                        setTimeout(()=>document.querySelector("#tx-file-input")?.click(), 50);
                      }}
                      >
                      dal PC
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
          <button title="Modifica" onClick={() => onEdit?.(tx)}>
            <Lucide.Edit2 />
          </button>
          <button
            title="Elimina"
            onClick={() => {
              if (!onDelete) return;
              if (window.confirm("Eliminare questa transazione?")) onDelete(tx);
            }}
          >
            <Lucide.Trash2 />
          </button>
        </ActionsStack>
      </Row>

      {showAttMenu && (
        <PopMenu onClick={(e)=>e.stopPropagation()}>
          <div style={{fontWeight:700, fontSize:".9rem", margin:"2px 2px 6px"}}>Allegati</div>
          {att.length ? att.map((name,i)=>(
            <PopItem key={name+i} onClick={()=>{ /* opzionale: apri/mostra */ }}>
              <Lucide.File size={16}/> <span style={{whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis"}}>{name}</span>
              <span style={{marginLeft:"auto", opacity:.7}}>Apri</span>
            </PopItem>
          )) : <div style={{opacity:.7, fontSize:".85rem", padding:"6px 8px"}}>Nessun allegato</div>}
          <div style={{height:1, background:"rgba(255,255,255,.12)", margin:"4px 0"}}/>
          <PopItem onClick={()=>setShowAttMenu(false)}>
            <Lucide.Paperclip size={16}/><span>Aggiungi...</span>
          </PopItem>
        </PopMenu>
      )}

      {open && (
        <Details>
          <BalancesStrip>
            <div>
              <div className="label">
                <strong>{tx.sourceAccountName ?? tx.accountId ?? "Conto"}</strong>
                {" · "}
                {tx?.type === "Trasferimento" ? "Saldo origine (pre)" : "Saldo (pre)"}
              </div>
              <div className="value">
                {beforeAfter ? fmtAmount(beforeAfter.before) : "—"}
              </div>
            </div>
            <div className="arrow">→</div>
            <div style={{ textAlign: "right" }}>
              <div className="label">
                <strong>{tx.sourceAccountName ?? tx.accountId ?? "Conto"}</strong>
                {" · "}
                {tx?.type === "Trasferimento" ? "Saldo origine (post)" : "Saldo (post)"}
              </div>
              <div className="value">
                {beforeAfter ? fmtAmount(beforeAfter.after) : "—"}
              </div>
            </div>
          </BalancesStrip>

          {tx?.type === "Trasferimento" && (
            <BalancesStrip>
              <div>
                <div className="label">
                  <strong>{tx.destAccountName ?? tx.accountTo ?? "Destinazione"}</strong> · Saldo destinazione (pre)
                </div>
                <div className="value">
                  {Number.isFinite(tx?.destBefore) ? fmtAmount(tx.destBefore) : "—"}
                </div>
              </div>
              <div className="arrow">→</div>
              <div style={{ textAlign: "right" }}>
                <div className="label">
                  <strong>{tx.destAccountName ?? tx.accountTo ?? "Destinazione"}</strong> · Saldo destinazione (post)
                </div>
                <div className="value">
                  {Number.isFinite(tx?.destAfter) ? fmtAmount(tx.destAfter) : "—"}
                </div>
              </div>
            </BalancesStrip>
          )}

          <MiniCard>
            <div className="label">Tipo</div>
            <div className="value">{tx?.type || "—"}</div>
          </MiniCard>

          <MiniCard>
            <div className="label">Conto origine</div>
            <div className="value">{tx?.accountId || "—"}</div>
          </MiniCard>

          <MiniCard>
            <div className="label">Conto destinazione</div>
            <div className="value">{tx?.accountTo || "—"}</div>
          </MiniCard>

          <MiniCard $active={isBenActive}>
            <div className="label">Beneficiario</div>
            <div className="value">{tx?.beneficiary || "—"}</div>
            <button
              className="analyze"
              title="Analizza beneficiario"
              onClick={(e) => { e.stopPropagation(); toggleAnalyze("beneficiary", tx?.beneficiary); }}
            >
              <Lucide.Target />
            </button>
          </MiniCard>

          <MiniCard>
            <div className="label">Categoria &nbsp;·&nbsp; Sottocategoria</div>
            <Chips>
              <CategoryRow>
                <CategoryNode
                  $active={isCatActive}
                  title="Analizza categoria"
                  onClick={(e) => {
                    e.stopPropagation();
                    onAnalyze?.({ dimension: "category", value: category?.id || tx?.categoryName });
                  }}
                >
                  <span className="ico">
                    {category?.icon
                      ? <CategoryIcon icon={category.icon} size={18} />
                      : <Lucide.Folder />}
                  </span>
                  <span className="txt">{category?.name || tx?.categoryName || "—"}</span>
                </CategoryNode>
              </CategoryRow>

              {!!tx?.subcategory && (
                <SubRow>
                  <ChipSub
                    $active={isSubActive}
                    title="Analizza sottocategoria"
                    onClick={(e) => {
                      e.stopPropagation();
                      onAnalyze?.({ dimension: "subcategory", value: tx.subcategory });
                    }}
                  >
                    <span className="ico"><Lucide.Tag /></span>
                    <span className="txt">{tx.subcategory}</span>
                  </ChipSub>
                </SubRow>
              )}
            </Chips>
          </MiniCard>

          <MiniCard>
            <div className="label">Note</div>
            <div className="value">{tx?.comment || "—"}</div>
          </MiniCard>

          <MiniCard>
            <div className="label">Posizione</div>
            {tx?.location?.lat && tx?.location?.lng ? (
              <>
                <div className="value">lat: {tx.location.lat.toFixed?.(5) || tx.location.lat}, lng: {tx.location.lng.toFixed?.(5) || tx.location.lng}</div>
                <MapLink
                  onClick={(e)=>{
                    e.stopPropagation();
                    const {lat,lng} = tx.location;
                    window.open(`https://www.google.com/maps?q=${lat},${lng}`, "_blank");
                  }}
                >
                  Mostra posizione
                </MapLink>
              </>
            ) : (
              <div className="value">—</div>
            )}
          </MiniCard>

          {!!tx?.tag?.length && (
            <Tags>
              {tx.tag.map((t, i) => {
                const active = (analysis?.dimension === "tag") &&
                  String(analysis.value || "").toLowerCase() === String(t).toLowerCase();
                return (
                  <Tag
                    key={`${t}-${i}`}
                    $active={active}
                    title="Analizza tag"
                    onClick={(e) => { e.stopPropagation(); onAnalyze?.({ dimension: "tag", value: t }); }}
                  >
                    #{t}
                  </Tag>
                );
              })}
            </Tags>
          )}

        </Details>
      )}
    </>
  );
}

/* ---------- main ---------- */

export default function RecentTransactions({
  transactions = [],
  categories = [],
  accounts = [],
  analysis,
  onEdit,
  onDelete,
  onAnalyze,
  onFiltersChange,
  onCreate,
  openExternalId,
  controlsRef
}) {
  const [openId, setOpenId] = useState(null);
  useEffect(()=>{ if (openExternalId) setOpenId(openExternalId); }, [openExternalId]);

  const catIdx = useMemo(() => buildCatIndex(categories), [categories]);
  const getCat = (tx) =>
    catIdx.get(tx?.categoryId) || catIdx.get((tx?.categoryName || "").toLowerCase());

  // Header actions
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [creating, setCreating] = useState(false);

  // Filtri multi-select
  const [fTypes, setFTypes] = useState([]);
  const [fCats, setFCats] = useState([]);
  const [fSubs, setFSubs] = useState([]);
  const [fAccounts, setFAccounts] = useState([]);
  const [fBenefs, setFBenefs] = useState([]);
  const [fTags, setFTags] = useState([]);

  // opzioni dalle transazioni
  const allTypes = useMemo(()=> Array.from(new Set((transactions||[]).map(t=>t.type).filter(Boolean))), [transactions]);
  const allCats  = useMemo(()=> Array.from(new Set((transactions||[]).map(t=>t.categoryName).filter(Boolean))), [transactions]);
  const allSubs  = useMemo(()=> Array.from(new Set((transactions||[]).map(t=>t.subcategory).filter(Boolean))), [transactions]);
  const allAccs  = useMemo(()=> {
    const set = new Set();
    (transactions||[]).forEach(t=>{ if(t.accountId) set.add(t.accountId); if(t.accountTo) set.add(t.accountTo); });
    return Array.from(set);
  }, [transactions]);
  const allBenefs= useMemo(()=> Array.from(new Set((transactions||[]).map(t=>t.beneficiary).filter(Boolean))), [transactions]);
  const allTags  = useMemo(()=> {
    const set = new Set();
    (transactions||[]).forEach(t=> (t.tag||[]).forEach(x=>set.add(String(x))));
    return Array.from(set);
  }, [transactions]);

  const filterChips = useMemo(()=>{
    const out=[];
    fTypes.forEach(v=>out.push(['Tipo', v]));
    fCats.forEach(v=>out.push(['Categoria', v]));
    fSubs.forEach(v=>out.push(['Sub', v]));
    fAccounts.forEach(v=>out.push(['Conto', v]));
    fBenefs.forEach(v=>out.push(['Beneficiario', v]));
    fTags.forEach(v=>out.push(['Tag', `#${v}`]));
    return out;
  }, [fTypes,fCats,fSubs,fAccounts,fBenefs,fTags]);

  const removeChip = (k,v)=>{
    if(k==='Tipo') setFTypes(fTypes.filter(x=>x!==v));
    else if(k==='Categoria') setFCats(fCats.filter(x=>x!==v));
    else if(k==='Sub') setFSubs(fSubs.filter(x=>x!==v));
    else if(k==='Conto') setFAccounts(fAccounts.filter(x=>x!==v));
    else if(k==='Beneficiario') setFBenefs(fBenefs.filter(x=>x!==v));
    else if(k==='Tag') setFTags(fTags.filter(x=>`#${x}`!==v));
  };

  // filtro AND
  const matchesAND = React.useCallback((t) => {
    // Filtri provenienti dall'analisi (click da SpendingPanel)
    if (analysis && analysis.dimension) {
      const v = String(analysis.value || "").toLowerCase();
      if (analysis.dimension === "beneficiary") {
        if (String(t?.beneficiary || "").toLowerCase() !== v) return false;
     } else if (analysis.dimension === "category") {
        const byName = String(t?.categoryName || "").toLowerCase() === v;
        const byId   = String(t?.categoryId || "") === analysis.value;
        if (!(byName || byId)) return false;
      } else if (analysis.dimension === "subcategory") {
        if (String(t?.subcategory || "").toLowerCase() !== v) return false;
      } else if (analysis.dimension === "tag") {
        const tags = (t?.tag || []).map(s=>String(s).toLowerCase());
        if (!tags.includes(v)) return false;
      } else if (analysis.dimension === "month") {
        // "YYYY-MM" dal click su una colonna/etichetta mese
        const d = parseDateEU(t?.date);
        const key = d ? `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}` : "";
        if (key !== analysis.value) return false;
      }
    }

    if (fTypes.length && !fTypes.includes(t.type)) return false;
    if (fCats.length  && !fCats.includes(t.categoryName)) return false;
    if (fSubs.length  && !fSubs.includes(t.subcategory)) return false;
    if (fAccounts.length){
      const acc = [t.accountId, t.accountTo].filter(Boolean);
      if (!acc.some(a => fAccounts.includes(a))) return false;
    }
    if (fBenefs.length && !fBenefs.includes(t.beneficiary)) return false;
    if (fTags.length){
      const tag = (t.tag||[]).map(String);
      if (!fTags.every(sel => tag.includes(sel))) return false;
    }
    return true;
  }, [fTypes, fCats, fSubs, fAccounts, fBenefs, fTags]);

  // lista filtrata + ordinata
  const filteredItems = useMemo(
    () => sortByDateDesc((transactions||[]).filter(matchesAND)),
    [transactions, fTypes, fCats, fSubs, fAccounts, fBenefs, fTags, analysis?.dimension, analysis?.value]
  );

  // visibilità paginata
  const [visibleCount, setVisibleCount] = useState(6);
  useEffect(()=>{ setVisibleCount(6); }, [fTypes, fCats, fSubs, fAccounts, fBenefs, fTags, transactions]);
  const total = filteredItems.length;
  const showMore = () => setVisibleCount(c => Math.min(c + 5, total));
  const showAll  = () => setVisibleCount(total);
  const showLess = () => setVisibleCount(6);

  // notifica parent per spending panel
   useEffect(()=>{
    onFiltersChange?.(
      { types:fTypes, cats:fCats, subs:fSubs, accounts:fAccounts, benefs:fBenefs, tags:fTags },
      matchesAND
    );
  }, [onFiltersChange, fTypes, fCats, fSubs, fAccounts, fBenefs, fTags, /* no: transactions */]);

  // --- API per controlli esterni (toolbar nel parent) ---
  const hasActiveFilters = useMemo(() =>
    !!(fTypes.length || fCats.length || fSubs.length || fAccounts.length || fBenefs.length || fTags.length),
  [fTypes, fCats, fSubs, fAccounts, fBenefs, fTags]);

  useEffect(() => {
    if (!controlsRef) return;
    controlsRef.current = {
      toggleFilters: () => setFiltersOpen(v => !v),
      openNew: () => setCreating(true),
      clearFilters: () => { setFTypes([]); setFCats([]); setFSubs([]); setFAccounts([]); setFBenefs([]); setFTags([]); },
      hasActiveFilters: () => hasActiveFilters,
    };
    return () => { if (controlsRef) controlsRef.current = null; };
  }, [controlsRef, hasActiveFilters]);

  return (
    <>
      {filtersOpen && (
        <FilterPanel
            onClick={()=>{
            setFTypes([]); setFCats([]); setFSubs([]); setFAccounts([]); setFBenefs([]); setFTags([]);
          }} title="Pulisci filtri">
          <FilterGrid>
            <Field>
              <Label>Tipo</Label>
              <Slicer label="Tipo" options={allTypes} selected={fTypes} onChange={setFTypes} placeholder="Cerca tipo…" />
            </Field>
            <Field>
              <Label>Categoria</Label>
              <Slicer label="Categoria" options={allCats} selected={fCats} onChange={setFCats} placeholder="Cerca categoria…" />
            </Field>
            <Field>
              <Label>Sottocategoria</Label>
              <Slicer label="Sottocategoria" options={allSubs} selected={fSubs} onChange={setFSubs} placeholder="Cerca sub…" />
            </Field>
            <Field>
              <Label>Conti</Label>
              <Slicer label="Conti" options={allAccs} selected={fAccounts} onChange={setFAccounts} placeholder="Cerca conto…" />
            </Field>
            <Field>
              <Label>Beneficiari</Label>
              <Slicer label="Beneficiari" options={allBenefs} selected={fBenefs} onChange={setFBenefs} placeholder="Cerca beneficiario…" />
            </Field>
            <Field>
              <Label>Tag</Label>
              <Slicer label="Tag" options={allTags} selected={fTags} onChange={setFTags} placeholder="Cerca tag…" />
            </Field>
          </FilterGrid>
              <div style={{display:"flex", gap:8, justifyContent:"flex-end", marginTop:8}}>
                <BtnAccent onClick={()=>{
                  setFTypes([]); setFCats([]); setFSubs([]); setFAccounts([]); setFBenefs([]); setFTags([]);
                }}>
                  Azzera filtri
                </BtnAccent>
                <Btn onClick={()=>setFiltersOpen(false)}>Chiudi</Btn>
              </div>
        </FilterPanel>
      )}

      {hasActiveFilters && (
        <ActiveFiltersBar>
          {/* chips senza testo “extra”: niente parentesi */}
          {filterChips.map(([k,v])=>(
            <Pill key={`${k}:${v}`}>
              <span className="k">{k}</span><span>{v}</span>
              <button onClick={()=>removeChip(k,v)} title="Rimuovi">×</button>
            </Pill>
          ))}
          {/* gommina sempre disponibile anche a pannello chiuso */}
          <SummaryEraser
            onClick={()=>{
              setFTypes([]); setFCats([]); setFSubs([]); setFAccounts([]); setFBenefs([]); setFTags([]);
            }}
            title="Pulisci tutti i filtri"
          >
            <Lucide.Eraser />
          </SummaryEraser>
        </ActiveFiltersBar>
      )}

      <List>
        {filteredItems.slice(0, visibleCount).map((item) => {
          const cat = getCat(item);
          const key = item?.id ?? `${item?.date ?? "no-date"}-${Math.random().toString(36).slice(2)}`;
          return (
            <RowItem
              key={key}
              tx={item}
              category={cat}
              open={openId === item?.id}
              onToggle={() => setOpenId((v) => (v === item?.id ? null : item?.id))}
              onEdit={onEdit}
              onDelete={onDelete}
              onAnalyze={onAnalyze}
              analysis={analysis}
            />
          );
        })}
        <ListControls>
          {visibleCount < total ? (
            <>
              <ControlBtn onClick={showMore}>Mostra altre</ControlBtn>
              <ControlBtn onClick={showAll}>Mostra tutte</ControlBtn>
            </>
          ) : total > 6 ? (
            <ControlBtn onClick={showLess}>Mostra meno</ControlBtn>
          ) : null}
        </ListControls>
      </List>

      {creating && (
        <TransactionEditPopup
          tx={{
            id: "new",
            date: new Date().toLocaleString("en-GB", {
              weekday:"long", day:"2-digit", month:"2-digit", year:"numeric", hour:"2-digit", minute:"2-digit"
            }).replace(",", ""),
            type: "Uscita",
            importo: 0,
            tag: []
          }}
          accounts={accounts}
          categories={categories}
          transactions={transactions}
          onClose={()=>setCreating(false)}
          onSave={(newTx)=>{
            setCreating(false);
            onCreate ? onCreate(newTx) : console.log("CREATE TX", newTx);
          }}
          mode="create"
        />
      )}
    </>
  );
}
