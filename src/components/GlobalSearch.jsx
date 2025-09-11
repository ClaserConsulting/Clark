// src/components/GlobalSearch.jsx
import React, { useEffect, useMemo, useRef, useState, useLayoutEffect } from "react";
import styled, { css, keyframes } from "styled-components";
import * as Lucide from "lucide-react";
import { createPortal } from "react-dom";

/* ===== Animazioni soft ===== */
const fadeGlass = keyframes`
  from { opacity: 0; transform: translateY(-6px) scale(.985); }
  to   { opacity: 1; transform: translateY(0)    scale(1); }
`;
const fadeList = keyframes`
  from { opacity: 0; transform: translateY(-2px); }
  to   { opacity: 1; transform: translateY(0); }
`;
const slideFly = keyframes`
  from { opacity: 0; transform: translateX(8px); }
  to   { opacity: 1; transform: translateX(0); }
`;

/* ===== Helper vetro + tema ===== */
const isLight = (t) => String(t?.name || "").toLowerCase().includes("light");
const glassBg  = (t) => isLight(t) ? "rgba(255,255,255,.78)" : "rgba(16,19,24,.74)";
const glassBor = (t) => isLight(t) ? "rgba(11,18,32,.10)"   : "rgba(255,255,255,.14)";

/* ===== Barra compatta nella nav ===== */
const Wrap = styled.div`
  position: relative;
  width: 540px;
  transition: width .18s ease;
  @media (max-width: 900px) { width: 100%; }
  ${({ $open }) => $open && css`width: min(720px, 100%);`}
`;

const Bar = styled.div`
  display: grid;
  grid-template-columns: 18px 1fr auto;
  align-items: center;
  gap: 10px;
  border-radius: 12px;
  padding: 8px 12px;
  background: ${({ theme }) => theme.surface};
  border: 1px solid ${({ theme }) => theme.border};
  transition: border-color .15s ease, box-shadow .15s ease, background .15s ease;
  box-shadow: none;

  ${({ $open, theme }) => $open && css`
    border-color: ${theme.focus};
    box-shadow: 0 0 0 3px ${theme.focusSoft};
    background: ${theme.surfaceElev};
  `}

  input {
    border: 0; outline: 0; background: transparent; width: 100%;
    color: ${({ theme }) => theme.text};
    font-size: .9rem;
    &::placeholder { color: ${({ theme }) => theme.muted}; }
  }
  .kbd {
    font-size: .72rem; opacity: .6;
    border: 1px solid ${({ theme }) => theme.separator};
    padding: 1px 6px; border-radius: 6px;
  }
`;

/* ===== Overlay globale (blur sotto la nav!) ===== */
const Backdrop = styled.div`
  position: fixed; inset: 0;
  background: rgba(0,0,0,.14);
  backdrop-filter: blur(6px) saturate(108%);
  -webkit-backdrop-filter: blur(6px) saturate(108%);
  z-index: 800; /* < nav (1100) e < search (1200) → la barra resta nitida */
`;

/* Overlay allineati */
const OverlayBox = styled.div`
  position: fixed;
  z-index: 2001;
  display: grid;
  gap: 10px;
  animation: ${fadeGlass} .16s ease-out both;
  transform-origin: top center;
`;

const OverlayBoxWide = styled(OverlayBox)`
  gap: 12px;
`;

/* ===== Pannelli vetro ===== */
const Panel = styled.div`
  background: ${({ theme }) => glassBg(theme)};
  border: 1px solid ${({ theme }) => glassBor(theme)};
  border-radius: 16px;
  box-shadow: 0 12px 30px rgba(0,0,0,.22);
  overflow: hidden;
  backdrop-filter: blur(14px) saturate(120%);
  -webkit-backdrop-filter: blur(14px) saturate(120%);
`;

const Suggestions = styled(Panel)`
  max-height: 380px;
  overflow: auto;
`;

const SRow = styled.button`
  width: 100%; border: 0; background: transparent; color: inherit; text-align: left;
  display: grid; grid-template-columns: 14px 1fr; gap: 10px; align-items: center;
  padding: 8px 12px; cursor: pointer; position: relative; font-size: .86rem;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  animation: ${fadeList} .12s ease-out both;
  &:hover, &.active { background: ${({ theme }) => theme.rowHover}; }
  .kind { font-size: .68rem; opacity: .55; }
  .l0 { display:flex; align-items:center; gap:8px; min-width:0; }
`;

