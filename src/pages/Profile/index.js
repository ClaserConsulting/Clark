// src/pages/Profile.jsx
import React, { useState } from "react";
import styled from "styled-components";
import { useThemeSettings } from "../../context/ThemeContext";
import * as Lucide from "lucide-react";

const Page = styled.div`display: grid; gap: 16px;`;
const Grid = styled.div`display: grid; gap: 16px; grid-template-columns: 1fr 1fr; @media (max-width: 1100px) { grid-template-columns: 1fr; }`;
const Card = styled.div`border-radius: 14px; background: ${({ theme }) => theme.card}; border: 1px solid ${({ theme }) => theme.separator}; padding: 16px; box-shadow: 0 4px 16px ${({ theme }) => theme.tileShadow};`;
const Row = styled.div`display: grid; grid-template-columns: 140px 1fr; gap: 12px; align-items: center; margin-bottom: 12px; @media (max-width: 600px){ grid-template-columns: 1fr; align-items: start; }`;
const Input = styled.input`border: 1px solid ${({ theme }) => theme.separator}; background: ${({ theme }) => theme.cardHover}; color: ${({ theme }) => theme.text}; border-radius: 10px; padding: 10px 12px; width: 100%;`;
const Select = styled.select`border: 1px solid ${({ theme }) => theme.separator}; background: ${({ theme }) => theme.cardHover}; color: ${({ theme }) => theme.text}; border-radius: 10px; padding: 10px 12px; width: 100%;`;
const SaveBtn = styled.button`border: 0; border-radius: 10px; padding: 10px 14px; cursor: pointer; background: ${({ theme }) => theme.accent}; color: #fff; font-weight: 700;`;

export default function Profile() {
  const { themeFamily, themeMode, setThemeFamily, setThemeMode } = useThemeSettings();
  const [form, setForm] = useState({ name: "Claudio Salvatore", email: "claudio@example.com", phone: "", avatarBg: "#006666" });
  const set = (k,v) => setForm(f => ({...f, [k]: v}));

  return (
    <Page>
      <Card>
        <h2 style={{marginTop:0, display:"flex", alignItems:"center", gap:8}}>
          <Lucide.User size={18}/> Profilo utente
        </h2>
        <Grid>
          <div>
            <Row><div>Nome</div><Input value={form.name} onChange={e=>set("name", e.target.value)} /></Row>
            <Row><div>Email</div><Input value={form.email} onChange={e=>set("email", e.target.value)} /></Row>
            <Row><div>Telefono</div><Input value={form.phone} onChange={e=>set("phone", e.target.value)} placeholder="+39 ..." /></Row>
            <Row><div>Colore avatar</div><Input type="color" value={form.avatarBg} onChange={e=>set("avatarBg", e.target.value)} /></Row>
            <div style={{display:"flex", gap:8, justifyContent:"flex-end"}}>
              <SaveBtn onClick={()=>console.log("SAVE PROFILE", form)}>Salva modifiche</SaveBtn>
            </div>
          </div>

          <div>
            <h3>Preferenze tema</h3>
            <Row><div>Famiglia</div>
              <Select value={themeFamily} onChange={(e)=>setThemeFamily(e.target.value)}>
                <option value="legacy">Legacy</option>
                <option value="neon">Neon</option>
                <option value="warm">Warm</option>
                <option value="calm">Calm</option>
                <option value="classic">Classic</option>
              </Select>
            </Row>
            <Row><div>Modalità</div>
              <Select value={themeMode} onChange={(e)=>setThemeMode(e.target.value)}>
                <option value="dark">Dark</option>
                <option value="light">Light</option>
              </Select>
            </Row>
            <h3>Privacy & Sicurezza</h3>
            <Row><div>Password</div><Input type="password" value="********" readOnly /></Row>
            <div style={{display:"flex", gap:8}}>
              <button onClick={()=>alert("TODO: cambia password")} style={{border:0,borderRadius:10,padding:"8px 12px"}}>Cambia password</button>
              <button onClick={()=>alert("TODO: 2FA")} style={{border:0,borderRadius:10,padding:"8px 12px"}}>Abilita 2FA</button>
            </div>
          </div>
        </Grid>
      </Card>
    </Page>
  );
}
