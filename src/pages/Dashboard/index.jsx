// 📁 src/pages/Dashboard/index.jsx
import React, { useState, useRef, useMemo, useEffect, useCallback } from "react";
import * as Lucide from "lucide-react";
import WidgetFrame from "./widgets/WidgetFrame";
import { Star, Gauge, Plus, ChevronDown, ChevronUp } from "lucide-react";
import styled from "styled-components";
import { Page, Container, BookmarkTitle, Section } from "./styled";
import AccountTiles from "./widgets/AccountTiles";
import { AccountDetailsPopup } from "../../components/popups/AccountDetailsPopup";
import NewAccountPopup from "../../components/popups/NewAccountPopup";
import NotificationsRail from "../../layout/NotificationsRail";
import FavoritesBar from "./widgets/FavoritesBar";
import BudgetsPanel from "./widgets/BudgetsPanel";
import RecentTransactions from "./widgets/RecentTransactions";
import TransactionEditPopup from "../../components/popups/TransactionEditPopup";
import SpendingPanel from "./widgets/SpendingPanel";
import NextExpensesPanel from "./widgets/NextExpensesPanel";
import {categories} from "../../data/categories"
import { accounts as defaultAccounts } from "../../data/accounts";
import { formatAnalysisTitle } from "../../utils/format";
import { useSearch } from "../../context/SearchContext";

// helper
// "Tuesday 02/07/2025 08:51" -> Date
const parseDateEU = (s) => {
  if (!s) return null;
  const m = String(s).match(/(\d{2})\/(\d{2})\/(\d{4})\s+(\d{2}):(\d{2})/);
  if (!m) return null;
  const [, dd, mm, yyyy, HH, MM] = m;
  return new Date(+yyyy, +mm - 1, +dd, +HH, +MM);
};

// calcola pre/post partendo dai SALDI CORRENTI (reverse running balance)
const withBalances = (txs = [], accounts = []) => {
  const key = (s) => String(s ?? "").toLowerCase().trim();
  const tkey = (s) => String(s ?? "").toLowerCase().trim();

  // saldi correnti (oggi)
  const bal = new Map();
  for (const a of accounts) bal.set(key(a.name), Number(a.balance) || 0);

  // più recenti → più vecchie
  const sorted = [...txs].sort(
    (a, b) => (parseDateEU(b?.date)?.getTime() ?? 0) - (parseDateEU(a?.date)?.getTime() ?? 0)
  );

  const out = [];
  for (const tx of sorted) {
    const type = tkey(tx.type);
    const kFrom = key(tx.accountId);
    const kTo   = key(tx.accountTo);
    const raw   = Number(tx.importo);
    const has   = Number.isFinite(raw);

    if (type === "trasferimento" && kFrom && kTo) {
      // ORIGINE = accountId, DESTINAZIONE = accountTo (sempre)
      const m = has ? Math.abs(raw) : 0;      // magnitudo dello spostamento (sempre positiva)

      const afterFrom = bal.get(kFrom);       // saldo "dopo" (stato corrente mentre risaliamo)
      const afterTo   = bal.get(kTo);

      // Reverse: before = after - delta_forward
      // forward: origine -m, destinazione +m
      const beforeFrom = Number.isFinite(afterFrom) ? afterFrom + m : undefined; // -(-m)
      const beforeTo   = Number.isFinite(afterTo)   ? afterTo   - m : undefined; // -(+m)

      if (Number.isFinite(beforeFrom)) bal.set(kFrom, beforeFrom);
      if (Number.isFinite(beforeTo))   bal.set(kTo,   beforeTo);

      out.push({
        ...tx,
        // per la prima strip usiamo SEMPRE l'origine (accountId)
        balanceBefore: beforeFrom,
        balanceAfter:  afterFrom,

        // campi espliciti per entrambe le parti
        sourceBefore:  beforeFrom,
        sourceAfter:   afterFrom,
        destBefore:    beforeTo,
        destAfter:     afterTo,

        sourceAccountName: tx.accountId,
        destAccountName:   tx.accountTo,
      });
      continue;
    }

    // ENTRATA / USCITA (singolo conto), segno "canonizzato"
    const delta =
      !has ? 0 :
      (type === "entrata" ? +Math.abs(raw) :
       type === "uscita"  ? -Math.abs(raw) :
       raw);

    const after = bal.get(kFrom);
    const before = Number.isFinite(after) ? after - delta : undefined; // reverse

    if (Number.isFinite(before)) bal.set(kFrom, before);

    out.push({ ...tx, balanceBefore: before, balanceAfter: after });
  }

  // ripristina ordine originale
  const byId = new Map(out.map(t => [t.id, t]));
  return txs.map(t => byId.get(t.id) || t);
};

