import React, { useMemo, useState } from "react";
import styled from "styled-components";
import * as Lucide from "lucide-react";
import { useLocation } from "react-router-dom";

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
  display:grid; grid-template-columns: 24px 1fr auto; gap:10px; align-items:center;
  border:1px solid ${({theme})=>theme.separator}; background:${({theme})=>theme.card};
  border-radius:12px; padding:8px 10px;
`;

export default function NotificationsLog() {
  // Se in futuro colleghi a uno store globale, carica qui.
  // Per ora prova a leggere dallo state della navigate (opzionale)
  const loc = useLocation();
  const initial = Array.isArray(loc.state?.alerts) ? loc.state.alerts : [];

  const [q, setQ] = useState("");
  const [kind, setKind] = useState("all");

  const data = useMemo(()=> initial, [initial]);

  const filtered = useMemo(()=>{
    const s = q.trim().toLowerCase();
    return data
      .filter(a => kind==="all" ? true : a.kind===kind)
      .filter(a =>
        !s ||
        String(a.title||"").toLowerCase().includes(s) ||
        String(a.text||"").toLowerCase().includes(s)
      )
      .sort((a,b)=>(b.ts||0)-(a.ts||0));
  }, [data, q, kind]);

  return (
    <Wrap>
      <h3 style={{margin:0, display:"inline-flex", gap:8, alignItems:"center"}}>
        <Lucide.Bell/><span>Tutte le notifiche</span>
      </h3>

      <Tools>
        <Input placeholder="Cerca…" value={q} onChange={e=>setQ(e.target.value)} />
        <Select value={kind} onChange={e=>setKind(e.target.value)}>
          <option value="all">Tutte</option>
          <option value="good">Good</option>
          <option value="warn">Warn</option>
          <option value="bad">Bad</option>
          <option value="medal">Medal</option>
        </Select>
      </Tools>

      <List>
        {filtered.map(a=>(
          <Row key={a.id}>
            <span>
              {a.kind==="good"  ? <Lucide.BadgeCheck/> :
               a.kind==="warn"  ? <Lucide.AlertTriangle/> :
               a.kind==="bad"   ? <Lucide.XOctagon/> :
               a.kind==="medal" ? <Lucide.Trophy/> : <Lucide.Info/>}
            </span>
            <div style={{minWidth:0}}>
              <div style={{fontWeight:600, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap"}}>{a.title}</div>
              <div style={{opacity:.85, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap"}}>{a.text}</div>
            </div>
            <div style={{opacity:.7}}>
              {new Date(a.ts||Date.now()).toLocaleString("it-IT",{day:"2-digit",month:"2-digit",year:"numeric",hour:"2-digit",minute:"2-digit"})}
            </div>
          </Row>
        ))}
        {filtered.length===0 && <div style={{opacity:.7}}>Niente da mostrare</div>}
      </List>
    </Wrap>
  );
}
