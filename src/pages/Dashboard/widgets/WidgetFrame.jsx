import React from "react";
import styled from "styled-components";
import * as Lucide from "lucide-react";

const Frame = styled.section`
  position: relative;
  border: 1px solid ${({theme})=>theme.separator};
  background: ${({theme})=>theme.card};
  border-radius: 12px;
  padding: 10px;
`;

const Head = styled.div`
  display:flex; align-items:center; justify-content:space-between; gap:8px;
  margin-bottom: 8px;
`;

const TitleWrap = styled.div`
  display:flex; align-items:center; gap:8px; min-width:0;
`;
const Title = styled.h4`
  margin:0; font-weight:600; white-space:nowrap;
`;
const Badge = styled.span`
  display:inline-grid; place-items:center; min-width:18px; height:18px; padding:0 6px;
  border-radius:999px; background:#f59e0b; color:#111; font-size:.75rem; font-weight:700;
`;

const Actions = styled.div`display:inline-flex; gap:6px; align-items:center;`;

const GhostBtn = styled.button`
  display:grid; place-items:center; width:30px; height:30px; border-radius:10px;
  border:1px solid ${({theme})=>theme.separator}; background:${({theme})=>theme.cardHover};
  color:inherit; cursor:pointer;
`;

export default function WidgetFrame({
  title, icon:Icon=Lucide.Square, children,
  rightActions=null,                // 👈 pulsanti custom (Aggiungi / Chevron)
  badge=null,                       // 👈 contatore giallo
  canHide=true, onHide,             // solo hide, no move (come richiesto)
}) {
  return (
    <Frame>
      <Head>
        <TitleWrap>
          {Icon ? <Icon size={16}/> : null}
          <Title>{title}</Title>
          {badge != null && <Badge title="Attivi">{badge}</Badge>}
        </TitleWrap>
        <Actions>
          {rightActions}
          {canHide && (
            <GhostBtn onClick={onHide} title="Nascondi dalla dashboard">
              <Lucide.EyeOff size={16}/>
            </GhostBtn>
          )}
        </Actions>
      </Head>
      {children}
    </Frame>
  );
}
