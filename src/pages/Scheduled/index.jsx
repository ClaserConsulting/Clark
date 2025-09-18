import React, { useMemo, useState } from "react";
import { BookmarkTitle, Section } from "../Dashboard/styled";
import * as Lucide from "lucide-react";

export default function Scheduled({ items=[], onChange }) {
  const [q,setQ] = useState("");
  const list = useMemo(()=>{
    const s = q.trim().toLowerCase();
    return (items||[]).filter(x =>
      !s || x.title.toLowerCase().includes(s)
      || String(x.amount).includes(s) || String(x.date).includes(s)
    ).sort((a,b)=>a.date.localeCompare(b.date));
  }, [items,q]);

  return (
    <div style={{padding:"12px"}}>
      <BookmarkTitle $animate>Spese pianificate</BookmarkTitle>
      <div style={{display:"flex",gap:8,margin:"8px 0 12px"}}>
        <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Cerca…" />
        <button onClick={()=>setQ("")}><Lucide.Eraser size={16}/></button>
      </div>

      <Section>
        {list.map(x=>(
          <div key={x.id} style={{display:"grid",
            gridTemplateColumns:"auto 1fr auto auto", gap:8, alignItems:"center",
            padding:"8px 10px", border:"1px solid var(--separator)", borderRadius:10, marginBottom:6}}>
            <span style={{opacity:.7}}>{x.date}</span>
            <span>{x.title}</span>
            <b style={{color:x.amount>=0?"#22c55e":"#ef4444"}}>{x.amount>=0?"+":""}{x.amount.toFixed(2)}€</b>
            <button title="Rimuovi" onClick={()=>onChange?.((prev)=>prev.filter(i=>i.id!==x.id))}>×</button>
          </div>
        ))}
        {list.length===0 && <div style={{opacity:.6}}>Nessuna voce.</div>}
      </Section>
    </div>
  );
}
