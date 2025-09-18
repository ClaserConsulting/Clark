// 📁 src/pages/Goals/index.jsx
import React, { useMemo } from "react";
import styled from "styled-components";
import * as Lucide from "lucide-react";

const Wrap = styled.div`
  display: grid; gap: 16px;
`;

const Grid = styled.div`
  display: grid; gap: 12px;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
`;

const Card = styled.div`
  border-radius: 14px; padding: 12px;
  background: ${({theme})=>theme.card};
  border: 1px solid ${({theme})=>theme.separator};
  box-shadow: 0 1px 6px ${({theme})=>theme.tileShadow};
  display: grid; gap: 8px;
`;

const Title = styled.h3`
  margin: 0; font-size: 1rem; display: inline-flex; gap: 8px; align-items: center;
`;

const Progress = styled.div`
  height: 8px; border-radius: 999px; overflow: hidden;
  background: ${({theme})=>theme.cardHover};
  > span { display:block; height:100%; background: #61d095; width:${p=>p.$v||0}%; }
`;

export default function Goals() {
  // demo locale (poi collegherai i dati reali)
  const goals = useMemo(()=>[
    { id:"g1", title:"Settimana virtuosa", desc:"7 giorni sotto budget", progress: 70, reward:"Medaglia bronzo" },
    { id:"g2", title:"Mese no take-away", desc:"30 giorni senza ristoranti", progress: 25, reward:"Badge risparmio" },
    { id:"g3", title:"Fumo -50%", desc:"Riduci spese tabacco", progress: 40, reward:"Star verde" },
  ],[]);

  return (
    <Wrap>
      <Title><Lucide.Trophy/> Obiettivi & Medaglie</Title>
      <Grid>
        {goals.map(g=>(
          <Card key={g.id}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
              <strong>{g.title}</strong>
              <span style={{opacity:.7,fontSize:".85rem"}}>{g.reward}</span>
            </div>
            <div style={{opacity:.8}}>{g.desc}</div>
            <Progress $v={g.progress}><span/></Progress>
            <div style={{fontSize:".85rem",opacity:.75}}>{g.progress}% completato</div>
          </Card>
        ))}
      </Grid>
    </Wrap>
  );
}
