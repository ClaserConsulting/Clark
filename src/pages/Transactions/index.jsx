// src/pages/Transactions/index.jsx
import React, { useMemo, useState } from "react";
import styled from "styled-components";
import * as Lucide from "lucide-react";
import RecentTransactions from "../Dashboard/widgets/RecentTransactions";
import TransactionEditPopup from "../../components/popups/TransactionEditPopup";

const Page = styled.div`display:grid; gap:12px;`;
const TopBar = styled.div`display:flex; gap:8px; align-items:center; justify-content:space-between;`;
const Left = styled.div`display:flex; gap:8px; align-items:center;`;
const Right = styled.div`display:flex; gap:8px; align-items:center;`;

const Toggle = styled.div`
  border:1px solid ${({theme})=>theme.separator}; border-radius:999px; overflow:hidden;
  button{ border:0; padding:6px 10px; background:transparent; color:${({theme})=>theme.text}; cursor:pointer; }
  button.active{ background:${({theme})=>theme.cardHover}; font-weight:700; }
`;

const Input = styled.input`
  border:1px solid ${({theme})=>theme.separator}; background:${({theme})=>theme.cardHover};
  color:${({theme})=>theme.text}; border-radius:8px; padding:6px 8px;
`;

const Table = styled.table`
  width:100%; border-collapse: collapse; border-spacing:0;
  th, td{ padding:8px 10px; border-bottom:1px solid ${({theme})=>theme.separator}; text-align:left; }
  th{ text-transform: uppercase; font-size:.78rem; letter-spacing:.5px; }
  tr:hover td{ background:${({theme})=>theme.cardHover}; }
`;

function csvEscape(v){ if (v==null) return ""; const s=String(v); return /[",\n]/.test(s) ? `"${s.replace(/"/g,'""')}"` : s; }
function toCSV(rows){
  const cols = ["date","type","categoryName","subcategory","beneficiary","accountId","accountTo","importo","comment","tag"];
  const header = cols.join(",");
  const lines = rows.map(r => cols.map(c => csvEscape(c==="tag" ? (r.tag||[]).join("|") : r[c])).join(","));
  return [header, ...lines].join("\n");
}

export default function TransactionsPage({ transactions = [], categories = [], accounts = [] }){
  const [mode, setMode] = useState("pretty"); // 'pretty' | 'grid'
  const [q, setQ] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [minAmt, setMinAmt] = useState("");
  const [maxAmt, setMaxAmt] = useState("");
  const [editing, setEditing] = useState(null);

  const filtered = useMemo(()=>{
    const qq = q.toLowerCase().trim();
    const fromT = from ? new Date(from).getTime() : -Infinity;
    const toT   = to   ? new Date(to).getTime()   : Infinity;
    const inRange = (dstr)=>{
      if (!dstr) return true;
      const m = String(dstr).match(/(\d{2})\/(\d{2})\/(\d{4})\s+(\d{2}):(\d{2})/);
      if (!m) return true;
      const [, dd, mm, yyyy, HH, MM] = m;
      const t = new Date(+yyyy, +mm - 1, +dd, +HH, +MM).getTime();
      return t >= fromT && t <= toT;
    };
    const inAmt = (v)=>{
      const n = Number(v||0);
      if (minAmt !== "" && n < Number(minAmt)) return false;
      if (maxAmt !== "" && n > Number(maxAmt)) return false;
      return true;
    };
    return (transactions||[]).filter(t=>{
      const hay = [t.date, t.type, t.categoryName, t.subcategory, t.beneficiary, t.accountId, t.accountTo, t.comment, ...(t.tag||[])].join(" ").toLowerCase();
      return (!qq || hay.includes(qq)) && inRange(t.date) && inAmt(t.importo);
    });
  }, [transactions, q, from, to, minAmt, maxAmt]);

  function exportCSV(){
    const csv = toCSV(filtered);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "transazioni.csv"; a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <Page>
      <TopBar>
        <Left>
          <Toggle>
            <button className={mode==="pretty"?"active":""} onClick={()=>setMode("pretty")}><Lucide.LayoutGrid size={16}/> Stilosa</button>
            <button className={mode==="grid"?"active":""} onClick={()=>setMode("grid")}><Lucide.Table2 size={16}/> Excel</button>
          </Toggle>
          <Input placeholder="Cerca…" value={q} onChange={e=>setQ(e.target.value)} />
          <Input type="date" value={from} onChange={e=>setFrom(e.target.value)} />
          <Input type="date" value={to} onChange={e=>setTo(e.target.value)} />
          <Input type="number" step="0.01" placeholder="€ min" value={minAmt} onChange={e=>setMinAmt(e.target.value)} />
          <Input type="number" step="0.01" placeholder="€ max" value={maxAmt} onChange={e=>setMaxAmt(e.target.value)} />
        </Left>
        <Right>
          <button onClick={exportCSV} style={{border:0,borderRadius:10,padding:"8px 12px"}}><Lucide.Download size={16}/> Esporta CSV</button>
          {/* TODO: Import CSV */}
        </Right>
      </TopBar>

      {mode === "pretty" ? (
        <RecentTransactions
          transactions={filtered}
          categories={categories}
          onEdit={(tx)=>setEditing(tx)}
          onDelete={(tx)=>alert("TODO: elimina " + tx.id)}
          onAnalyze={(a)=>console.log("ANALYZE", a)}
        />
      ) : (
        <Table>
          <thead>
            <tr>
              <th>Data</th><th>Tipo</th><th>Categoria</th><th>Sub</th><th>Beneficiario</th><th>Conto</th><th>Dest.</th><th>Importo</th><th>Note</th><th>Tag</th><th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(t=>(
              <tr key={t.id}>
                <td>{t.date}</td>
                <td>{t.type}</td>
                <td>{t.categoryName}</td>
                <td>{t.subcategory}</td>
                <td>{t.beneficiary}</td>
                <td>{t.accountId}</td>
                <td>{t.accountTo}</td>
                <td style={{textAlign:"right"}}>{Number(t.importo||0).toFixed(2)}</td>
                <td>{t.comment}</td>
                <td>{(t.tag||[]).map(x=>"#"+x).join(" ")}</td>
                <td><button onClick={()=>setEditing(t)} style={{border:0,borderRadius:8,padding:"4px 8px"}}><Lucide.Pencil size={16}/></button></td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      {editing && (
        <TransactionEditPopup
          tx={editing}
          accounts={accounts}
          categories={categories}
          transactions={transactions}
          onClose={()=>setEditing(null)}
          onSave={(updated)=>{ console.log("SAVE TX", updated); setEditing(null); }}
        />
      )}
    </Page>
  );
}
