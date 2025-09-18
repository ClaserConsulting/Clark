import React, { useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import * as Lucide from "lucide-react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";

const RailWrap = styled.aside`
  position: fixed; top: 0; right: 0; bottom: 0; z-index: 1000;
  width: ${p => (p.$open ? "320px" : "0px")};
  transition: width .18s ease;
  overflow: hidden;
  border-left: ${p=>p.$open ? `1px solid ${p.theme.separator}` : "0"};
  background: ${({theme})=>theme.card};      /* come sidebar */
  color: ${({theme})=>theme.text};
  box-shadow: ${p=>p.$open ? "0 0 0 1px rgba(0,0,0,0.05), -12px 0 32px rgba(0,0,0,.35)" : "none"};
`;

const RailInner = styled.div`
  display: grid; grid-template-rows: auto 1fr; gap: 8px; height: 100%;
`;

const RailHead = styled.div`
  display:flex; align-items:center; justify-content:space-between; gap:8px;
  padding: 12px;
  border-bottom: 1px solid ${({theme})=>theme.separator};
  h4{margin:0; display:inline-flex; gap:8px; align-items:center;}
  .icons{ display:inline-flex; gap:8px; }
`;

const GhostIconBtn = styled.button`
  display:grid; place-items:center;
  width:32px; height:32px; border-radius:10px;
  border: 1px solid ${({theme})=>theme.separator};
  background: ${({theme})=>theme.cardHover};
  color: inherit; cursor:pointer;
  &:hover{ transform: translateY(-1px); box-shadow: 0 6px 16px rgba(0,0,0,.25); }
`;

const List = styled.div`
  padding: 8px 8px 12px; overflow: auto; height: 100%;
  display: flex; flex-direction: column; gap: 6px;   /* fitte */
`;

const Item = styled.button`
  display:grid; grid-template-columns: 24px 1fr auto; gap:10px; align-items:center;
  text-align:left; width:100%;
  background:${({theme})=>theme.card}; color:inherit;
  border:1px solid ${({theme})=>theme.separator};
  border-radius:12px; padding:8px 10px; cursor:pointer;
  &:hover{ background:${({theme})=>theme.cardHover}; }
  .title{ font-weight:600; }
  .ts{ opacity:.65; font-size:.8rem; }
  .kind{ opacity:.75; font-size:.8rem; }
`;

const RailTab = styled.button`
  position: fixed;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  transform: translateX(100%);             /* sta appena fuori dallo schermo */
  padding: 10px; border-radius: 10px 0 0 10px;
  background: ${({theme})=>theme.card};
  color:#fff;
  border:1px solid ${({theme})=>theme.separator};
  display: grid; place-items: center; cursor: pointer;
  z-index: 2500;
  .dot{
    position:absolute; top:6px; right:6px; width:8px; height:8px; border-radius:999px; background:#fff;
  }
  svg{ color: #fff; }                      /* campanella bianca */
`;

/* ===== Modal dettaglio ===== */
const Backdrop = styled.div`
  position: fixed; inset: 0; z-index: 3000;
  background: rgba(0,0,0,.5);             /* scuro + blur come altri popup */
  backdrop-filter: blur(12px);
  display: grid; place-items: center; padding: 5vh 12px;
`;
const Card = styled.div`
  width: min(720px, 92vw); max-height: 84vh; overflow:auto;
  background: ${({theme})=>theme.card}; color: ${({theme})=>theme.text};
  border-radius: 14px; padding: 14px; box-shadow: 0 10px 24px rgba(0,0,0,.4);
  display: grid; gap: 10px;
`;
const ModalHead = styled.div`
  display:flex; align-items:center; justify-content:space-between; gap:8px;
  border-bottom: 1px solid ${({theme})=>theme.separator}; padding-bottom:8px;
  h3{margin:0; display:inline-flex; gap:8px; align-items:center;}
`;
const ModalFoot = styled.div`
  display:flex; justify-content:flex-end; gap:8px; margin-top:4px;
`;
const Btn = styled.button`
  border:0; border-radius:10px; padding:8px 12px; cursor:pointer;
  background:${({theme})=>theme.cardHover}; color:inherit;
`;

export default function NotificationsRail({
  alerts = [],               // [{id, kind, title, text, ts}]
  onDismiss,                 // (id)=>void
  onClear,                   // ()=>void
}) {
  const [open, setOpen] = useState(false);
  const [details, setDetails] = useState(null);
  const navigate = useNavigate();

  // sposta il contenuto principale quando il rail è aperto
  useEffect(() => {
    document.documentElement.style.setProperty("--right-rail-width", open ? "340px" : "0px");
    return () => document.documentElement.style.setProperty("--right-rail-width", "0px");
  }, [open]);

  const unreadCount = alerts.length;

  const sorted = useMemo(
    () => [...alerts].sort((a,b)=>(b.ts||0)-(a.ts||0)),
    [alerts]
  );

  return (
    <>
      {/* Tab esterno sempre visibile */}
      <RailTab onClick={()=>setOpen(v=>!v)} title={open ? "Chiudi notifiche" : "Apri notifiche"}>
        <Lucide.Bell />
        {!!alerts.length && <span className="badge">{alerts.length}</span>}
      </RailTab>

      <RailWrap $open={open} onClick={(e)=>e.stopPropagation()}>
        <RailInner>
          <RailHead>
            <h4><Lucide.Bell /><span>Notifiche</span></h4>
            <div className="icons">
              <GhostIconBtn title="Pulisci tutte" onClick={onClear}>
                <Lucide.Eraser size={16}/>
              </GhostIconBtn>
            </div>
          </RailHead>

          <List>
            {sorted.map(a=>(
              <Item key={a.id} onClick={()=>setDetails(a)} title="Apri dettaglio">
                <span>
                  {a.kind==="good"  ? <Lucide.BadgeCheck/> :
                   a.kind==="warn"  ? <Lucide.AlertTriangle/> :
                   a.kind==="bad"   ? <Lucide.XOctagon/> :
                   a.kind==="medal" ? <Lucide.Trophy/> : <Lucide.Info/>}
                </span>
                <div style={{minWidth:0}}>
                  <div className="title" style={{overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{a.title}</div>
                  <div style={{opacity:.85, overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{a.text}</div>
                </div>
                <div style={{display:"grid", gap:2, justifyItems:"end"}}>
                  <span className="ts">
                    {new Date(a.ts||Date.now()).toLocaleString("it-IT",{day:"2-digit",month:"2-digit",year:"numeric",hour:"2-digit",minute:"2-digit"})}
                  </span>
                  <span className="kind">{a.kind}</span>
                </div>
              </Item>
            ))}
            {sorted.length===0 && (
              <div style={{opacity:.7, textAlign:"center", marginTop:12}}>Nessuna notifica</div>
            )}
          </List>
        </RailInner>
      </RailWrap>

      {/* MODALE DETTAGLIO */}
      {details && createPortal(
        <Backdrop onClick={()=>setDetails(null)}>
          <Card onClick={(e)=>e.stopPropagation()}>
            <ModalHead>
              <h3><Lucide.Info/><span>Dettaglio notifica</span></h3>
              <GhostIconBtn title="Chiudi" onClick={()=>setDetails(null)}><Lucide.X/></GhostIconBtn>
            </ModalHead>

            <div style={{display:"grid", gap:6}}>
              <div style={{display:"flex", alignItems:"center", gap:8}}>
                <strong>{details.title}</strong>
                <span style={{opacity:.7,fontSize:".85rem"}}>
                  {new Date(details.ts||Date.now()).toLocaleString("it-IT",{day:"2-digit",month:"2-digit",year:"numeric",hour:"2-digit",minute:"2-digit"})}
                </span>
              </div>
              <div style={{opacity:.9}}>{details.text}</div>
              {details.medalDesc && <div style={{opacity:.85}}>🏅 {details.medalDesc}</div>}
            </div>

            <ModalFoot>
              <Btn onClick={()=>{ onDismiss?.(details.id); setDetails(null); }}>Elimina</Btn>
              <Btn onClick={()=>{ setDetails(null); navigate("/notifiche"); }}>Vedi tutte le notifiche</Btn>
            </ModalFoot>
          </Card>
        </Backdrop>,
        document.body
      )}
    </>
  );
}
