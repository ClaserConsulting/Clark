// src/layout/NotificationsRail.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import styled from "styled-components";
import * as Lucide from "lucide-react";

const RAIL_W = 300;
const TOP = 64; // altezza header

const Rail = styled.aside`
  position: fixed; top: ${TOP}px; right: 0;
  height: calc(100vh - ${TOP}px);
  width: ${({$open}) => $open ? `${RAIL_W}px` : "0px"};
  overflow: hidden;
  background: ${({theme})=>theme.sidebarBg || theme.card};
  border-left: 1px solid ${({theme})=>theme.separator};
  box-shadow: ${({$open})=>$open ? "0 10px 24px rgba(0,0,0,.2)" : "none"};
  transition: width .18s ease;
  z-index: 2300;
  display: grid; grid-template-rows: auto 1fr;
`;

const FloatingBell = styled.button`
  position: fixed; top: calc(${TOP}px + 10px); right: 10px;
  width: 38px; height: 38px; border-radius: 999px;
  background: ${({theme})=>theme.sidebarBg || theme.card};
  border: 1px solid ${({theme})=>theme.separator};
  color:#fff; display:grid; place-items:center; cursor:pointer;
  z-index: 2299; box-shadow: 0 8px 18px rgba(0,0,0,.2);
  .badge{
    position:absolute; top:-6px; right:-6px; min-width:16px; height:16px; padding:0 4px;
    font-size:.7rem; border-radius:999px; background:#ef4444; color:#fff; display:grid; place-items:center;
  }
`;

const Head = styled.div`
  display:flex; align-items:center; justify-content:space-between;
  padding:10px; border-bottom:1px solid ${({theme})=>theme.separator};
  h4{margin:0; display:inline-flex; gap:8px; align-items:center; color:#fff;}
  .tools{display:flex; gap:8px;}
  .iconBtn{
    width:32px;height:32px;border-radius:8px;border:1px solid ${({theme})=>theme.separator};
    background: ${({theme})=>theme.card}; color:#fff; display:grid; place-items:center; cursor:pointer;
  }
`;

const List = styled.div`overflow:auto; padding:6px; display:grid; gap:6px;`;
const Item = styled.button`
  height: 44px; border-radius:10px; border:1px solid ${({theme})=>theme.separator};
  background:${({theme})=>theme.cardHover}; color:inherit; text-align:left;
  display:grid; grid-template-columns:20px 1fr auto; align-items:center; gap:8px; padding:0 10px;
  cursor:pointer; &:hover{ background:${({theme})=>theme.card}; }
  .icon svg{ width:16px; height:16px; }
  .title{ overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
  .meta{ opacity:.7; font-size:.8rem; margin-left:8px; }
  .x{ border:0; background:transparent; cursor:pointer; opacity:.8; }
`;

const Backdrop = styled.div`
  position:fixed; inset:0; background:rgba(0,0,0,.45); z-index:3000; display:grid; place-items:center;
`;
const Card = styled.div`
  width:min(800px, 94vw); max-height:80vh; overflow:auto;
  background:${({theme})=>theme.card}; color:${({theme})=>theme.text};
  border:1px solid ${({theme})=>theme.separator}; border-radius:14px; padding:14px; box-shadow:0 20px 40px rgba(0,0,0,.4);
  display:grid; gap:10px;
`;

