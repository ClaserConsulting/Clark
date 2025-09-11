// 📁 src/pages/Dashboard/widgets/SpendingPanel.jsx
import React, { useMemo, useState, useEffect, useRef } from "react";
import styled, {keyframes, css} from "styled-components";
import {
  ResponsiveContainer,
  LineChart, Line,
  XAxis, YAxis, Tooltip, CartesianGrid,
  PieChart, Pie, Cell,
  AreaChart, Area
} from "recharts";
import * as Lucide from "lucide-react";

/* ========= Helpers ========= */
const parseDateEU = (s) => {
  if (!s) return null;
  const m = String(s).match(/(\d{2})\/(\d{2})\/(\d{4})\s+(\d{2}):(\d{2})/);
  if (!m) return null;
  const [, dd, mm, yyyy, HH, MM] = m;
  return new Date(+yyyy, +mm - 1, +dd, +HH, +MM);
};

const ymKey = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;

const monthLabel = (key) => {
  const [y, m] = key.split("-");
  const d = new Date(+y, +m - 1, 1);
  return d.toLocaleDateString("it-IT", { month: "short" });
};

const lastNMonthsKeys = (n = 12) => {
  const now = new Date();
  const list = [];
  for (let i = n - 1; i >= 0; i--) list.push(ymKey(new Date(now.getFullYear(), now.getMonth() - i, 1)));
  return list;
};

const isSpend = (tx) => tx?.type === "Uscita";
const isIncome = (tx) => tx?.type === "Entrata";
const sum = (arr) => arr.reduce((a, b) => a + (Number(b) || 0), 0);
const fmtEUR = (n) => (Number.isFinite(+n) ? `${(+n).toFixed(2)}€` : "—");

/* ========= Styled ========= */
const glowFlash = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(255,255,255,.28); }
  60%{ box-shadow: 0 0 0 20px rgba(255,255,255,0); }
  100%{ box-shadow: 0 0 0 0 rgba(255,255,255,0); }
`;

const PanelWrap = styled.div`
  position: relative;
  border-radius: 16px;
  background: ${({ theme }) => theme.card};
  box-shadow: 0 1px 6px ${({ theme }) => theme.tileShadow};
  padding: 10px;
  &::after{
    content:"";
    position:absolute; inset:0; border-radius:16px; pointer-events:none;
    opacity: ${({ $on }) => ($on ? 1 : 0)};
    transition: opacity .18s ease;
    background: linear-gradient(0deg, rgba(255,255,255,.08), rgba(255,255,255,.08));
  }
  ${({ $flash }) => $flash && css`animation: ${glowFlash} .7s ease-out;`}
