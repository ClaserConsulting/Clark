import React, { useMemo, useState } from "react";
import styled from "styled-components";
import * as Lucide from "lucide-react";

const Wrap = styled.div`display:grid; gap:12px;`;
const Tools = styled.div`display:flex; gap:8px; align-items:center; flex-wrap:wrap;`;
const Input = styled.input`
  border:1px solid ${({theme})=>theme.separator};
  background:${({theme})=>theme.card};
  color:inherit; border-radius:10px; padding:8px;
`;
const Select = styled.select`
  border:1px solid ${({theme})=>theme.separator};
  background:${({theme})=>theme.card};
  color:inherit; border-radius:10px; padding:8px;
`;
const List = styled.div`display:grid; gap:8px;`;
const Row = styled.div`
  display:grid; grid-template-columns: auto 1fr auto; gap:12px; align-items:center;
  border:1px solid ${({theme})=>theme.separator}; background:${({theme})=>theme.card};
  border-radius:12px; padding:8px 10px;
`;

export default function ActivityLog() {
  // TODO collega allo store reale: qui demo statico
  const demo = useMemo(()=>[
    { id:"l1", ts: Date.now()-3600_000,   type:"tx:create",   text:"Inserita transazione Uscita 25,90 : Alimentari • Conad" },
    { id:"l2", ts: Date.now()-7200_000,   type:"tx:update",   text:"Modificata transazione #A814 (note + categoria)" },
    { id:"l3", ts: Date.now()-86_400_000, type:"account:new", text:"Creato conto 'Carta Revolut' saldo iniziale 0,00" },
    { id:"l4", ts: Date.now()-172_800_000,type:"tx:delete",   text:"Eliminata transazione #A742 (Trasferimento)" },
    { id:"l5", ts: Date.now()-200_000,    type:"account:update", text:"Aggiornato saldo conto 'Conto Corrente' +150,00" },
  ],[]);

  const [q, setQ] = useState("");
  const [kind, setKind] = useState("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const filtered = useMemo(()=>{
    const s = q.trim().toLowerCase();
    const tFrom = from ? new Date(from).getTime() : -Infinity;
    const tTo = to ? new Date(to).getTime() : +Infinity;

    return demo
      .filter(r => kind==="all" ? true : r.type.startsWith(kind))
      .filter(r => !s || String(r.text||"").toLowerCase().includes(s))
      .filter(r => (r.ts||0)>=tFrom && (r.ts||0)<=tTo)
      .sort((a,b)=>(b.ts||0)-(a.ts||0));
  }, [demo, q, kind, from, to]);

  return (
    <Wrap>
      <h3 style={{margin:0, display:"inline-flex", gap:8, alignItems:"center"}}>
        <Lucide.ListTree/> <span>Log attività</span>
      </h3>

      <Tools>
        <Input placeholder="Cerca…" value={q} onChange={e=>setQ(e.target.value)} />
        <Select value={kind} onChange={e=>setKind(e.target.value)}>
          <option value="all">Tutti i tipi</option>
          <option value="tx:">Transazioni (tutti)</option>
          <option value="tx:create">Transazioni: create</option>
          <option value="tx:update">Transazioni: modificate</option>
          <option value="tx:delete">Transazioni: cancellate</option>
          <option value="account">Conti (tutti)</option>
          <option value="account:new">Conti: creati</option>
          <option value="account:update">Conti: modifiche</option>
        </Select>
        <Input type="date" value={from} onChange={e=>setFrom(e.target.value)} />
        <Input type="date" value={to} onChange={e=>setTo(e.target.value)} />
      </Tools>

      <List>
        {filtered.map(r=>(
          <Row key={r.id}>
            <span>
              {r.type.startsWith("tx") ? <Lucide.Receipt/> :
               r.type.startsWith("account") ? <Lucide.Wallet/> : <Lucide.FileText/>}
            </span>
            <div style={{minWidth:0, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap"}}>{r.text}</div>
            <div style={{opacity:.7}}>
              {new Date(r.ts||Date.now()).toLocaleString("it-IT",{day:"2-digit",month:"2-digit",year:"numeric",hour:"2-digit",minute:"2-digit"})}
            </div>
          </Row>
        ))}
        {filtered.length===0 && <div style={{opacity:.7}}>Nessun evento</div>}
      </List>
    </Wrap>
  );
}
