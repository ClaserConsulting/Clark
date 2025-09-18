// src/pages/Dashboard/widgets/FavoritesBar.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import styled from "styled-components";
import * as Lucide from "lucide-react";

const Wrap = styled.div`position:relative; display:grid; gap:10px;`;

/* Header collassabile identico al budget */
const Head = styled.button`
  width:100%;
  display:flex; align-items:center; justify-content:space-between;
  border:1px solid ${({theme})=>theme.separator};
  background:${({theme})=>theme.card}; color:inherit;
  border-radius:12px; padding:10px 12px; cursor:pointer;
  h4{margin:0; display:inline-flex; gap:8px; align-items:center;}
  .chev{ transition:.15s ease; transform: rotate(${p=>p.$open ? "180deg":"0deg"}); }
`;

/* Box dei chip + input */
const Box = styled.div`
  display:flex; flex-wrap:wrap; gap:8px; align-items:center;
  padding:8px; border:1px dashed #facc1599; border-radius:12px;
  background:${p=>p.theme.card}; width:100%;
`;

const Chip = styled.span`
  display:inline-flex; align-items:center; gap:6px;
  border:1px solid #facc15; border-radius:999px; padding:6px 10px;
  background:${p=>p.theme.cardHover}; color:inherit;
  button{ border:0; background:transparent; cursor:pointer; }
  svg{ width:14px; height:14px; color:#f59e0b; }
`;

const Input = styled.input`
  min-width:220px; flex:1 1 260px;
  border:0; outline:none; background:transparent; color:inherit;
`;

/* Flyout suggerimenti — scuro */
const SuggBox = styled.div`
  position:relative;
  .panel{
    position:absolute; z-index:5000; left:0; right:0; top:6px;
    background:${p=>p.theme.flyoutSolid || "#0B2327"};
    border:1px solid ${p=>p.theme.separator};
    border-radius:10px; box-shadow:0 14px 30px rgba(0,0,0,.45);
    padding:6px; max-height:260px; overflow:auto;
  }
  .row{ display:flex; align-items:center; gap:8px; padding:6px 8px; border-radius:8px; cursor:pointer; }
  .row:hover{ background:${p=>p.theme.cardHover}; }
  .row small{ opacity:.7; }
`;

const Icon = ({name})=>{
  const M = { User:Lucide.User, Folder:Lucide.Folder, Tag:Lucide.Tag }[name] || Lucide.Star;
  return <M size={14} color="#f59e0b"/>;
};

export default function FavoritesBar({
  favorites = [],
  suggestions = [],
  onChange,
  onSelect,
  hideHeader = false,
  collapsedExtern = false,
  onToggleExtern,
}) {
  const [q, setQ] = useState("");
  const [openPanel, setOpenPanel] = useState(false);
  const [open, setOpen] = useState(!collapsedExtern);     // stato “collassato”
  const inputRef = useRef(null);

  useEffect(()=>{ setOpen(!collapsedExtern); }, [collapsedExtern]);

  // filtro suggerimenti (esclude i già scelti)
  const filtered = useMemo(()=>{
    const s = q.trim().toLowerCase();
    const has = new Set(favorites.map(f=>`${f.type}:${f.label}`));
    return (suggestions||[])
      .filter(x => !has.has(`${x.type}:${x.label}`))
      .filter(x => !s || String(x.label).toLowerCase().includes(s))
      .slice(0, 20);
  }, [q, suggestions, favorites]);

  const add = (x)=>{
    if (!x) return;
    const key = `${x.type}:${x.label}`;
    const has = new Set(favorites.map(f=>`${f.type}:${f.label}`));
    if (!has.has(key)) onChange?.([...favorites, x]);
    setQ(""); setOpenPanel(false); inputRef.current?.focus();
  };
  const remove = (idx)=> onChange?.(favorites.filter((_,i)=>i!==idx));

  const header = hideHeader ? null : (
    <Head onClick={()=>{
        setOpen(v=>!v);
        onToggleExtern?.();
      }} $open={open} aria-expanded={open}>
      <h4><Lucide.Star /> Preferiti</h4>
      <Lucide.ChevronDown className="chev" />
    </Head>
  );

  return (
    <Wrap>
      {header}

      {open && (
        <SuggBox>
          <Box
            onMouseDown={(e)=>{
              if(e.target.tagName!=="INPUT" && e.target.tagName!=="BUTTON") {
                e.preventDefault(); inputRef.current?.focus();
              }
            }}
          >
            {favorites.map((f,i)=>(
              <Chip key={`${f.type}:${f.label}`} onClick={()=>onSelect?.(f)} title="Filtra dashboard">
                <Icon name={f.icon}/> {f.label}
                <button onClick={(e)=>{e.stopPropagation(); remove(i);}}>×</button>
              </Chip>
            ))}
            <Input
              ref={inputRef}
              value={q}
              placeholder="Aggiungi beneficiari, categorie o sottocategorie…"
              onChange={e=>{ setQ(e.target.value); setOpenPanel(true); }}
              onFocus={()=>setOpenPanel(true)}
              onBlur={()=>setTimeout(()=>setOpenPanel(false), 100)}
              onKeyDown={(e)=>{ if(e.key==="Enter" && filtered[0]) add(filtered[0]); }}
            />
          </Box>

          {openPanel && filtered.length>0 && (
            <div className="panel">
              {filtered.map(x=>(
                <div key={`${x.type}:${x.label}`} className="row" onMouseDown={()=>add(x)}>
                  <Icon name={x.icon}/><span>{x.label}</span>
                  <small>({x.type})</small>
                </div>
              ))}
            </div>
          )}
        </SuggBox>
      )}
    </Wrap>
  );
}