// Griglia pagina: spacer (riga vuota), poi accounts, poi blocco 70/30
const PageGrid = styled.div`
  display: grid;
  gap: 16px;
  grid-template-columns: 1fr;
  grid-template-areas:
    "spacer"
    "accounts"
    "wide1"
    "content";
  min-width: 0;
  width: 100%;
  overflow-x: hidden;
`;

// === 3-col shell: left rail | center stack | right rail ===
const MainGrid = styled.div`
  --center-max: 980px; /* stessa “impronta” delle Transazioni */
  display: grid;
  grid-template-columns: 1fr min(var(--center-max), 100%) 1fr;
  grid-template-rows: auto auto auto auto; /* accounts, budget, favorites, transactions */
  gap: 16px;
  align-items: start;
`;

const CenterRow1 = styled.div` grid-column: 2; grid-row: 1; `;
const CenterRow2 = styled.div` grid-column: 2; grid-row: 2; `;
const CenterRow3 = styled.div` grid-column: 2; grid-row: 3; `;
const CenterRow4 = styled.div` grid-column: 2; grid-row: 4; `;
const LeftRailAtTx  = styled.div` grid-column: 1; grid-row: 4; `;
const RightRailAtTx = styled.div` grid-column: 3; grid-row: 4; `;

const SideWidget = styled(Section)`
  position: sticky;
  top: 96px; /* resta in vista durante lo scroll */
`;
const SideTitle = styled.h4`
  margin: 0 0 8px 0; display: inline-flex; gap: 8px; align-items: center;
`;

// Riga vuota sotto la navbar, allineata con il contenuto (a destra della sidebar)
const SpacerRow = styled.div`
  grid-area: spacer;
  height: clamp(8px, 1.2vw, 16px);
  padding-left: 8px;
`;

// Riga a due colonne: 70% / 30%, poco spazio a dx della sidebar
const TwoCol = styled.div`
  grid-area: content;
  display: grid;
  gap: 16px;
  padding-left: 8px;
  min-width: 0;
  width: 100%;

  /* Mobile */
  grid-template-columns: 1fr;
  grid-template-areas:
    "widL"
    "widR"
    "headL"
    "left"
    "headR"
    "right";

  @media (min-width: 1100px) {
    grid-template-columns: minmax(0, 6fr) minmax(0, 4fr); /* ~60/40 */
    grid-template-areas:
      "widL  widR"   /* riga widget: Budget | Preferiti */
      "headL headR"  /* titoli allineati */
      "left  right"; /* pannelli principali */
  }
`;

const AccountsArea = styled.div`
  grid-area: accounts;
  min-width: 0;
  padding-left: 8px;
`;

const HeadL = styled.div`grid-area: headL;`;
const HeadR = styled.div`grid-area: headR;`;

const Toolbar = styled.span`
  margin-left: 8px;
  display: inline-flex;
  gap: 8px;
  vertical-align: middle;
`;

const RoundIcon = styled.button`
  width: 32px; height: 32px;
  border-radius: 999px;
  display: grid; place-items: center;
  border: 1px solid ${({$active, theme})=>$active ? "#fff" : theme.separator};
  background: ${({$active, theme})=>$active ? "#fff" : theme.card};
  color: ${({$active, theme})=>$active ? "#111" : theme.text};
  cursor: pointer;
  transition: transform .12s ease, box-shadow .12s ease, background .12s ease, color .12s ease;
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 6px 16px rgba(0,0,0,.25);
    background: ${({$active, theme})=>$active ? "#fff" : theme.cardHover};
  }
  svg { width: 16px; height: 16px; }
`;