/* Mega-menu arioso */
const Mega = styled(Panel)` padding: 12px 10px 10px; `;

const Columns = styled.div`
  display: grid;
  gap: 8px 18px;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  @media (max-width: 1200px) { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  @media (max-width: 900px)  { grid-template-columns: 1fr; }
`;

const Section = styled.div`
  display: grid;
  gap: 6px;
  padding: 8px 8px 12px;
  position: relative;

  > h4 {
    margin: 0;
    font-size: .76rem;
    font-weight: 800;
    letter-spacing: .8px;
    text-transform: uppercase;
    color: ${({ theme }) => theme.text};
    padding-bottom: 6px;
    /* linea SOTTO il titolo (allineata ovunque) */
    position: relative;
  }
  > h4::after{
    content:"";
    position:absolute;
    left: 0; right: 0; bottom: 0;
    height:1px;
    background: ${({ theme }) => theme.separator};
    opacity:.75;
  }
`;

/* Row "pulita": niente icone ripetitive; solo testo */
const LinkRow = styled.button`
  border: 0; background: transparent; color: inherit; text-align: left;
  display: block;
  width: 100%;
  padding: 8px 10px;
  border-radius: 10px;
  cursor: pointer; font-size: .9rem;
  margin: 0 2px;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  animation: ${fadeList} .12s ease-out both;
  transition: background .18s ease, transform .18s ease;
  &:hover { background: ${({ theme }) => theme.rowHover}; transform: translateY(-1px); }
`;

/* "Vedi tutti": grassetto + linea sottile SOPRA, più corta */
const SeeAll = styled(LinkRow)`
  font-weight: 800;
  margin-top: 8px;
  position: relative;
  &::before{
    content:"";
    position:absolute;
    top: -8px;
    left: 10px; right: 40px;
    height:1px;
    background: ${({ theme }) => theme.separator};
    opacity: .65;
    border-radius: 1px;
  }
`;

/* Flyout laterale per sottocategorie della categoria selezionata */
const Flyout = styled(Panel)`
  position: fixed;
  top: ${({$top}) => $top || 0}px;
  left: ${({$left}) => $left || 0}px;
  width: min(320px, 40vw);
  padding: 10px 8px;
  animation: ${slideFly} .18s ease-out both;
  z-index: 2002;
`;

/* ===== helpers ===== */
const norm = (s) => String(s ?? "").toLowerCase();
const uniq = (arr) => [...new Set(arr.filter(Boolean))];
const hi = (text, q) => {
  if (!q) return text;
  const i = norm(text).indexOf(norm(q));
  if (i < 0) return text;
  return (
    <>
      {text.slice(0, i)}
      <mark style={{ background: "rgba(127,179,255,.18)", color: "inherit", borderRadius: 4, padding: "0 2px" }}>
        {text.slice(i, i + q.length)}
      </mark>
      {text.slice(i + q.length)}
    </>
  );
};
const takeTop = (arr, n = 6) => arr.slice(0, n);

/* categoria → icona lucide */
const catIconMap = {
  Spesa: "ShoppingBag",
  Alimentari: "Utensils",
  Trasporti: "Bus",
  Viaggi: "Plane",
  Casa: "Home",
  Salute: "HeartPulse",
  Istruzione: "GraduationCap",
  Lavoro: "BriefcaseBusiness",
  Divertimento: "Popcorn",
  Bollette: "Receipt",
};
const IconOf = (name, size = 14) => {
  const C = Lucide[name] || Lucide.Circle;
  return <C size={size} />;
};

/* posizione overlay dal bounding rect del campo */
function useAnchorRect(open, ref) {
  const [rect, setRect] = useState(null);
  useLayoutEffect(() => {
    function update() {
      const el = ref.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      setRect({ top: r.bottom + 8, left: r.left, width: r.width });
    }
    if (open) {
      update();
      window.addEventListener("resize", update);
      window.addEventListener("scroll", update, true);
      return () => {
        window.removeEventListener("resize", update);
        window.removeEventListener("scroll", update, true);
      };
    }
  }, [open, ref]);
  return rect;
}

