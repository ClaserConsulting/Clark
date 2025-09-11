// src/pages/Dashboard/widgets/NotificationsDock.jsx
import React, {useMemo, useState} from "react";
import styled from "styled-components";
import * as Lucide from "lucide-react";

const Wrap = styled.div`
  position:relative; height:100%;
`;
const Toggle = styled.button`
  position:sticky; top:10px;
  border:1px solid ${p=>p.theme.separator}; background:${p=>p.theme.card};
  border-radius:12px; padding:8px; cursor:pointer; display:flex; align-items:center; gap:6px;
`;
const Badge = styled.span`
  background:#ef4444; color:#fff; border-radius:999px; padding:0 6px; font-size:.75rem;
`;

const Panel = styled.div`
  position:sticky; top:10px;
  width:${p=>p.open? "320px":"0"};
  overflow:hidden; transition:width .18s ease;
  border-left:${p=>p.open? `1px solid ${p.theme.separator}` : "0"};
  margin-left:8px; padding-left:${p=>p.open? "8px":"0"};
`;

export default function NotificationsDock({ alerts=[], onDismiss, onClear }) {
  const [open, setOpen] = useState(true);
  const count = alerts.length;

  return (
    <Wrap>
      <Toggle onClick={()=>setOpen(o=>!o)} title="Notifiche">
        <Lucide.Bell />
        {count>0 && <Badge>{count}</Badge>}
      </Toggle>
      <Panel open={open}>
        <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8}}>
          <strong>Notifiche</strong>
          {count>0 && <button onClick={onClear}>Pulisci tutto</button>}
        </div>
        {alerts.length===0 && <div style={{opacity:.7}}>Nessun alert in sospeso.</div>}
        <div style={{display:"grid", gap:8}}>
          {alerts.map(a=>(
            <div key={a.id} style={{border:`1px solid var(--separator)`, borderRadius:10, padding:8, display:"grid", gap:4}}>
              <div style={{display:"flex", justifyContent:"space-between", alignItems:"center"}}>
                <span style={{display:"inline-flex", alignItems:"center", gap:6}}>
                  {a.kind==="good" ? <Lucide.BadgeCheck color="#22c55e"/> :
                   a.kind==="warn" ? <Lucide.AlertTriangle color="#f59e0b"/> :
                   <Lucide.AlertOctagon color="#ef4444"/>}
                  <strong>{a.title}</strong>
                </span>
                <button onClick={()=>onDismiss?.(a.id)} title="Chiudi">×</button>
              </div>
              <small style={{opacity:.8}}>{a.text}</small>
              {a.manage && <button onClick={()=>a.manage?.()}>Gestisci alert…</button>}
            </div>
          ))}
        </div>
      </Panel>
    </Wrap>
  );
}
