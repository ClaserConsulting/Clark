// src/pages/Beneficiaries.jsx
import React, { useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import * as Lucide from "lucide-react";

const Page = styled.div`display:grid; gap:16px;`;
const TopBar = styled.div`display:flex; gap:8px; align-items:center;`;
const Input = styled.input`
  border:1px solid ${({theme})=>theme.separator};
  background:${({theme})=>theme.cardHover}; color:${({theme})=>theme.text};
  border-radius:10px; padding:8px 10px; min-width:280px;
`;
const AddBtn = styled.button`border:0; border-radius:10px; padding:8px 12px; background:${({theme})=>theme.accent}; color:#fff; font-weight:700;`;
const List = styled.div`display:grid; gap:8px;`;
const Row = styled.div`
  display:grid; grid-template-columns: 1.2fr 1fr 1fr 1fr auto; gap:10px; align-items:center;
  padding:10px 12px; border-radius:10px; background:${({theme})=>theme.card};
  border:1px solid ${({theme})=>theme.separator};
`;
const Small = styled.div`opacity:.7; font-size:.85rem;`;

function normalizeName(s){ return String(s||"").toLowerCase().replace(/\s+/g," ").trim(); }
function looksSimilar(a,b){
  a = normalizeName(a); b = normalizeName(b);
  if (!a || !b) return false;
  if (a === b) return true;
  return a.startsWith(b) || b.startsWith(a) || a.includes(b) || b.includes(a);
}

export default function Beneficiaries({ transactions = [] }){
  const initial = useMemo(()=>{
    const names = Array.from(new Set(transactions.map(t=>t.beneficiary).filter(Boolean)));
    return names.map(n => ({ id: crypto.randomUUID(), name: n }));
  }, [transactions]);

  const [list, setList] = useState(initial);
  const [q, setQ] = useState("");

  useEffect(()=>{ if(!list.length) setList(initial); }, [initial]);

  const filtered = useMemo(()=>{
    const qq = normalizeName(q);
    if (!qq) return list;
    return list.filter(b => normalizeName(b.name).includes(qq));
  }, [list, q]);

  function addNew(){
    const name = window.prompt("Nome beneficiario:");
    if (!name) return;
    const dup = list.find(b => looksSimilar(b.name, name));
    if (dup && !window.confirm(`Esiste un beneficiario simile: "${dup.name}". Aggiungere comunque?`)) return;
    setList(l => [...l, { id: crypto.randomUUID(), name, iban:"", vat:"", phone:"", email:"", address:"" }]);
  }

  function edit(b){
    const name = window.prompt("Nome beneficiario:", b.name) ?? b.name;
    setList(l => l.map(x => x.id === b.id ? { ...x, name } : x));
  }
  function remove(b){
    if (!window.confirm("Eliminare beneficiario?")) return;
    setList(l => l.filter(x => x.id !== b.id));
  }

  return (
    <Page>
      <TopBar>
        <Input placeholder="Cerca beneficiario…" value={q} onChange={e=>setQ(e.target.value)} />
        <AddBtn onClick={addNew}><Lucide.Plus size={16}/> Aggiungi</AddBtn>
      </TopBar>

      <List>
        <Row style={{fontWeight:700, background:"transparent"}}>
          <div>Beneficiario</div><div>IBAN</div><div>P.IVA</div><div>Contatti</div><div></div>
        </Row>
        {filtered.map(b => (
          <Row key={b.id}>
            <div>
              <div>{b.name}</div>
              <Small>ID: {b.id.slice(0,8)}</Small>
            </div>
            <div>{b.iban || <Small>—</Small>}</div>
            <div>{b.vat || <Small>—</Small>}</div>
            <div>
              {b.phone ? <Small>📞 {b.phone}</Small> : <Small>—</Small>}{" "}
              {b.email ? <Small>· ✉️ {b.email}</Small> : null}
            </div>
            <div style={{display:"flex",gap:6,justifyContent:"flex-end"}}>
              <button onClick={()=>edit(b)} style={{border:0,borderRadius:8,padding:"6px 10px"}}><Lucide.Pencil size={16}/></button>
              <button onClick={()=>remove(b)} style={{border:0,borderRadius:8,padding:"6px 10px"}}><Lucide.Trash2 size={16}/></button>
            </div>
          </Row>
        ))}
      </List>
    </Page>
  );
}
