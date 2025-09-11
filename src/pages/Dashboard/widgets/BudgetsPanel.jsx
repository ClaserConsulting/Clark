import React, {useMemo, useState} from "react";
import styled from "styled-components";
import * as Lucide from "lucide-react";

const Wrap = styled.div`
  position: relative;
`;

/* badge n° budget attivi che "sbuca" dall'angolo alto sx */
const Badge = styled.div`
  position:absolute; top:-8px; left:-8px;
  background:#f59e0b; color:#111; font-weight:700;
  border-radius: 999px; padding: 2px 8px; font-size:.75rem;
  box-shadow: 0 6px 14px rgba(0,0,0,.18);
`;

/* header collassabile */
const Head = styled.button`
  width:100%; display:flex; align-items:center; justify-content:space-between;
  border:1px solid ${({theme})=>theme.separator}; background:${({theme})=>theme.card};
  color:inherit; border-radius:12px; padding:10px 12px; cursor:pointer;
  h4{margin:0; display:inline-flex; gap:8px; align-items:center;}
  .chev{ transition: transform .15s ease; transform: rotate(${p=>p.$open ? "180deg":"0deg"}); }
`;

/* corpo pannello */
const Panel = styled.div`
  display:grid; gap:10px; margin-top:10px;
`;

/* singolo budget */
const Row = styled.div`
  position:relative; display:grid; gap:6px; padding:10px 10px 10px 10px;
  border:1px solid ${p=>p.theme.separator}; border-radius:12px; background:${p=>p.theme.card};
`;

const Top = styled.div`
  display:flex; justify-content:space-between; align-items:center; gap:8px;
  padding-right: 34px; /* spazio per l'ingranaggio */
`;

const GearBtn = styled.button`
  position:absolute; top:8px; right:8px;
  border:1px solid ${p=>p.theme.separator}; background:${p=>p.theme.card}; color:inherit;
  border-radius:999px; padding:6px; display:grid; place-items:center; cursor:pointer;
  opacity:0; transform:scale(.9); transition:.15s ease;
  ${Row}:hover & { opacity:1; transform:scale(1); }
`;

const Bar = styled.div`height:10px; border-radius:999px; background:${p=>p.theme.cardHover}; overflow:hidden;`;
const Fill = styled.div`
  height:100%;
  width:${p=>Math.min(p.ratio,1)*100}%;
  background:${p=>p.ratio>1 ? "#ef4444" : "#22c55e"};
  transition:width .18s ease;
`;

function periodRange(period, offset=0, base=new Date()){
  const d = new Date(base);
  if(period==="day"){ d.setDate(d.getDate()+offset);
    const s=new Date(d.getFullYear(),d.getMonth(),d.getDate()), e=new Date(d.getFullYear(),d.getMonth(),d.getDate()+1);
    return {start:s,end:e,label:s.toLocaleDateString()};
  }
  if(period==="week"){ const day=(d.getDay()+6)%7; d.setDate(d.getDate()-day+offset*7);
    const s=new Date(d.getFullYear(),d.getMonth(),d.getDate()), e=new Date(s); e.setDate(s.getDate()+7);
    return {start:s,end:e,label:`Settimana ${s.toLocaleDateString()}`};
  }
  if(period==="year"){ const y=d.getFullYear()+offset; return {start:new Date(y,0,1), end:new Date(y+1,0,1), label:String(y)}; }
  const y=d.getFullYear(), m=d.getMonth()+offset; return {start:new Date(y,m,1), end:new Date(y,m+1,1),
    label:new Date(y,m,1).toLocaleDateString("it-IT",{month:"long",year:"numeric"})};
}

export default function BudgetsPanel({ transactions=[], budgets=[], onEditBudget }) {
  const [cursorById, setCursorById] = useState({});   // {budgetId: offset}
  const [open, setOpen] = useState(false);            // pannello collassabile (default chiuso)

  const items = useMemo(()=> budgets.map(b=>{
    const cur = cursorById[b.id]||0;
    const {start,end,label} = periodRange(b.period, cur);
    const match = (t)=>{
      const td = new Date(t.dateISO || t.date);
      if(!(td>=start && td<end)) return false;
      const inArr=(arr,val)=>!arr||arr.length===0||(Array.isArray(val)?val.some(v=>arr.includes(String(v))):arr.includes(String(val)));
      return inArr(b.include?.beneficiaries, t.beneficiary)
          && inArr(b.include?.categories, t.categoryName || t.categoryId)
          && inArr(b.include?.subcategories, t.subcategory)
          && inArr(b.include?.tags, (t.tag||[]));
    };
    const sum = transactions.filter(match).reduce((a,t)=> a + (Number(t.importo)||0), 0);
    const ratio = b.limit>0 ? (sum/b.limit) : 0;
    return {...b, sum, ratio, label};
  }), [budgets, transactions, cursorById]);

  return (
    <Wrap>
      <Badge title="Budget attivi">{items.length}</Badge>

      <Head onClick={()=>setOpen(o=>!o)} $open={open} aria-expanded={open}>
        <h4><Lucide.Flag /> Controllo budget</h4>
        <Lucide.ChevronDown className="chev" />
      </Head>

      {open && (
        <Panel>
          {items.map(b=>(
            <Row key={b.id}>
              <GearBtn onClick={()=>onEditBudget?.(b)} title="Modifica budget">
                <Lucide.Settings size={14}/>
              </GearBtn>

              <Top>
                <span>{b.name} • {b.label}</span>
                <span style={{color: b.ratio>1 ? "#ef4444" : "#22c55e"}}>
                  {b.sum.toFixed(2)} / {b.limit.toFixed(2)}
                </span>
              </Top>

              <Bar><Fill ratio={b.ratio}/></Bar>

              <div style={{display:"flex", gap:6, justifyContent:"flex-end"}}>
                <button onClick={()=>setCursorById(s=>({...s,[b.id]:(s[b.id]||0)-1}))}>{'←'}</button>
                <button onClick={()=>setCursorById(s=>({...s,[b.id]:0}))}>Oggi</button>
                <button onClick={()=>setCursorById(s=>({...s,[b.id]:(s[b.id]||0)+1}))}>{'→'}</button>
              </div>
            </Row>
          ))}

          {items.length===0 && <div style={{opacity:.7}}>Nessun budget configurato.</div>}
        </Panel>
      )}
    </Wrap>
  );
}