const RecentArea = styled(Section)`
  grid-area: left;
  position: relative;
  overflow: visible;
  margin-top: -16px;                  /* intersezione a metà del segnalibro */
  padding-top: calc(16px + 8px);      /* recupero interno */
`;

const SpendingArea = styled(Section)`
  grid-area: right;
  position: relative;
  overflow: visible;
  margin-top: -16px;
  padding-top: calc(16px + 8px);
  scroll-margin-top: 122px;  /* regola se il tuo header è più alto/basso */
`;

const LeftCol = styled.div`
  grid-area: left;
  display: grid;
  gap: 16px;
  align-content: start;
`;

const RightCol = styled.div`
  grid-area: right;
  display: grid;
  gap: 16px;
  position: relative;
`;

const CornerBulb = styled.div`
  position: absolute;
  /* a ridosso del bordo esterno del Section */
  top: -6px;         /* mettila metà fuori: regola -4/-8 a gusto */
  right: -6px;
  z-index: 20;
  width: 28px;
  height: 28px;
  display: grid;
  place-items: center;
  pointer-events: none;
  opacity: ${({ $on }) => ($on ? 1 : 0)};
  transform: ${({ $on }) => ($on ? "translateY(0)" : "translateY(-2px)")};
  transition: opacity .18s ease, transform .18s ease;
  /* piena bianca e un po' più grande */
  svg { width: 24px; height: 24px; fill: #fff; stroke: #fff; }
`;

const WideRow = styled(Section)`
  grid-area: wide1;
  padding-left: 8px;            /* allineato alle tiles */
`;

const WidgetsRow = styled.div`
  grid-area: wide1;
  padding-left: 8px;
  display: grid;
  gap: 16px;
  grid-template-columns: repeat(12, minmax(0, 1fr));
  align-items: start;
`;
const Col6 = styled.div`grid-column: span 12; @media(min-width:1100px){ grid-column: span 6; }`;

const WithRightRail = styled.div`
  padding-right: var(--right-rail-width, 0px);
  transition: padding-right .18s ease;
`;

// ============ LAYOUT 3 COLONNE ROBUSTO ============

const Board = styled.div`
  /* knob regolabili (puoi sovrascriverli nell'inline style di <Board/>) */
  --rail-min: 300px;
  --rail-max: 380px;
  --center-min: 820px;         /* <--- MINIMO GARANTITO per la colonna Transazioni */
  --center-max: 1080px;        /* <--- larghezza "desiderata" del centro */
  --page-max: 1840px;
  --gap-x: clamp(12px, 2vw, 24px);
  --top-align: 20px;

  display: grid;
  grid-template-columns:
    clamp(var(--rail-min), 22vw, var(--rail-max))
    minmax(var(--center-min), var(--center-max))
    clamp(var(--rail-min), 22vw, var(--rail-max));
  grid-template-areas: "left center right";
  column-gap: var(--gap-x);
  align-items: start;
  justify-content: center;

  width: 100%;
  max-width: min(100%, var(--page-max));
  margin: 0 auto;
  padding-inline: clamp(8px, 1.4vw, 24px);

  /* Se lo spazio non basta per i minimi → impila sotto, così il centro non collassa */
  @media (max-width: calc(2 * var(--rail-min) + var(--center-min) + 120px)) {
    grid-template-columns: minmax(0, 1fr);
    grid-template-areas:
      "center"
      "left"
      "right";
  }
`;

const CenterStack = styled.div`
  grid-area: center;
  display: grid;
  gap: 12px;
  align-content: start;
  margin-top: var(--top-align);
  min-width: 0; /* fondamentale per evitare overflow */
  & * { min-width: 0; } /* i figli non devono imporre larghezze */
`;

