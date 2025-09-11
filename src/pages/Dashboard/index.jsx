// 📁 src/pages/Dashboard/index.jsx
import React, { useState, useRef, useMemo, useEffect, useCallback } from "react";
import * as Lucide from "lucide-react";
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
import SpendingPanel from "./widgets/SpendingPanel"; // opzionale
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

  /* Mobile: stack verticale */
  grid-template-columns: 1fr;
  grid-template-areas:
    "headL"
    "left"
    "headR"
    "right";

  @media (min-width: 1100px) {
    grid-template-columns: minmax(0, 6fr) minmax(0, 4fr);     /* ~60/40 */
    grid-template-rows: auto 1fr;  /* titoli sopra, pannelli sotto */
    grid-template-areas:
      "headL headR"
      "left  right";
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

const RecentPanel = styled(Section)`
  position: relative;
  overflow: visible;
  margin-top: -16px;
  padding-top: calc(16px + 8px);
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

const WithRightRail = styled.div`
  padding-right: var(--right-rail-width, 0px);
  transition: padding-right .18s ease;
`;

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

  return (
    <Page>
      <WithRightRail>
        <Container>
          <PageGrid>
            <SpacerRow />

            <AccountsArea>
              <AccountTiles
                accounts={accountList}
                onClickAccount={handleClickAccount}
                onAdd={handleAddAccount}
              />
            </AccountsArea>

            <WideRow>
              <FavoritesBar
                favorites={favorites}
                suggestions={favUniverse}
                onChange={setFavorites}
                onSelect={(fav)=>{ setFavorites(prev=>prev); /* opzionale: filtra cliccando */ }}
                onAdd={handleAddFavorite}
              />
            </WideRow>


            <TwoCol>
              <HeadL>
                <BookmarkTitle $animate style={{cursor:"pointer"}}
                  onClick={()=>recentRef.current?.scrollIntoView({behavior:"smooth", block:"start"})}>
                  Transazioni recenti
                </BookmarkTitle>
                <Toolbar>
                  <RoundIcon
                    onClick={()=>rtControls.current?.toggleFilters?.()}
                    title="Filtra"
                    $active={rtControls.current?.hasActiveFilters?.()}
                  >
                    <Lucide.Filter />
                  </RoundIcon>
                  <RoundIcon
                    onClick={()=>rtControls.current?.openNew?.()}
                    title="Nuova transazione"
                  >
                    <Lucide.Plus />
                  </RoundIcon>
                </Toolbar>
              </HeadL>
              <HeadR>
                <BookmarkTitle $animate style={{cursor:"pointer"}}
                  onClick={()=>spendingRef.current?.scrollIntoView({behavior:"smooth", block:"start"})}>
                  {formatAnalysisTitle(analysis, { categories, accounts, defaultTitle: "Analisi entrate/uscite" })}
                </BookmarkTitle>
              </HeadR>
              <LeftCol>

                {/* Pannello budget */}
                <Section>
                  <BudgetsPanel
                    transactions={withBalances(filteredTransactions || [], accounts || [])}
                    budgets={budgets}
                  />
                </Section>

                {/* Transazioni recenti */}
                <RecentPanel ref={recentRef}>
                  <RecentTransactions
                    controlsRef={rtControls}
                    transactions={withBalances(filteredTransactions, accounts)}
                    categories={categories}
                    accounts={accountList}
                    analysis={analysis}
                    openExternalId={openTxId}
                    onAnalyze={(q) => setAnalysis(q)}
                    onEdit={(tx) => setEditingTx(tx)}
                    onDelete={(tx) => {/* elimina */}}
                    onFiltersChange={handleFiltersChange} // se lo usi per lo spending panel
                    onCreate={handleCreateTx}
                  />
                </RecentPanel>
              </LeftCol>
              <RightCol>
                <SpendingArea ref={spendingRef}>
                  <CornerBulb $on={!!analysis}>
                    <Lucide.Lightbulb />
                  </CornerBulb>
                  <SpendingPanel 
                    transactions={spendingTx}
                    categories={categories}
                    analysis={analysis}
                    onAnalyze={(q) => setAnalysis(q)}
                    onClear={() => setAnalysis(null)}
                  />
                </SpendingArea>
              </RightCol>
            </TwoCol>
          </PageGrid>

          {/* POPUPs */}
          {selectedAccount && (
            <AccountDetailsPopup
              account={selectedAccount}
              onClose={closePopups}
              onSave={(updated) => {
                // aggiorna la lista locale
                setAccountList(prev => prev.map(a => a.id === updated.id ? updated : a));
              }}
            />
          )}

          {showNewPopup && (
            <NewAccountPopup
              onClose={closePopups}
              onCreate={(newAccount) => {
                // ✅ aggiunge subito la tile
                const id = newAccount?.id ?? String(Date.now());
                const color = newAccount?.color ?? "#6aa9ff";
                const name = newAccount?.name ?? "Nuovo Conto";
                const balance = Number.isFinite(newAccount?.balance) ? newAccount.balance : 0;

                setAccountList((prev) => [
                  ...prev,
                  { id, color, name, balance },
                ]);

                closePopups();
              }}
            />
          )}

          {editingTx && (
            <TransactionEditPopup
              tx={editingTx}
              accounts={accountList}
              categories={categories}
              onClose={() => setEditingTx(null)}
              onSave={(updated) => {
              // TODO se hai lo store globale, chiama l’update lì.
                    // Esempio: sostituisci nel tuo array "transactions" se ce l’hai in stato.
                    // setTransactions(prev => prev.map(t => t.id === updated.id ? updated : t));
                setEditingTx(null);
              }}
            />
          )}
        </Container>
      </WithRightRail>

        {/* Rail destra riducibile */}
        <NotificationsRail
          alerts={alerts}
          onDismiss={(id)=>setAlerts(arr=>arr.filter(a=>a.id!==id))}
          onClear={()=>setAlerts([])}
        />
    </Page>
  );
};

export default Dashboard;