export default function NotificationsRail({ alerts=[], onDismiss, onClear }) {
  const [open, setOpen] = useState(false);
  const [detail, setDetail] = useState(null);
  const railRef = useRef(null);

  const items = useMemo(()=>{
    const norm = (x)=> x?.ts ? new Date(x.ts).getTime() : 0;
    return [...alerts].sort((a,b)=> norm(b) - norm(a)); // più recenti in alto
  }, [alerts]);

  // API globale UNA SOLA VOLTA (no loop)
  useEffect(()=>{
    const toggle = ()=> setOpen(o=>!o);
    const openFn = ()=> setOpen(true);
    window.toggleNotifications = toggle;
    window.openNotifications = openFn;
    return ()=>{
      if (window.toggleNotifications === toggle) delete window.toggleNotifications;
      if (window.openNotifications === openFn) delete window.openNotifications;
    };
  }, []);

  // click-outside quando aperta
  useEffect(()=>{
    if (!open) return;
    const onDown = (e)=> { if (!railRef.current?.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", onDown, true);
    return ()=> document.removeEventListener("mousedown", onDown, true);
  }, [open]);

  // spingi il contenuto (variabile CSS)
  useEffect(()=>{
    document.documentElement.style.setProperty("--right-rail-width", open ? `${RAIL_W}px` : "0px");
    return ()=> document.documentElement.style.setProperty("--right-rail-width", "0px");
  }, [open]);

  const iconFor = (k)=> k==="good" ? <Lucide.BadgeCheck color="#22c55e"/> :
                          k==="warn" ? <Lucide.AlertTriangle color="#f59e0b"/> :
                          k==="medal"? <Lucide.Medal color="#facc15"/>        :
                                      <Lucide.AlertOctagon color="#ef4444"/>;

  const count = alerts.length;

  return (
    <>
      {!open && (
        <FloatingBell onClick={()=>setOpen(true)} title="Notifiche">
          <Lucide.Bell color="#fff" />
          {count>0 && <span className="badge">{count}</span>}
        </FloatingBell>
      )}

      <Rail $open={open} ref={railRef} aria-label="Notifiche">
        {open && (
          <>
            <Head>
              <h4><Lucide.Bell color="#fff"/> Notifiche</h4>
              <div className="tools">
                {alerts.length>0 && (
                  <button className="iconBtn" title="Pulisci" onClick={onClear}>
                    <Lucide.Eraser />
                  </button>
                )}
              </div>
            </Head>

            <List>
              {items.length===0 && <div style={{opacity:.7, padding:"8px 2px"}}>Nessun alert in sospeso.</div>}
              {items.map(a=>{
                const stamp = new Date(a.ts || Date.now()).toLocaleString("it-IT");
                return (
                  <Item key={a.id} onClick={()=>setDetail(a)} title={a.text}>
                    <span className="icon">{iconFor(a.kind)}</span>
                    <span className="title"><strong>{a.title}</strong><span className="meta">• {stamp}</span></span>
                    <button className="x" title="Chiudi" onClick={(e)=>{e.stopPropagation(); onDismiss?.(a.id);}}>×</button>
                  </Item>
                );
              })}
            </List>
          </>
        )}
      </Rail>

      {detail && createPortal(
        <Backdrop onClick={()=>setDetail(null)}>
          <Card onClick={(e)=>e.stopPropagation()}>
            <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", gap:8}}>
              <h3 style={{margin:0, display:"inline-flex", gap:8, alignItems:"center"}}>
                {iconFor(detail.kind)} {detail.title}
              </h3>
              <button onClick={()=>setDetail(null)} style={{border:0, background:"transparent", color:"inherit"}}>×</button>
            </div>
            <div style={{opacity:.85}}>{detail.text || "—"}</div>
            <div style={{fontSize:".9rem", opacity:.8}}>
              Ricevuta: {new Date(detail.ts || Date.now()).toLocaleString("it-IT")}
            </div>

            {detail.kind==="medal" && (
              <div style={{display:"grid", gap:8}}>
                <div style={{display:"flex", alignItems:"center", gap:8}}>
                  <Lucide.Medal color="#facc15"/><strong>Medaglia sbloccata!</strong>
                </div>
                <div style={{opacity:.85}}>
                  {detail.medalDesc || "Obiettivo raggiunto! XP accreditati e nuova sfida disponibile."}
                </div>
              </div>
            )}
          </Card>
        </Backdrop>,
        document.body
      )}
    </>
  );
}