const StackCard = styled(Section)`
  width: 100%;
  overflow: visible;
  & * { min-width: 0; }       /* evita comprimimenti strani */
`;

const LeftRail  = styled.div`
  grid-area: left;
  margin-top: var(--top-align);
  min-width: 0;
`;

const RightRail = styled.div`
  grid-area: right;
  margin-top: var(--top-align);
  min-width: 0;
`;

/* pannelli rail senza scrollbar interne */
const RailPanel = styled(Section)`
  overflow: visible !important;
  max-height: none !important;
  & * { min-width: 0; }
`;

const RightRailPanel = styled(RailPanel)``;

/* pannello Transazioni: evita testi “verticali” quando lo spazio è tirato */
const RecentPanel = styled(Section)`
  overflow: visible;
  & * { min-width: 0; }
  word-break: break-word;
`;

const RailTitle = styled.div`
  display:flex; align-items:center; justify-content:space-between; gap:8px;
  margin-bottom:8px;
  h4 { margin:0; display:inline-flex; gap:8px; align-items:center; }
`;

const TriGrid = styled.div`
  display: grid;
  gap: 16px;
  grid-template-columns: minmax(300px, 380px) minmax(680px, 1fr) minmax(300px, 380px);
  align-items: start;
  width: 100%;
 /* aria dall’alto (configurabile via inline style) */
 padding-top: var(--top-gap, 28px);
 /* niente overflow: nascosto, serve che i flyout (preferiti) possano “uscire” */
 overflow: visible;
`;

const BellFab = styled.button`
  position: fixed; right: 14px; top: 86px; z-index: 2500;
  width: 38px; height: 38px; border-radius: 999px;
  display: grid; place-items: center; cursor: pointer;
  border: 1px solid ${({theme})=>theme.separator};
  background: ${({theme})=>theme.card}; color: ${({theme})=>theme.text};
  box-shadow: 0 10px 24px rgba(0,0,0,.28);
  &:hover{ background: ${({theme})=>theme.cardHover}; }
  .dot{
    position:absolute; top:4px; right:4px; width:8px; height:8px; border-radius:999px;
    background:#f59e0b;
  }
`;

const WidgetLeft  = styled(Section)` grid-area: widL;  margin-top:-16px; padding-top:calc(16px + 8px); `;
const WidgetRight = styled(Section)` grid-area: widR;  margin-top:-16px; padding-top:calc(16px + 8px); `;