export default function GlobalSearch({
  transactions = [],
  categories = [],
  accounts = [],
  documents = [],
  onPick,
  onSubmit,
}) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [activeIdx, setActiveIdx] = useState(0);
  const [flyCat, setFlyCat] = useState(null); // categoria aperta nel flyout
  const [flyAnchor, setFlyAnchor] = useState(null);   // {top,left,width} relativo allo schermo
  const [flyLocked, setFlyLocked] = useState(false);


  const anchorRef = useRef(null);
  const rect = useAnchorRect(open, anchorRef);
  const inputRef = useRef(null);
  const isMac = /(Mac|iPhone|iPod|iPad)/i.test(navigator.platform);

  // dimensione/pos mega
  const vw = typeof window !== "undefined" ? window.innerWidth : 1200;
  const isNarrow = vw < 900;
  const MEGA_W = isNarrow ? vw - 24 : Math.min(980, vw - 40);
  const megaLeft = rect ? (isNarrow
    ? 12
    : Math.max(20, Math.min(rect.left + rect.width/2 - MEGA_W/2, vw - MEGA_W - 20))
  ) : 20;

  // hotkey
  useEffect(() => {
    const onKey = (e) => {
      if ((isMac ? e.metaKey : e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen(true);
        requestAnimationFrame(() => inputRef.current?.focus());
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isMac]);

  // piccolo indice
  const index = useMemo(() => {
    const catByName = new Map(categories.map(c => [c.name, c]));
    const catNames  = uniq(categories.map(c => c.name));
    const subcats   = uniq(transactions.map(t => t.subcategory));
    const bens      = uniq(transactions.map(t => t.beneficiary));
    const tags      = uniq(transactions.flatMap(t => t.tag || []));
    const accts     = uniq(accounts.map(a => a.name));
    const types     = uniq(transactions.map(t => t.type));

    // mappa sottocategorie per categoria
    const subsByCat = new Map();
    transactions.forEach(t => {
      if (!t.categoryName || !t.subcategory) return;
      const arr = subsByCat.get(t.categoryName) || [];
      arr.push(t.subcategory);
      subsByCat.set(t.categoryName, uniq(arr));
    });

    const txRows = transactions.map(t => ({
      id: t.id,
      label: `${t.beneficiary || t.categoryName || t.comment || "Transazione"} · ${t.date || ""}`,
      kind: "Transazione",
      icon: "Receipt",
      payload: { type: "open", target: "transaction", id: t.id },
      hay: norm([t.beneficiary, t.categoryName, t.subcategory, t.comment, t.accountId, t.accountTo, t.type, t.date, String(t.importo)].join(" ")),
    }));
    const docRows = documents.map(d => ({
      id: d.id,
      label: d.title,
      kind: "Documento",
      icon: "FileText",
      payload: { type: "open", target: "document", id: d.id },
      hay: norm([d.title, d.tags?.join(" "), d.category].join(" ")),
    }));

    return { catByName, catNames, subcats, subsByCat, bens, tags, accts, types, txRows, docRows };
  }, [transactions, categories, accounts, documents]);

  // suggerimenti digitazione (icone piccole)
  const suggestions = useMemo(() => {
    const qq = norm(q);
    if (!qq) return [];
    const push = [];
    index.bens.filter(b => norm(b).includes(qq)).forEach(b => push.push({ label: b, kind: "Beneficiario", icon: "User", payload: { type:"openDetail", dimension:"beneficiary", value: b } }));
    index.catNames.filter(c => norm(c).includes(qq)).forEach(c => push.push({ label: c, kind: "Categoria", icon: catIconMap[c] || "Folder", payload: { type:"openDetail", dimension:"category", value: c } }));
    index.subcats.filter(s => norm(s).includes(qq)).forEach(s => push.push({ label: s, kind: "Sottocategoria", icon: "Tag", payload: { type:"openDetail", dimension:"subcategory", value: s } }));
    index.accts.filter(a => norm(a).includes(qq)).forEach(a => push.push({ label: a, kind: "Conto", icon: "Wallet", payload: { type:"openDetail", dimension:"account", value: a } }));
    index.tags.filter(t => norm(t).includes(qq)).forEach(t => push.push({ label: `#${t}`, kind: "Tag", icon: "Hash", payload: { type:"openDetail", dimension:"tag", value: t } }));
    index.types.filter(t => norm(t).includes(qq)).forEach(t => push.push({ label: t, kind: "Tipo", icon: "Split", payload: { type:"openDetail", dimension:"type", value: t } }));
    index.txRows.filter(r => r.hay.includes(qq)).forEach(r => push.push({ ...r }));
    index.docRows.filter(r => r.hay.includes(qq)).forEach(r => push.push({ ...r }));
    return takeTop(push, 8);
  }, [q, index]);

  // mega sezioni (browsing calmo)
  const mega = useMemo(() => {
    const filt = (arr) => q ? arr.filter(s => norm(s).includes(norm(q))) : arr;
    return {
      categories: takeTop(filt(index.catNames), 8),
      subcats: takeTop(filt(index.subcats), 8),
      tags: takeTop(filt(index.tags), 8),
      beneficiaries: takeTop(filt(index.bens), 8),
      accounts: takeTop(filt(index.accts), 8),
      types: takeTop(filt(index.types), 6),
    };
  }, [q, index]);

  const handlePick = (sug) => {
    onPick?.(sug.payload);
    setOpen(false);
    setQ("");
    setFlyCat(null);
  };

  function anchorFromEl(el) {
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return { top: r.top, left: r.right + 8, width: r.width, height: r.height };
    }

  // key nav
  const listRef = useRef(null);
  useEffect(() => { setActiveIdx(0); }, [q, open]);
  const onKeyDown = (e) => {
    if (!open) return;
    if (e.key === "ArrowDown") { e.preventDefault(); setActiveIdx(i => Math.min(i + 1, suggestions.length - 1)); }
    if (e.key === "ArrowUp")   { e.preventDefault(); setActiveIdx(i => Math.max(i - 1, 0)); }
    if (e.key === "Enter")     { e.preventDefault(); const s = suggestions[activeIdx]; if (s) handlePick(s); else onSubmit?.(q, {}); }
    if (e.key === "Escape")    { e.preventDefault(); setOpen(false); setFlyCat(null); }
  };

  return (
    <>
      {open && createPortal(<Backdrop onClick={() => { setOpen(false); setFlyCat(null); }} />, document.body)}

      <Wrap $open={open} ref={anchorRef}>
        <Bar
          $open={open}
          onMouseDown={() => { setOpen(true); requestAnimationFrame(() => inputRef.current?.focus()); }}
        >
          {IconOf("Search", 16)}
          <input
            ref={inputRef}
            value={q}
            placeholder="Cerca transazioni, categorie, beneficiari, documenti…"
            onChange={e => setQ(e.target.value)}
            onFocus={() => setOpen(true)}
            onKeyDown={onKeyDown}
          />
          <span className="kbd">{isMac ? "⌘K" : "Ctrl K"}</span>
        </Bar>

        {/* SUGGERIMENTI stretti */}
        {open && rect && suggestions.length > 0 && createPortal(
          <OverlayBox style={{ left: rect.left, top: rect.top, width: rect.width }}>
            <Suggestions ref={listRef}>
              {suggestions.map((s, i) => (
                <SRow
                  key={`${s.kind}-${s.label}-${i}`}
                  className={i === activeIdx ? "active" : ""}
                  onMouseEnter={() => setActiveIdx(i)}
                  onClick={() => handlePick(s)}
                >
                  {IconOf(s.icon, 14)}
                  <div>
                    <div className="l0">{hi(s.label, q)}</div>
                    <div className="kind">{s.kind}</div>
                  </div>
                </SRow>
              ))}
            </Suggestions>
          </OverlayBox>,
          document.body
        )}

        {/* MEGA-MENU calmo */}
        {open && rect && q.length === 0 && createPortal(
          <OverlayBoxWide style={{ left: megaLeft, top: rect.top + 2, width: MEGA_W }}>
            <Mega style={{ position: "relative" }}>
              <Columns>
                {/* Categorie */}
                <Section>
                  <h4>{IconOf("Folder", 14)} Categorie</h4>
                  {mega.categories.map((c) => (
                        <LinkRow
                            key={`cat-${c}`}
                            onMouseEnter={(e) => { 
                            if (flyLocked) return; 
                            setFlyCat(c); 
                            setFlyAnchor(anchorFromEl(e.currentTarget)); 
                            }}
                            onMouseLeave={() => { if (!flyLocked) { setFlyCat(null); setFlyAnchor(null); } }}
                            onClick={(e) => { 
                            const a = anchorFromEl(e.currentTarget); 
                            setFlyCat(c); setFlyAnchor(a); setFlyLocked(true); 
                            }}
                        >
                            {c}
                        </LinkRow>
                  ))}
                  <h4></h4>
                  <SeeAll onClick={() => handlePick({ payload:{ type:"analysis", dimension:"category", value:"*all*" } })}>
                    {IconOf("List", 14)} Vedi tutte
                  </SeeAll>
                </Section>

                {/* Sottocategorie */}
                <Section>
                  <h4>{IconOf("Tag", 14)} Sottocategorie</h4>
                  {mega.subcats.map((s) => (
                    <LinkRow key={`sub-${s}`} onClick={() => handlePick({ payload:{ type:"analysis", dimension:"subcategory", value:s } })}>
                      <div>{s}</div>
                    </LinkRow>
                  ))}
                  <h4></h4>
                  <SeeAll onClick={() => handlePick({ payload:{ type:"analysis", dimension:"subcategory", value:"*all*" } })}>
                    {IconOf("List", 14)} Vedi tutte
                  </SeeAll>
                </Section>

                {/* Tag */}
                <Section>
                  <h4>{IconOf("Hash", 14)} Tag</h4>
                  {mega.tags.map((t) => (
                    <LinkRow key={`tag-${t}`} onClick={() => handlePick({ payload:{ type:"analysis", dimension:"tag", value:t } })}>
                      <div>#{t}</div>
                    </LinkRow>
                  ))}
                  <h4></h4>
                  <SeeAll onClick={() => handlePick({ payload:{ type:"analysis", dimension:"tag", value:"*all*" } })}>
                    {IconOf("List", 14)} Vedi tutti
                  </SeeAll>
                </Section>

                {/* Beneficiari */}
                <Section>
                  <h4>{IconOf("User", 14)} Beneficiari</h4>
                  {mega.beneficiaries.map((b) => (
                    <LinkRow key={`ben-${b}`} onClick={() => handlePick({ payload:{ type:"analysis", dimension:"beneficiary", value:b } })}>
                      <div>{b}</div>
                    </LinkRow>
                  ))}
                  <h4></h4>
                  <SeeAll onClick={() => handlePick({ payload:{ type:"analysis", dimension:"beneficiary", value:"*all*" } })}>
                    {IconOf("List", 14)} Vedi tutti
                  </SeeAll>
                </Section>

                {/* Conti */}
                <Section>
                  <h4>{IconOf("Wallet", 14)} Conti</h4>
                  {mega.accounts.map((a) => (
                    <LinkRow key={`acc-${a}`} onClick={() => handlePick({ payload:{ type:"analysis", dimension:"account", value:a } })}>
                      <div>{a}</div>
                    </LinkRow>
                  ))}
                  <h4></h4>
                  <SeeAll onClick={() => handlePick({ payload:{ type:"analysis", dimension:"account", value:"*all*" } })}>
                    {IconOf("List", 14)} Vedi tutti
                  </SeeAll>
                </Section>
              </Columns>

              {/* Flyout laterale per la categoria */}
            {flyCat && flyAnchor && (
                <Flyout $top={flyAnchor.top} $left={flyAnchor.left}>
                    <Section style={{ paddingTop: 2 }}>
                    <h4 style={{ marginBottom: 8 }}>{IconOf(catIconMap[flyCat] || "Folder", 14)} {flyCat}</h4>
                    <LinkRow onClick={() => handlePick({ payload:{ type:"analysis", dimension:"category", value: flyCat } })}>
                        Intera categoria
                    </LinkRow>
                    {(index.subsByCat.get(flyCat) || []).map((s) => (
                        <LinkRow key={`fly-${flyCat}-${s}`} onClick={() => handlePick({ payload:{ type:"analysis", dimension:"subcategory", value: s } })}>
                        {s}
                        </LinkRow>
                    ))}
                    <SeeAll onClick={() => handlePick({ payload:{ type:"analysis", dimension:"subcategory", value:`*cat:${flyCat}*` } })}>
                        Tutte le sub di “{flyCat}”
                    </SeeAll>
                    {/* Chiudi se è bloccato */}
                    {flyLocked && (
                        <SeeAll onClick={() => { setFlyLocked(false); setFlyCat(null); setFlyAnchor(null); }}>
                        Chiudi
                        </SeeAll>
                    )}
                  </Section>
                </Flyout>
              )}
            </Mega>
          </OverlayBoxWide>,
          document.body
        )}
      </Wrap>
    </>
  );
}
