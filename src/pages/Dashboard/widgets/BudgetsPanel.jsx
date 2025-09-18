// src/pages/Dashboard/widgets/BudgetsPanel.jsx
import React, { useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import * as Lucide from "lucide-react";

const Wrap = styled.div`position:relative;`;

/* Badge (conteggio) che sbuca dall’angolo quando usi l’header interno */
const Badge = styled.div`
  position:absolute; top:-8px; left:-8px;
  background:#f59e0b; color:#111; font-weight:700;
  border-radius:999px; padding:2px 8px; font-size:.75rem;
  box-shadow:0 6px 14px rgba(0,0,0,.18);
`;

/* Header collassabile (usato solo se hideHeader=false) */
const Head = styled.button`
  width:100%;
  display:flex; align-items:center; justify-content:space-between;
  border:1px solid ${({theme})=>theme.separator};
  background:${({theme})=>theme.card}; color:inherit;
  border-radius:12px; padding:10px 12px; cursor:pointer;
  h4{margin:0; display:inline-flex; gap:8px; align-items:center;}
  .chev{transition:.15s ease; transform:rotate(${p=>p.$open ? "180deg" : "0deg"});}
`;

/* Corpo pannello */
const Panel = styled.div`display:grid; gap:10px; margin-top:10px;`;

/* Singola riga budget */
const Row = styled.div`
  position:relative; display:grid; gap:6px; padding:10px;
  border:1px solid ${({theme})=>theme.separator};
  border-radius:12px; background:${({theme})=>theme.card};
`;

const Top = styled.div`
  display:flex; justify-content:space-between; align-items:center; gap:8px;
  padding-right:34px; /* spazio per l’ingranaggio */
`;

const GearBtn = styled.button`
  position:absolute; top:8px; right:8px;
  border:1px solid ${({theme})=>theme.separator};
  background:${({theme})=>theme.card}; color:inherit;
  border-radius:999px; padding:6px; display:grid; place-items:center; cursor:pointer;
  opacity:0; transform:scale(.9); transition:.15s ease;
  ${Row}:hover & { opacity:1; transform:scale(1); }
`;

const Bar  = styled.div`height:10px; border-radius:999px; background:${({theme})=>theme.cardHover}; overflow:hidden;`;
const Fill = styled.div`
  height:100%;
  width:${p=>Math.min(p.ratio,1)*100}%;
  background:${p=>p.ratio>1 ? "#ef4444" : "#22c55e"};
  transition:width .18s ease;
`;

/* Util: calcolo periodo visibile (day/week/month default/year) */
function periodRange(period, offset=0, base=new Date()){
  const d = new Date(base);

  if (period === "day") {
    d.setDate(d.getDate()+offset);
    const s = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const e = new Date(d.getFullYear(), d.getMonth(), d.getDate()+1);
    return { start:s, end:e, label:s.toLocaleDateString("it-IT") };
  }

  if (period === "week") {
    const day = (d.getDay()+6)%7; // lun=0
    d.setDate(d.getDate()-day+offset*7);
    const s = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const e = new Date(s); e.setDate(s.getDate()+7);
    return { start:s, end:e, label:`Settimana ${s.toLocaleDateString("it-IT")}` };
  }

  if (period === "year") {
    const y = d.getFullYear()+offset;
    return { start:new Date(y,0,1), end:new Date(y+1,0,1), label:String(y) };
  }

  // month (default)
  const y = d.getFullYear(), m = d.getMonth()+offset;
  return {
    start: new Date(y, m, 1),
    end:   new Date(y, m+1, 1),
    label: new Date(y, m, 1).toLocaleDateString("it-IT", { month:"long", year:"numeric" })
  };
}

/**
 * BudgetsPanel
 * - Se lo usi dentro un contenitore con titolo (WidgetFrame), passa hideHeader=true
 * - collapsedExtern controlla l’apertura dall’esterno
 */
export default function BudgetsPanel({
  transactions = [],
  budgets = [],
  hideHeader = false,
  collapsedExtern = false,
  onToggleExtern,
  onEditBudget,             // opzionale: callback quando clicchi l’ingranaggio
}) {
  const [cursorById, setCursorById] = useState({}); // { [budgetId]: offset periodo }
  const [open, setOpen] = useState(!collapsedExtern);

  // Se cambia lo stato esterno, allinea l’apertura
  useEffect(()=>{ setOpen(!collapsedExtern); }, [collapsedExtern]);

  // Prepara i dati per ogni budget
  const items = useMemo(() => {
    const safeBudgets = Array.isArray(budgets) ? budgets : [];
    return safeBudgets.map(b => {
      const cur = cursorById[b.id] || 0;
      const { start, end, label } = periodRange(b.period || "month", cur);

      const inArr = (arr, val) => {
        if (!arr || arr.length === 0) return true;      // filtro non impostato => passa
        if (Array.isArray(val)) return val.some(v => arr.includes(String(v)));
        return arr.includes(String(val));
      };

      const match = (t) => {
        const td = new Date(t.dateISO || t.date);
        if (!(td >= start && td < end)) return false;

        return inArr(b.include?.beneficiaries, t.beneficiary)
            && inArr(b.include?.categories,    t.categoryName || t.categoryId)
            && inArr(b.include?.subcategories, t.subcategory)
            && inArr(b.include?.tags,          (t.tag || []));
      };

      const sum = transactions.filter(match)
        .reduce((acc, t) => acc + (Number(t.importo) || 0), 0);

      const limit = Number(b.limit) || 0;
      const ratio = limit > 0 ? (sum / limit) : 0;

      return { ...b, sum, limit, ratio, label };
    });
  }, [budgets, transactions, cursorById]);

  // Header interno (opzionale)
  const InternalHead = hideHeader ? null : (
    <>
      <Badge title="Budget attivi">{items.length}</Badge>
      <Head onClick={()=>{
            setOpen(v=>!v);
            onToggleExtern?.();
          }}
          $open={open}
          aria-expanded={open}
      >
        <h4><Lucide.Flag /> Controllo budget</h4>
        <Lucide.ChevronDown className="chev" />
      </Head>
    </>
  );

  return (
    <Wrap>
      {InternalHead}

      {open && (
        <Panel>
          {items.map(b => (
            <Row key={b.id}>
              <GearBtn onClick={()=>onEditBudget?.(b)} title="Modifica budget">
                <Lucide.Settings size={14}/>
              </GearBtn>

              <Top>
                <span>{b.name} • {b.label}</span>
                <span style={{color: b.ratio > 1 ? "#ef4444" : "#22c55e"}}>
                  {b.sum.toFixed(2)} / {b.limit.toFixed(2)}
                </span>
              </Top>

              <Bar><Fill ratio={b.ratio} /></Bar>

              <div style={{display:"flex", gap:6, justifyContent:"flex-end"}}>
                <button
                  onClick={()=>setCursorById(s => ({...s, [b.id]:(s[b.id]||0) - 1}))}
                  title="Periodo precedente"
                >←</button>
                <button
                  onClick={()=>setCursorById(s => ({...s, [b.id]:0}))}
                  title="Torna a oggi"
                >Oggi</button>
                <button
                  onClick={()=>setCursorById(s => ({...s, [b.id]:(s[b.id]||0) + 1}))}
                  title="Periodo successivo"
                >→</button>
              </div>
            </Row>
          ))}

          {items.length === 0 && (
            <div style={{opacity:.7}}>Nessun budget configurato.</div>
          )}
        </Panel>
      )}
    </Wrap>
  );
}