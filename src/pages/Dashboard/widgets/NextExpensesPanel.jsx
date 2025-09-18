// src/pages/Dashboard/widgets/NextExpensesPanel.jsx
import React, { useMemo, useRef, useState } from "react";
import styled from "styled-components";
import * as Lucide from "lucide-react";
import { Section } from "../../Dashboard/styled";

const Card = styled(Section)`
  position: relative;
  padding-top: 10px;
`;

const Head = styled.div`
  display:flex; align-items:center; justify-content:space-between; gap:10px;
  margin-bottom: 8px;
  h4{ margin:0; display:inline-flex; gap:8px; align-items:center; min-width:0; }
  .btns{ flex:0 0 auto; display:inline-flex; gap:6px; }
`;

const MonthButton = styled.button`
  display:inline-grid; place-items:center;
  width:32px; height:32px; border-radius:10px;
  border:1px solid ${({theme})=>theme.separator};
  background:${({theme})=>theme.cardHover}; color:inherit; cursor:pointer;
  flex:0 0 auto;   /* ⬅️ non comprimere, non allargare */
`;

const Totals = styled.div`
  display:grid; grid-template-columns: 1fr 1fr; gap:8px; margin: 8px 0 10px;
  .t{
    border:1px solid ${({theme})=>theme.separator};
    background:${({theme})=>theme.card}; border-radius:10px; padding:8px;
    display:grid; gap:4px;
  }
  .lab{ opacity:.75; font-size:.8rem; }
  .val{ font-weight:800; }
`;

const GroupHead = styled.div`
  opacity:.85; margin: 6px 0 4px; display:flex; align-items:center; gap:8px;
`;

const Row = styled.div`
  display:grid; grid-template-columns:auto 1fr auto; gap:8px;
  padding:8px 10px; border-radius:10px; margin-bottom:6px;
  border:1px solid ${({theme})=>theme.separator}; background:${({theme})=>theme.card};
  .day{ opacity:.8 }
  .title{ min-width:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
  .amt{ font-weight:800; }
`;

function ym(dt) {
  const d = new Date(dt); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`;
}
function monthLabel(dt) {
  return new Date(dt).toLocaleDateString("it-IT", { month:"long", year:"numeric" });
}
function addMonths(dt, n) {
  const d=new Date(dt); d.setMonth(d.getMonth()+n); return d;
}
function firstOfMonth(isoYM) {
  const [y,m]=isoYM.split("-").map(Number);
  return new Date(y, m-1, 1);
}
function inMonth(date, isoYM) {
  const d = new Date(date);
  return ym(d) === isoYM;
}
function fmtDay(date) {
  const d = new Date(date);
  return String(d.getDate()).padStart(2,"0");
}

export default function NextExpensesPanel({ planned = [], hideHeader = false }) {
  // planned: [{id, date, title, amount, type:"Entrata"|"Uscita"}]
  const [month, setMonth] = useState(ym(new Date()));
  const monthInputRef = useRef(null);

  const curr = useMemo(() => {
    const list = planned.filter(p => inMonth(p.date, month));
    const totOut = list.filter(p => p.type==="Uscita").reduce((a,b)=>a+Math.abs(+b.amount||0),0);
    const totIn  = list.filter(p => p.type==="Entrata").reduce((a,b)=>a+Math.abs(+b.amount||0),0);
    return { list, totOut, totIn, label: monthLabel(firstOfMonth(month)) };
  }, [planned, month]);

  const nextMonth = ym(addMonths(firstOfMonth(month), 1));
  const next = useMemo(() => {
    const list = planned.filter(p => inMonth(p.date, nextMonth));
    const totOut = list.filter(p => p.type==="Uscita").reduce((a,b)=>a+Math.abs(+b.amount||0),0);
    const totIn  = list.filter(p => p.type==="Entrata").reduce((a,b)=>a+Math.abs(+b.amount||0),0);
    return { list, totOut, totIn, label: monthLabel(firstOfMonth(nextMonth)) };
  }, [planned, nextMonth]);

  return (
    <Card>
      {!hideHeader && (
        <Head>
                <div className="btns">
                <MonthButton onClick={()=>setMonth(ym(addMonths(firstOfMonth(month), -1)))} title="Mese precedente">
                    <Lucide.ChevronLeft size={16}/>
                </MonthButton>
                <MonthButton title="Scegli mese" style={{ position: "relative" }}>
                    <Lucide.Calendar size={16} />
                    <input
                        ref={monthInputRef}
                        type="month"
                        value={month}
                        onChange={(e) => setMonth(e.target.value)}
                        aria-label="Scegli mese"
                        // 👇 l'input copre tutto il bottone, è cliccabile ed è invisibile
                        style={{
                        position: "absolute",
                        inset: 0,
                        opacity: 0,
                        cursor: "pointer",
                        // niente pointerEvents: "none" altrimenti non è un gesto utente!
                        }}
                    />
                    </MonthButton>
                <MonthButton onClick={()=>setMonth(ym(new Date()))} title="Questo mese">
                    <Lucide.Target size={16}/>
                </MonthButton>
                <MonthButton onClick={()=>setMonth(ym(addMonths(firstOfMonth(month), +1)))} title="Mese successivo">
                    <Lucide.ChevronRight size={16}/>
                </MonthButton>
                </div>
        </Head>
      )}

        {/* ===== Mese corrente ===== */}
        <GroupHead>
            <Lucide.Dot size={18}/> <b>{curr.label}</b>
        </GroupHead>

        <Totals>
            <div className="t">
            <div className="lab">Totale entrate</div>
            <div className="val" style={{color:"#22c55e"}}>+{curr.totIn.toFixed(2)}€</div>
            </div>
            <div className="t">
            <div className="lab">Totale spese</div>
            <div className="val" style={{color:"#ef4444"}}>-{curr.totOut.toFixed(2)}€</div>
            </div>
        </Totals>

        {curr.list.length ? curr.list.map(it=>(
            <Row key={`c-${it.id}`}>
            <span className="day">{fmtDay(it.date)}</span>
            <span className="title">{it.title}</span>
            <span className="amt" style={{ color: it.type==="Uscita" ? "#ef4444" : "#22c55e" }}>
                {it.type==="Uscita" ? "-" : "+"}{Number(it.amount||0).toFixed(2)}€
            </span>
            </Row>
        )) : <div style={{opacity:.6, marginBottom:8}}>Nessuna scadenza.</div>}

        {/* ===== Mese successivo ===== */}
        <GroupHead style={{marginTop:12}}>
            <Lucide.Dot size={18}/> <b>{next.label}</b>
        </GroupHead>

        <Totals>
            <div className="t">
            <div className="lab">Totale entrate</div>
            <div className="val" style={{color:"#22c55e"}}>+{next.totIn.toFixed(2)}€</div>
            </div>
            <div className="t">
            <div className="lab">Totale spese</div>
            <div className="val" style={{color:"#ef4444"}}>-{next.totOut.toFixed(2)}€</div>
            </div>
        </Totals>

        {next.list.length ? next.list.map(it=>(
            <Row key={`n-${it.id}`}>
            <span className="day">{fmtDay(it.date)}</span>
            <span className="title">{it.title}</span>
            <span className="amt" style={{ color: it.type==="Uscita" ? "#ef4444" : "#22c55e" }}>
                {it.type==="Uscita" ? "-" : "+"}{Number(it.amount||0).toFixed(2)}€
            </span>
            </Row>
        )) : <div style={{opacity:.6}}>Nessuna scadenza.</div>}
    </Card>
  );
}