`;

const BulbWrap = styled.div`
  position: absolute;
  /* a ridosso del bordo interno del Section/Panel */
  top: 6px;
 right: 8px;
  z-index: 5;
  display: grid;
  place-items: center;
  width: 26px;
  height: 26px;
  pointer-events: none; /* non cattura click */
  opacity: ${({ $on }) => ($on ? 1 : 0)};
  transform: ${({ $on }) => ($on ? "translateY(0)" : "translateY(-2px)")};
  transition: opacity .18s ease, transform .18s ease;
  /* forza la lampadina piena bianca */
  svg { width: 22px; height: 22px; stroke: #fff; fill: #fff; }
`;

const Panel = styled.section`
  display: grid;
  gap: 10px;
  min-width: 0;
`;

const Header = styled.div`
  display: flex; align-items: center; justify-content: space-between;
`;

const Title = styled.h3`
  margin: 0; font-size: 1.02rem; font-weight: 800; color: ${({ theme }) => theme.text};
  display: inline-flex; align-items: center; gap: 8px;
`;

const Controls = styled.div`display: inline-flex; gap: 6px; align-items: center;`;

const Chip = styled.button`
  height: 26px; padding: 0 10px; border-radius: 999px;
  border: 1px solid ${({ theme }) => theme.separator || "rgba(255,255,255,.2)"};
  background: ${({ active, theme }) => (active ? theme.cardHover || "rgba(255,255,255,.12)" : theme.card || "transparent")};
  color: ${({ theme }) => theme.text}; font-size: .8rem; cursor: pointer;
  opacity: ${({ active }) => (active ? 1 : .85)};
`;

const Card = styled.div`
  min-width: 0; border-radius: 12px; background: ${({ theme }) => theme.card};
  box-shadow: 0 1px 6px ${({ theme }) => theme.tileShadow}; padding: 10px; display: grid; gap: 8px;
`;

const CardTitle = styled.div`
  font-weight: 700; font-size: .88rem; opacity: .9; display: inline-flex; align-items: center; gap: 6px;
`;

const KPIStrip = styled.div`display: grid; grid-template-columns: repeat(3, minmax(0,1fr)); gap: 8px;`;
const KPI = styled.div`
  border-radius: 10px; background: ${({ theme }) => theme.cardHover || "rgba(255,255,255,.06)"};
  border: 1px solid ${({ theme }) => theme.separator || "rgba(255,255,255,.12)"};
  padding: 8px 10px; display: grid; gap: 2px;
  .label{font-size:.7rem;opacity:.7;} .value{font-size:.96rem;font-weight:800;}
`;

const CompactGrid = styled.div`display: grid; gap: 8px;`;
const RowStack = styled.div`display: grid; gap: 8px; grid-template-columns: 1fr;`;

const PieLegendItem = styled.div`display:flex;align-items:center;gap:6px;font-size:.85rem;`;
const Dot = styled.span`width:8px;height:8px;border-radius:50%;background:${({color})=>color};`;
const List = styled.div`display:grid;gap:6px;`;
const RankItem = styled.button`
  display:grid; grid-template-columns:1fr auto; align-items:center; border:0; border-radius:10px;
  background:${({theme})=>theme.cardHover || "rgba(255,255,255,.06)"}; padding:8px 10px; text-align:left; cursor:pointer;
  .label{font-size:.85rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
  .bar{width:100px;height:6px;border-radius:999px;background:linear-gradient(90deg, ${({color})=>color} 0%, ${({color})=>color} var(--w,0%), rgba(255,255,255,.08) var(--w,0%));}
  .val{font-weight:700;white-space:nowrap;}
`;

const BackBtn = styled.button`
  display:${({show})=>show?"inline-flex":"none"};align-items:center;gap:6px;border:0;border-radius:10px;
  background:${({theme})=>theme.card};color:${({theme})=>theme.text};padding:6px 10px;cursor:pointer;opacity:.85;&:hover{opacity:1;}
`;

const Badges = styled.div`display:grid;grid-template-columns:1fr 1fr;gap:6px;`;
const Badge = styled.div`
  border-radius:10px;padding:6px 8px;display:grid;gap:2px;
  background:${({theme})=>theme.cardHover || "rgba(255,255,255,.06)"};border:1px dashed ${({theme})=>theme.separator || "rgba(255,255,255,.18)"};
  .t{font-size:.7rem;opacity:.75;display:flex;align-items:center;gap:6px}
  .v{font-weight:800;font-size:.95rem;white-space:nowrap;}
`;
const Hint = styled.div`
  border-radius:12px;padding:10px;background:rgba(255,255,255,.06);
  border:1px dashed ${({theme})=>theme.separator || "rgba(255,255,255,.2)"};font-size:.85rem;
  display:flex;align-items:center;gap:8px;opacity:.9;cursor:pointer;
`;

/* ========= Component ========= */
export default function SpendingPanel({
  transactions = [],
  categories = [],
  analysis,              // { dimension: 'beneficiary' | 'category' | 'tag', value } | null
  onClear,               // () => void
  onAnalyze,             // ({dimension, value}) => void
}) {
  const [monthsWindow, setMonthsWindow] = useState(6);
  const [monthKey, setMonthKey] = useState(null);
  const [showHint, setShowHint] = useState(false);

  // glow + fix width on sidebar expand
  const wrapRef = useRef(null);
  const [sizeKey, setSizeKey] = useState(0);
  useEffect(() => {
    const k = "spendingHintsSeen";
    if (!localStorage.getItem(k)) { setShowHint(true); localStorage.setItem(k, "1"); }
  }, []);
  useEffect(() => {
    if (!wrapRef.current || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(() => setSizeKey((s) => s + 1));
    ro.observe(wrapRef.current);
    return () => ro.disconnect();
  }, []);

  // index categorie
  const catIdx = useMemo(() => {
    const idx = new Map();
    (categories||[]).forEach(c => {
      idx.set(c.id, c);
      if (c.name) idx.set(c.name.toLowerCase(), c);
    });
    return idx;
  }, [categories]);

  // ordina
  const items = useMemo(() => {
    const src = [...(transactions||[])].filter(Boolean);
    src.sort((a,b) => (parseDateEU(b?.date)?.getTime() ?? 0) - (parseDateEU(a?.date)?.getTime() ?? 0));
    return src;
  }, [transactions]);

  // finestra
  const months = lastNMonthsKeys(monthsWindow);
  const windowStart = useMemo(() => {
    const [y,m] = months[0].split("-");
    return new Date(+y, +m - 1, 1);
  }, [monthsWindow]);

  // filtro analisi + periodo + mese
  const filtered = useMemo(() => {
    let arr = items.filter(tx => {
      const d = parseDateEU(tx?.date);
      return d && d >= windowStart;
    });
    if (analysis) {
      const v = String(analysis.value||"").toLowerCase();
      if (analysis.dimension === "beneficiary") {
        arr = arr.filter(tx => (tx?.beneficiary||"").toLowerCase() === v);
      } else if (analysis.dimension === "category") {
        arr = arr.filter(tx =>
          (tx?.categoryId && tx.categoryId === analysis.value) ||
          (tx?.categoryName && tx.categoryName.toLowerCase() === v)
        );
      } else if (analysis.dimension === "tag") {
        arr = arr.filter(tx => (tx?.tag||[]).map(String).map(s=>s.toLowerCase()).includes(v));
      }
    }
    if (monthKey) {
      arr = arr.filter(tx => {
        const d = parseDateEU(tx?.date);
        return d && ymKey(d) === monthKey;
      });
    }
    return arr;
  }, [items, analysis, windowStart, monthKey]);

  // serie mensile (sulla finestra globale, non sul filtro mese)
  const monthly = useMemo(() => {
    const base = Object.fromEntries(months.map(m => [m, { k:m, month:monthLabel(m), income:0, spend:0 }]));
    items.forEach(tx => {
      const d = parseDateEU(tx?.date); if (!d) return;
      const k = ymKey(d); if (!base[k]) return;
      const n = Number(tx?.importo);
      if (isIncome(tx)) base[k].income += n;
      else if (isSpend(tx)) base[k].spend += Math.abs(n);
    });
    return months.map(k => base[k]);
  }, [items, monthsWindow]);

  const tooltipStyle = {
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.18)",
    borderRadius: 10,
    backdropFilter: "blur(6px)",
    color: "white",
  };

  // click sul punto → filtro mese
  const handleChartClick = (e) => {
    const payload = e?.activePayload?.[0]?.payload;
    if (payload?.k) setMonthKey(payload.k);
  };

  // KPI sul dataset filtrato corrente
  const spendTotal = useMemo(() => sum(filtered.filter(isSpend).map(tx => Math.abs(Number(tx.importo)||0))), [filtered]);
  const incomeTotal = useMemo(() => sum(filtered.filter(isIncome).map(tx => Number(tx.importo)||0)), [filtered]);
  const avgAbsSpend = useMemo(() => {
    const spends = filtered.filter(isSpend).map(tx => Math.abs(Number(tx.importo)||0));
    return spends.length ? sum(spends)/spends.length : 0;
  }, [filtered]);

  // badge picchi su finestra
  const peakIncome = useMemo(() => monthly.reduce((b,x)=>x.income>(b?.income??-1)?x:b,null), [monthly]);
  const peakSpend  = useMemo(() => monthly.reduce((b,x)=>x.spend >(b?.spend ??-1)?x:b,null), [monthly]);

  // pie (su dataset filtrato)
  const pieData = useMemo(() => {
    const map = new Map();
    filtered.forEach(tx => {
      if (!isSpend(tx)) return;
      const key = (tx?.categoryId || tx?.categoryName || "Altro").toString();
      const prev = map.get(key) || { key, name: tx?.categoryName || key, value: 0, cat: null, catId: tx?.categoryId };
      prev.value += Math.abs(Number(tx?.importo)||0);
      prev.cat = catIdx.get(tx?.categoryId) || catIdx.get((tx?.categoryName||"").toLowerCase()) || prev.cat;
      map.set(key, prev);
    });
    return Array.from(map.values()).sort((a,b)=>b.value-a.value);
  }, [filtered, catIdx]);

  const pieColors = useMemo(() => {
    const fallback = ["#7fb3ff","#61d095","#ffb86b","#ff6b6b","#c792ea","#77ddaa","#ffd166","#a29bfe"];
    return pieData.map((d,i)=>d.cat?.color || fallback[i%fallback.length]);
  }, [pieData]);

  // ranking (su dataset filtrato). Se vuoti, mostro “Nessun dato”
  const topCategories = pieData.slice(0,6);
  const beneficiariesAgg = useMemo(() => {
    const map = new Map();
    filtered.forEach(tx => {
      if (!isSpend(tx)) return;
      const key = (tx?.beneficiary || "Sconosciuto").toString();
      map.set(key, (map.get(key)||0) + Math.abs(Number(tx.importo)||0));
    });
    const arr = Array.from(map.entries()).map(([name,value])=>({name,value})).sort((a,b)=>b.value-a.value);
    return arr.slice(0,6);
  }, [filtered]);

  const [flash, setFlash] = useState(false);
  
  // quando cambia l'analisi → fai il flash
  useEffect(() => {
  if (!analysis) return;
  setFlash(true);
  const t = setTimeout(() => setFlash(false), 750);
  return () => clearTimeout(t);
}, [analysis?.dimension, analysis?.value]);

  const title = !analysis
    ? "Analisi entrate/uscite"
    : analysis.dimension === "beneficiary"
      ? `Analisi beneficiario: ${analysis.value}`
      : analysis.dimension === "category"
      ? `Analisi categoria: ${analysis.value}`
      : `Analisi tag: #${analysis.value}`;

  return (
    <PanelWrap $on={!!analysis} $flash={flash}>
      <Panel>
        <Header>
          <Title><Lucide.LineChart size={18} /> </Title>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            {!!monthKey && (
              <Chip active onClick={() => setMonthKey(null)} title="Rimuovi filtro mese">
                <Lucide.Calendar size={14} /> {monthLabel(monthKey)}
              </Chip>
            )}
            <Controls title="Periodo">
              {[3,6,12].map(n=>(
                <Chip key={n} active={monthsWindow===n} onClick={()=>{setMonthsWindow(n);setMonthKey(null);}}>
                  {n}M
                </Chip>
              ))}
            </Controls>
            <BackBtn show={!!analysis} onClick={()=>{ onClear?.(); setMonthKey(null); }}>
              <Lucide.ArrowLeft size={16}/> Indietro
            </BackBtn>
          </div>
        </Header>

        {showHint && (
          <Hint onClick={()=>setShowHint(false)}>
            <Lucide.Lightbulb size={16}/>
            Tip: clicca un punto del grafico per filtrare il mese · clicca una fetta o una voce in classifica per entrare in analisi.
          </Hint>
        )}

        {/* KPI + trend */}
        <Card>
          <KPIStrip>
            <KPI><div className="label">Uscite ({monthKey?monthLabel(monthKey):"periodo"})</div>
              <div className="value" style={{color:"#ff6b6b"}}>{fmtEUR(spendTotal)}</div></KPI>
            <KPI><div className="label">Entrate ({monthKey?monthLabel(monthKey):"periodo"})</div>
              <div className="value" style={{color:"#61d095"}}>{fmtEUR(incomeTotal)}</div></KPI>
            <KPI><div className="label">Media spesa</div><div className="value">{fmtEUR(avgAbsSpend)}</div></KPI>
          </KPIStrip>

          <div style={{ width:"100%", height:150 }}>
            <ResponsiveContainer key={`trend-${sizeKey}`}>
              <LineChart data={monthly} margin={{ top:6, right:8, left:0, bottom:0 }} onClick={handleChartClick}>
                <CartesianGrid strokeOpacity={0.15} vertical={false}/>
                <XAxis dataKey="month" tickMargin={4}/>
                <YAxis tickFormatter={(v)=>`${v}€`} width={48}/>
                <Tooltip contentStyle={tooltipStyle} labelStyle={{color:"#fff"}} formatter={(v)=>fmtEUR(v)}/>
                <Line type="monotone" dataKey="income" name="Entrate" stroke="#61d095" strokeWidth={2} dot={false}/>
                <Line type="monotone" dataKey="spend"  name="Uscite"  stroke="#ff6b6b" strokeWidth={2} dot={false}/>
              </LineChart>
            </ResponsiveContainer>
          </div>

          <Badges>
            <Badge><div className="t"><Lucide.ArrowUpCircle size={14}/> Picco entrate</div>
              <div className="v" style={{color:"#61d095"}}>{peakIncome?`${fmtEUR(peakIncome.income)} · ${peakIncome.month}`:"—"}</div></Badge>
            <Badge><div className="t"><Lucide.TrendingUp size={14}/> Picco uscite</div>
              <div className="v" style={{color:"#ff6b6b"}}>{peakSpend?`${fmtEUR(peakSpend.spend)} · ${peakSpend.month}`:"—"}</div></Badge>
          </Badges>
        </Card>

        {/* Breakdown verticale */}
        <CompactGrid>
          <RowStack>
            <Card>
              <CardTitle><Lucide.PieChart size={16}/> Spese per categoria</CardTitle>
              <div style={{ width:"100%", height:160 }}>
                <ResponsiveContainer key={`pie-${sizeKey}`}>
                  <PieChart>
                    <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={52} outerRadius={78} paddingAngle={2}
                      onClick={(p)=>{ const v = p?.payload?.cat?.id || p?.payload?.name; if (v) { onAnalyze?.({dimension:"category", value:v}); setMonthKey(null);} }}>
                      {pieData.map((d,i)=>(<Cell key={d.key} fill={pieColors[i]} style={{cursor:"pointer"}}/>))}
                    </Pie>
                    <Tooltip contentStyle={tooltipStyle} labelStyle={{color:"#fff"}}
                      formatter={(v,_n,p)=>[`${fmtEUR(v)} (${((v/sum(pieData.map(x=>x.value)))*100||0).toFixed(1)}%)`, p?.payload?.name]}/>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div style={{ display:"grid", gap:6 }}>
                {topCategories.length ? topCategories.slice(0,4).map((d,i)=>(
                  <PieLegendItem key={d.key}>
                    <Dot color={pieColors[i]}/><span style={{flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{d.name}</span>
                    <b>{fmtEUR(d.value)}</b>
                  </PieLegendItem>
                )) : <span style={{opacity:.7,fontSize:".85rem"}}>Nessun dato</span>}
              </div>
            </Card>

            <Card>
              <CardTitle><Lucide.ListOrdered size={16}/> Top categorie</CardTitle>
              <List>
                {topCategories.length ? topCategories.map((c,i)=>(
                  <RankItem key={c.key} onClick={()=>{ onAnalyze?.({dimension:"category", value:c.cat?.id || c.name}); setMonthKey(null); }}
                    color={c.cat?.color || "#7fb3ff"} style={{["--w"]:`${(c.value/Math.max(...topCategories.map(x=>x.value),1))*100}%`}}>
                    <div className="label">{i+1}. {c.name}</div>
                    <div style={{display:"flex",alignItems:"center",gap:8}}>
                      <div className="bar"/><div className="val">{fmtEUR(c.value)}</div>
                    </div>
                  </RankItem>
                )) : <span style={{opacity:.7,fontSize:".85rem"}}>Nessun dato</span>}
              </List>
            </Card>

            <Card>
              <CardTitle><Lucide.UserCheck size={16}/> Top beneficiari</CardTitle>
              <List>
                {beneficiariesAgg.length ? beneficiariesAgg.map((b,i)=>(
                  <RankItem key={b.name} onClick={()=>{ onAnalyze?.({dimension:"beneficiary", value:b.name}); setMonthKey(null); }}
                    color="#ffb86b" style={{["--w"]:`${(b.value/Math.max(...beneficiariesAgg.map(x=>x.value),1))*100}%`}}>
                    <div className="label">{i+1}. {b.name}</div>
                    <div style={{display:"flex",alignItems:"center",gap:8}}>
                      <div className="bar"/><div className="val">{fmtEUR(b.value)}</div>
                    </div>
                  </RankItem>
                )) : <span style={{opacity:.7,fontSize:".85rem"}}>Nessun dato</span>}
              </List>
            </Card>
          </RowStack>
        </CompactGrid>

        {/* Analisi specifica: sparkline + KPI */}
        {analysis && (
          <Card>
            <CardTitle><Lucide.Target size={16}/> Insight</CardTitle>
            <div style={{ width:"100%", height:80 }}>
              <ResponsiveContainer key={`spark-${sizeKey}`}>
                <AreaChart data={(function(){
                  const months = lastNMonthsKeys(monthsWindow);
                  const base = Object.fromEntries(months.map(m=>[m,{month:monthLabel(m), value:0}]));
                  filtered.forEach(tx=>{
                    if (!isSpend(tx)) return;
                    const d = parseDateEU(tx?.date); if (!d) return;
                    const k = ymKey(d); if (!base[k]) return;
                    base[k].value += Math.abs(Number(tx.importo)||0);
                  });
                  return months.map(k=>base[k]);
                })()} margin={{left:0,right:0,top:4,bottom:0}}>
                  <YAxis hide/><XAxis hide dataKey="month"/>
                  <Tooltip contentStyle={tooltipStyle} labelStyle={{color:"#fff"}} formatter={(v)=>fmtEUR(v)}/>
                  <Area type="monotone" dataKey="value" stroke="#ff6b6b" fill="#ff6b6b" fillOpacity={0.25}/>
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <KPIStrip>
              <KPI><div className="label">Uscite (YTD)</div>
                <div className="value" style={{color:"#ff6b6b"}}>
                  {fmtEUR(filtered.filter(isSpend).filter(tx=>parseDateEU(tx.date)?.getFullYear()===new Date().getFullYear())
                    .reduce((a,tx)=>a+Math.abs(Number(tx.importo)||0),0))}
                </div></KPI>
              <KPI><div className="label"># Transazioni</div><div className="value">{filtered.length}</div></KPI>
              <KPI><div className="label">Media transazione</div>
                <div className="value">{fmtEUR(filtered.length ? sum(filtered.map(tx=>Math.abs(Number(tx.importo)||0)))/filtered.length : 0)}</div></KPI>
            </KPIStrip>
          </Card>
        )}
      </Panel>
    </PanelWrap>
  );
}
