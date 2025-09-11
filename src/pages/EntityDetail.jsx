// src/pages/EntityDetail.jsx
import React, { useMemo } from "react";
import styled from "styled-components";
import { useParams } from "react-router-dom";
import * as Lucide from "lucide-react";
import { formatCurrency } from "../utils/format";

const Page = styled.div`display:grid; gap:16px;`;
const Hero = styled.div`
  border-radius:16px; padding:24px;
  background:
    radial-gradient(1200px 1200px at 10% -20%, rgba(127,179,255,.12), transparent),
    radial-gradient(800px 800px at 110% 20%, rgba(110,241,255,.10), transparent),
    ${({ theme }) => theme.card};
`;
const Title = styled.h1`margin:0; font-size: clamp(24px, 3.4vw, 36px);`;
const Subtitle = styled.div`opacity:.8;`;
const Grid = styled.div`display:grid; gap:12px; grid-template-columns:1.2fr 1fr; @media(max-width:1100px){grid-template-columns:1fr;}`;
const Card = styled.div`border-radius:14px; background:${({theme})=>theme.card}; border:1px solid ${({theme})=>theme.separator}; padding:14px; box-shadow:0 4px 16px ${({theme})=>theme.tileShadow};`;
const KPI = styled.div`display:grid; gap:10px; grid-template-columns:repeat(4, minmax(0,1fr)); @media(max-width:900px){grid-template-columns:repeat(2,1fr);}`;
const KPIBox = styled.div`
  border-radius:10px; padding:12px; background:${({theme})=>theme.cardHover}; border:1px solid ${({theme})=>theme.separator};
  .lab{ font-size:.75rem; opacity:.75; } .val{ font-weight:800; font-size:1.1rem; }
`;
const FilterBar = styled.div`
  display:flex; gap:8px; align-items:center; margin-bottom:8px;
  input, select{ border:1px solid ${({theme})=>theme.separator}; background:${({theme})=>theme.cardHover};
    color:${({theme})=>theme.text}; border-radius:8px; padding:6px 8px; }
`;
const List = styled.div`display:grid; gap:8px;`;
const Row = styled.div`display:grid; grid-template-columns:1fr auto; gap:8px; align-items:center; padding:10px 12px; border-radius:10px; background:${({theme})=>theme.card}; &:hover{background:${({theme})=>theme.cardHover};}`;

function useFiltered(transactions, entity, value) {
  return useMemo(() => {
    const v = decodeURIComponent(value || "").toLowerCase();
    const match = (t) => {
      if (entity === "category")     return String(t.categoryName||"").toLowerCase() === v;
      if (entity === "subcategory")  return String(t.subcategory||"").toLowerCase() === v;
      if (entity === "beneficiary")  return String(t.beneficiary||"").toLowerCase() === v;
      if (entity === "account")      return String(t.accountId||"").toLowerCase() === v || String(t.accountTo||"").toLowerCase() === v;
      if (entity === "tag")          return (t.tag||[]).some(x => String(x).toLowerCase() === v);
      if (entity === "type")         return String(t.type||"").toLowerCase() === v;
      return false;
    };
    return (transactions||[]).filter(match);
  }, [transactions, entity, value]);
}

export default function EntityDetail({ transactions=[] }) {
  const { entity, value } = useParams();
  const rows = useFiltered(transactions, entity, value);
  const stats = useMemo(() => {
    const isTr = t => t.type === "Trasferimento";
    const tx  = rows.filter(t=>!isTr(t));
    const sum = a => a.reduce((x,y)=> x + Number(y.importo||0), 0);
    const out = tx.filter(t=>t.type==="Uscita");
    const inn = tx.filter(t=>t.type==="Entrata");
    return {
      tx: tx.length,
      tr: rows.length - tx.length,
      out: sum(out),
      inn: sum(inn),
      bal: sum(inn) - sum(out),
      avgOut: out.length ? sum(out)/out.length : 0,
      avgIn:  inn.length ? sum(inn)/inn.length : 0,
    };
  }, [rows]);

  const pretty = decodeURIComponent(value || "");

  return (
    <Page>
      <Hero>
        <Title>{pretty}</Title>
        <Subtitle>
          {entity} · {rows.length} transazioni correlate
        </Subtitle>
      </Hero>

      <Grid>
        <Card>
          <h3 style={{margin:0}}>Dettagli & statistiche</h3>
          <KPI>
            <KPIBox><div className="lab">Transazioni</div><div className="val">{stats.tx}</div></KPIBox>
            <KPIBox><div className="lab">Trasferimenti</div><div className="val">{stats.tr}</div></KPIBox>
            <KPIBox><div className="lab">Totale uscite</div><div className="val">{formatCurrency(stats.out)}</div></KPIBox>
            <KPIBox><div className="lab">Totale entrate</div><div className="val">{formatCurrency(stats.inn)}</div></KPIBox>
            <KPIBox><div className="lab">Bilancio</div><div className="val">{formatCurrency(stats.bal)}</div></KPIBox>
            <KPIBox><div className="lab">Media uscita</div><div className="val">{formatCurrency(stats.avgOut)}</div></KPIBox>
            <KPIBox><div className="lab">Media entrata</div><div className="val">{formatCurrency(stats.avgIn)}</div></KPIBox>
          </KPI>
        </Card>

        <Card>
          <FilterBar>
            <input placeholder="Cerca testo…" />
            <input type="number" step="0.01" placeholder="Importo da" />
            <input type="number" step="0.01" placeholder="Importo a" />
            <input type="date" /><input type="date" />
          </FilterBar>
          <List>
            {rows.slice(0, 20).map((t) => (
              <Row key={t.id}>
                <div>{t.date} — {t.beneficiary || t.categoryName || "—"} {t.subcategory ? `· ${t.subcategory}` : ""}</div>
                <div style={{fontWeight:700}}>{formatCurrency(t.importo)}</div>
              </Row>
            ))}
          </List>
          {rows.length > 20 && <div style={{opacity:.7,marginTop:8}}>…e altre {rows.length - 20} righe</div>}
        </Card>
      </Grid>
    </Page>
  );
}