const Dashboard = ({ accounts, transactions, filteredTransactions }) => {
  // 🔧 Stato locale per far apparire subito la nuova tile
  const [accountList, setAccountList] = useState(accounts ?? defaultAccounts);
  useEffect(() => { if (accounts) setAccountList(accounts); }, [accounts]);

  const [filters, setFilters] = useState({
    type: "Tutti",
    accountId: "Tutti",
    categoryName: "Tutte",
  });

  const matches = useCallback((t) => {
    if (!t) return false;

    // Tipo
    if (filters.type !== "Tutti" && t.type !== filters.type) return false;

    // Account: considera sia origine che destinazione (per i trasferimenti)
    if (filters.accountId !== "Tutti") {
      const accs = [t.accountId, t.accountTo].filter(Boolean);
      if (!accs.includes(filters.accountId)) return false;
    }

    // Categoria
    if (filters.categoryName !== "Tutte" && t.categoryName !== filters.categoryName) return false;

    return true;
  }, [filters]);


  const [selectedAccount, setSelectedAccount] = useState(null);
  const [showNewPopup, setShowNewPopup] = useState(false);

  const handleClickAccount = (account) => setSelectedAccount(account);
  const handleAddAccount = () => setShowNewPopup(true);

  const { analysis, setAnalysis, openTxId, clearOpenTx } = useSearch();
  const spendingRef = useRef(null);

  const [editingTx, setEditingTx] = useState(null);

  const txWithBalances = useMemo(() => withBalances(filteredTransactions || [], accounts || []), [filteredTransactions, accounts]);
  const filteredWithBalances = useMemo(
    () => withBalances(filteredTransactions || [], accounts || []),
    [filteredTransactions, accounts]
  );

  const rtControls = useRef(null);

  const [rtFilterFn, setRtFilterFn] = useState(null);

  // Preferiti (beneficiari/categorie/sottocategorie)
  const [favorites, setFavorites] = useState([]); // [{type:'beneficiary'|'category'|'subcategory', id?, label}]
  
  const favUniverse = useMemo(()=>{
    const set = new Map();
    // beneficiari
    (filteredTransactions || []).forEach(t=>{
      const b = String(t.beneficiary||"").trim();
      if (b) set.set(`beneficiary:${b}`, {type:"beneficiary", label:b, icon:"User"});
    });
    // categorie / sottocategorie
    (categories || []).forEach(c=>{
      if (c?.name) set.set(`category:${c.name}`, {type:"category", label:c.name, icon:"Folder"});
      (c.subcategories||[]).forEach(s=>{
        if (s) set.set(`subcategory:${s}`, {type:"subcategory", label:s, icon:"Tag"});
      });
    });
    return Array.from(set.values());
  }, [filteredTransactions, categories]);

  const handleAddFavorite = useCallback(() => {
    // TODO: apri un tuo dialog per scegliere; stub:
    console.log("Aggiungi preferito");
  }, []);

  const handleSelectFavorite = useCallback((fav) => {
    if (!fav) { setRtFilterFn(null); return; }
    // imposta un filtro che impatta RecentTransactions + SpendingPanel
    setRtFilterFn(()=> (t) => {
      if (!t) return false;
      if (fav.type === "beneficiary") return String(t.beneficiary) === fav.label;
      if (fav.type === "category")    return String(t.categoryName) === fav.label || String(t.categoryId) === fav.id;
      if (fav.type === "subcategory") return String(t.subcategory) === fav.label;
      return true;
    });
  }, []);

  // Budgets demo (puoi sostituire con i tuoi dati)
  const [budgets, setBudgets] = useState([
    { id:"b1", name:"Spesa mensile Alimentari", period:"month", limit:300,
      include:{ beneficiaries:[], categories:["Alimentari"], subcategories:[], tags:[] } }
  ]);

  // meta: cosa è spostabile/nascondibile
  const WIDGETS_META = {
    favorites: { title: "Preferiti", icon: Star,   canMove: true,  canHide: true  },
    budgets:   { title: "Controllo budget", icon: Gauge, canMove: true,  canHide: true  },
    // regole future:
    // accounts: { canMove:false, canHide:false }
    // recent:   { canMove:true,  canHide:false }
  };
  const [row1Order, setRow1Order] = useState(["favorites", "budgets"]);

  // DnD molto semplice
  const [dragKey, setDragKey] = useState(null);
  const onDragStartWidget = (key) => (e) => { setDragKey(key); e.dataTransfer.setData("text/plain", key); };
  const onDragOverWidget  = (e) => e.preventDefault();
  const onDropWidget = (targetKey) => (e) => {
    e.preventDefault();
    const src = dragKey || e.dataTransfer.getData("text/plain");
    if (!src || src === targetKey) return;
    setRow1Order(prev => {
      const arr = [...prev];
      const from = arr.indexOf(src);
      const to   = arr.indexOf(targetKey);
      if (from<0 || to<0) return arr;
      arr.splice(to, 0, arr.splice(from,1)[0]);
      return arr;
    });
    setDragKey(null);
  };

// collapse e visibilità widget
const [favCollapsed, setFavCollapsed] = useState(false);
const [budgetCollapsed, setBudgetCollapsed] = useState(false);
const [hiddenWidgets, setHiddenWidgets] = useState({ favorites:false, budgets:false });

// normalizza suggerimenti per FavoritesBar (icona = stringa)
const normalizeFavSuggestions = useCallback((txs = [], cats = [])=>{
  const m = new Map();
  (txs||[]).forEach(t=>{
    const b = String(t.beneficiary||"").trim();
    if (b) m.set(`beneficiary:${b}`, { type:"beneficiary", label:b, icon:"User" });
  });
  (cats||[]).forEach(c=>{
    const name = String(c?.name||"").trim();
    if (name) m.set(`category:${name}`, { type:"category", label:name, icon:"Folder" });
    (c?.subcategories||[]).forEach(s=>{
      const sub = String(s||"").trim();
      if (sub) m.set(`subcategory:${sub}`, { type:"subcategory", label:sub, icon:"Tag" });
    });
  });
  return Array.from(m.values());
},[]);

const favSuggestions = useMemo(
  () => normalizeFavSuggestions(filteredTransactions, categories),
  [filteredTransactions, categories, normalizeFavSuggestions]
);

  // Notifiche demo
  const [alerts, setAlerts] = useState([
    {id:"a1", kind:"good", title:"Saver badge", text:"Ieri niente sigarette ✅"},
    {id:"a2", kind:"bad",  title:"Ristorante ↑", text:"+45% rispetto alla media settimanale"}
  ]);

  const pushAlert = (a) =>
  setAlerts(prev => [{ id: crypto.randomUUID(), ts: Date.now(), ...a }, ...prev]);

  const recentRef = React.useRef(null);

  const handleFiltersChange = useCallback((meta, filterFn /*, snapshot*/) => {
    // salva la funzione per filtrare anche lo SpendingPanel
    setRtFilterFn(() => filterFn || null);
  }, []);

  const handleCreateTx = useCallback((newTx) => {
    // TODO: salva su store; per ora log
    console.log("NEW TX", newTx);
  }, []);

  const spendingTx = useMemo(() => {
    const base = withBalances(filteredTransactions || [], accounts || []);
    return rtFilterFn ? base.filter(rtFilterFn) : base;
  }, [filteredTransactions, accounts, rtFilterFn]);

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

  // Filtro derivato dall'analisi (click da SpendingPanel)
    const analysisFilter = useMemo(() => {
      if (!analysis || !analysis.dimension) return null;
      const v = String(analysis.value || "").toLowerCase();

      return (t) => {
        if (!t) return false;
        switch (analysis.dimension) {
          case "beneficiary":
            return String(t.beneficiary || "").toLowerCase() === v;
          case "category":
            return (
              String(t.categoryName || "").toLowerCase() === v ||
              String(t.categoryId || "") === analysis.value
            );
          case "subcategory":
            return String(t.subcategory || "").toLowerCase() === v;
          case "tag": {
            const tags = (t.tag || []).map((s) => String(s).toLowerCase());
            return tags.includes(v);
          }
          case "month": {
            const d = parseDateEU(t?.date);
            const key = d ? `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}` : "";
            return key === analysis.value;
          }
          default:
            return true;
        }
      };
    }, [analysis]);

    // Combina eventuale filtro “manuale” (preferiti/altro) con quello da analisi
    const combinedFilter = useMemo(() => {
      if (rtFilterFn && analysisFilter) return (t) => rtFilterFn(t) && analysisFilter(t);
      return rtFilterFn || analysisFilter || null;
    }, [rtFilterFn, analysisFilter]);

    // Base e derivato per RecentTransactions
    const recentBase = useMemo(
      () => withBalances(filteredTransactions || [], accounts || []),
      [filteredTransactions, accounts]
    );
    const recentTx = useMemo(
      () => (combinedFilter ? recentBase.filter(combinedFilter) : recentBase),
      [recentBase, combinedFilter]
    );

  useEffect(() => {
  if (analysis && spendingRef.current) {
    spendingRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [analysis]);

  const closePopups = () => {
    setSelectedAccount(null);
    setShowNewPopup(false);
  };

  useEffect(() => {
    if (!openTxId) return;
    // RecentTransactions riceve openExternalId e la apre; poi azzeriamo il trigger
    const t = setTimeout(() => clearOpenTx(), 0);
    return () => clearTimeout(t);
  }, [openTxId, clearOpenTx]);

// === Prossime scadenze: mese corrente e prossimo ===
  const today = new Date();
  const startThis = new Date(today.getFullYear(), today.getMonth(), 1);
  const startNext = new Date(today.getFullYear(), today.getMonth()+1, 1);
  const startAfterNext = new Date(today.getFullYear(), today.getMonth()+2, 1);

  const fmtDay = (d)=> d.toLocaleDateString("it-IT", { day:"2-digit", month:"short" });

/** Se hai una tua sorgente "planned", usala qui; altrimenti demo fallback */
const planned = []; // <-- sostituisci con i tuoi promemoria/pianificazioni, es. dal tuo store

const upcomingAll = useMemo(()=>{
  const base = (planned || []).map(p => ({
    id: p.id || crypto.randomUUID(),
    title: p.title || p.name || "Promemoria",
    amount: Number(p.amount) || 0,
    type: p.type || "Uscita",        // "Entrata" | "Uscita"
    date: new Date(p.dueDate),
  }));

  // fallback demo se non hai ancora dati
  if (!base.length) {
    return [
      { id:"u1", title:"Affitto",           amount: 650,   type:"Uscita", date: new Date(today.getFullYear(), today.getMonth(), 27) },
      { id:"u2", title:"Stipendio",         amount: 1800,  type:"Entrata", date: new Date(today.getFullYear(), today.getMonth()+1, 1) },
      { id:"u3", title:"Spotify",           amount: 9.99,  type:"Uscita", date: new Date(today.getFullYear(), today.getMonth()+1, 5) },
    ];
  }
  return base;
}, [planned]);

const upcomingThisMonth = useMemo(
  ()=> upcomingAll.filter(x => x.date >= startThis && x.date < startNext)
                  .sort((a,b)=>a.date-b.date),
  [upcomingAll]
);
const upcomingNextMonth = useMemo(
  ()=> upcomingAll.filter(x => x.date >= startNext && x.date < startAfterNext)
                  .sort((a,b)=>a.date-b.date),
  [upcomingAll]
);

const [notifOpen, setNotifOpen] = useState(false);
const alertsCount = alerts?.length || 0;   // già usi `alerts` nello stato

return (
  <Page>
    <Container>
      {/* puoi personalizzare qui la larghezza del centro e l'allineamento verticale */}
      <Board style={{ "--center-min":"860px", "--center-max":"1040px", "--top-align":"18px" }}>

        {/* SINISTRA: ANALISI */}
        <LeftRail>
          <RailPanel>
            <RailTitle>
              <h4>
                <Lucide.Lightbulb />
                {formatAnalysisTitle(analysis, { categories, accounts, defaultTitle: "Analisi entrate/uscite" })}
              </h4>
              {analysis && (
                <RoundIcon title="Azzera analisi" onClick={() => setAnalysis(null)}>
                  <Lucide.X />
                </RoundIcon>
              )}
            </RailTitle>

            <SpendingPanel
              transactions={spendingTx}
              categories={categories}
              analysis={analysis}
              onAnalyze={(q) => setAnalysis(q)}
              onClear={() => setAnalysis(null)}
            />
          </RailPanel>
        </LeftRail>

        {/* CENTRO: CONTI → BUDGET → PREFERITI → TRANSAZIONI */}
        <CenterStack>
          {/* 1) I TUOI CONTI */}
          <StackCard as="div" id="center-accounts">
            <BookmarkTitle $animate style={{ marginBottom: 8 }}>I tuoi conti</BookmarkTitle>
            <AccountTiles
              accounts={accountList}
              onClickAccount={handleClickAccount}
              onAdd={handleAddAccount}
              /* se hai un prop per le colonne, puoi lasciarlo com’è */
            />
          </StackCard>

          {/* 2) PREFERITI */}
          <StackCard as="div" id="center-favorites">
            <BookmarkTitle $animate style={{ marginBottom: 8 }}>Preferiti</BookmarkTitle>
            <FavoritesBar
              favorites={favorites}
              suggestions={favSuggestions /* o favUniverse, quello che usi */}
              onChange={setFavorites}
              onSelect={(fav) => {
                if (!fav) { setRtFilterFn(null); return; }
                setRtFilterFn(() => (t) => {
                  if (!t) return false;
                  if (fav.type === "beneficiary") return String(t.beneficiary) === fav.label;
                  if (fav.type === "category")    return String(t.categoryName) === fav.label || String(t.categoryId) === fav.id;
                  if (fav.type === "subcategory") return String(t.subcategory) === fav.label;
                  return true;
                });
              }}
              hideHeader           // niente titolo interno (usiamo il BookmarkTitle sopra)
              darkSuggestions      // se l’hai, per avere il flyout scuro
            />
          </StackCard>

          {/* 3) CONTROLLO BUDGET */}
          <StackCard as="div" id="center-budgets">
            <div style={{display:"flex", alignItems:"center", justifyContent:"space-between", gap:8, marginBottom:8}}>
              <BookmarkTitle $animate>Controllo budget</BookmarkTitle>
              <button
                onClick={()=>setBudgetCollapsed(v=>!v)}
                title={budgetCollapsed ? "Espandi" : "Comprimi"}
                style={{display:"grid",placeItems:"center",width:30,height:30,borderRadius:10,
                        border:"1px solid var(--separator)",background:"var(--cardHover)",color:"inherit"}}
              >
                {budgetCollapsed ? <ChevronDown size={16}/> : <ChevronUp size={16}/>}
              </button>
            </div>
            <BudgetsPanel
              transactions={withBalances(filteredTransactions || [], accounts || [])}
              budgets={budgets}
              hideHeader
              collapsedExtern={budgetCollapsed}
              onToggleExtern={()=>setBudgetCollapsed(v=>!v)}
            />
          </StackCard>

          {/* 4) TRANSAZIONI RECENTI */}
          <RecentPanel id="center-transactions">
            <div style={{display:"flex", alignItems:"center", justifyContent:"space-between", gap:8, marginBottom:8}}>
              <BookmarkTitle $animate>Transazioni recenti</BookmarkTitle>
              <span style={{display:"inline-flex", gap:8}}>
                <RoundIcon
                  onClick={() => rtControls.current?.toggleFilters?.()}
                  title="Filtra"
                  $active={rtControls.current?.hasActiveFilters?.()}
                >
                  <Lucide.Filter/>
                </RoundIcon>
                <RoundIcon
                  onClick={() => rtControls.current?.openNew?.()}
                  title="Nuova transazione"
                >
                  <Lucide.Plus/>
                </RoundIcon>
              </span>
            </div>

            <RecentTransactions
              controlsRef={rtControls}
              transactions={recentTx}
              categories={categories}
              accounts={accountList}
              analysis={analysis}
              openExternalId={openTxId}
              onAnalyze={(q) => setAnalysis(q)}
              onEdit={(tx) => setEditingTx(tx)}
              onDelete={(tx) => {/* elimina */}}
              onFiltersChange={handleFiltersChange}
              onCreate={handleCreateTx}
            />
          </RecentPanel>
        </CenterStack>

        {/* DESTRA: PROSSIME SCADENZE */}
        <RightRail>
          <RightRailPanel>
            <RailTitle>
              <h4><Lucide.CalendarDays/> Attività pianificate</h4>
              {/* i tuoi bottoni calendario/prev/next/oggi possono stare qui */}
            </RailTitle>
            <NextExpensesPanel />
          </RightRailPanel>
        </RightRail>

      </Board>
    </Container>

    {/* campanella & rail notifiche come già avevi */}
    <BellFab onClick={()=>setNotifOpen(v=>!v)} title="Notifiche">
      <Lucide.Bell />
      {alertsCount>0 && <span className="dot" />}
    </BellFab>
    <NotificationsRail
      open={notifOpen}
      onOpenChange={setNotifOpen}
      alerts={alerts}
      onDismiss={(id)=>setAlerts(arr=>arr.filter(a=>a.id!==id))}
      onClear={()=>setAlerts([])}
    />
  </Page>
);
};

export default Dashboard;