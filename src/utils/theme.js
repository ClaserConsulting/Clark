import { createGlobalStyle } from "styled-components";

/* ---- I TUOI TEMI ORIG ---- */
export const lightTheme = {
  background: "#eaf3f4",
  sidebarBg: "rgba(0, 75, 79, 0.95)",
  sidebarColor: "#ffffff",
  mainBg: "#f1f9f9",
  text: "#ffffff",
  accent: "#18b6b9",
  hoverBg: "rgba(0, 75, 79, 0.1)",
  pinActive: "#18b6b9",
  pinInactive: "rgba(255, 255, 255, 0.5)",
  card: "rgba(255, 255, 255, 0.15)",
  primary: "#008489",
  tileShadow: "rgba(0, 0, 0, 0.05)",
  widgetShadow: "rgba(0, 0, 0, 0.08)",
};

export const darkTheme = {
  background: "#0c1c1d",
  sidebarBg: "#002829",
  sidebarColor: "#e5f6f6",
  mainBg: "#0c1c1d",
  text: "#c8dede",
  accent: "#98ffd842",
  hoverBg: "#014e51",
  pinActive: "#22d3ee98",
  pinInactive: "#6b8e8f",
  card: "rgba(255, 255, 255, 0.05)",
  primary: "#00c2cb",
  tileShadow: "rgba(0, 0, 0, 0.4)",
  widgetShadow: "rgba(0, 0, 0, 0.2)",
  accent: "#61D095",
};

/* ---- GlobalStyle ---- */
export const GlobalStyle = createGlobalStyle`
  body {
    margin:0; padding:0;
    font-family:'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    background-color:${({theme})=>theme.background || "#0c1c1d"};
    color:${({theme})=>theme.text || "#eaeef2"};
    -webkit-font-smoothing:antialiased;
    -moz-osx-font-smoothing:grayscale;
  }
  * { box-sizing: border-box; }
`;

/* ---- Famiglia CALM / CLASSIC (già introdotte) ---- */
export const calmDark = {
  name: "calmDark",
  text: "#eef2f6",
  muted: "rgba(238,242,246,.65)",
  surface: "#101318",
  surfaceElev: "#141820",
  border: "rgba(255,255,255,.12)",
  separator: "rgba(255,255,255,.14)",
  rowHover: "rgba(255,255,255,.06)",
  hoverBg: "rgba(255,255,255,.06)",
  focus: "#7fb3ff",
  focusSoft: "rgba(127,179,255,.22)",
  sidebarBg: "#0c0f14",
  sidebarColor: "#dbe2ea",
  card: "#141820",
  cardHover: "rgba(255,255,255,.06)",
  tileShadow: "rgba(0,0,0,.25)",
  accent: "#61D095",
};
export const calmLight = {
  name: "calmLight",
  text: "#0b1220",
  muted: "rgba(11,18,32,.65)",
  surface: "#ffffff",
  surfaceElev: "#ffffff",
  border: "rgba(15,23,42,.12)",
  separator: "rgba(15,23,42,.14)",
  rowHover: "rgba(15,23,42,.05)",
  hoverBg: "rgba(15,23,42,.05)",
  focus: "#356ce8",
  focusSoft: "rgba(53,108,232,.18)",
  sidebarBg: "#ffffff",
  sidebarColor: "#0b1220",
  card: "#ffffff",
  cardHover: "rgba(15,23,42,.04)",
  tileShadow: "rgba(15,23,42,.06)",
  accent: "#2E8F6D", 
};
export const classicDark = {
  name: "classicDark",
  text: "#f5f7fb",
  muted: "rgba(245,247,251,.65)",
  surface: "#0f1720",
  surfaceElev: "#121a25",
  border: "rgba(255,255,255,.16)",
  separator: "rgba(255,255,255,.18)",
  rowHover: "rgba(255,255,255,.08)",
  hoverBg: "rgba(255,255,255,.08)",
  focus: "#8ab4ff",
  focusSoft: "rgba(138,180,255,.25)",
  sidebarBg: "#0b111a",
  sidebarColor: "#eaf0f8",
  card: "#121a25",
  cardHover: "rgba(255,255,255,.08)",
  tileShadow: "rgba(0,0,0,.3)",
  accent: "#61D095",
};
export const classicLight = {
  name: "classicLight",
  text: "#0b1220",
  muted: "rgba(11,18,32,.65)",
  surface: "#ffffff",
  surfaceElev: "#ffffff",
  border: "rgba(15,23,42,.14)",
  separator: "rgba(15,23,42,.16)",
  rowHover: "rgba(15,23,42,.05)",
  hoverBg: "rgba(15,23,42,.06)",
  focus: "#5b8cff",
  focusSoft: "rgba(91,140,255,.20)",
  sidebarBg: "#f8fafc",
  sidebarColor: "#0b1220",
  card: "#ffffff",
  cardHover: "rgba(15,23,42,.04)",
  tileShadow: "rgba(15, 23, 42, .08)",
  accent: "#2E8F6D", 
};

/* ---- Nuove famiglie: NEON & WARM ---- */
const neonDark = {
  name: "neonDark",
  text: "#eaf9ff",
  muted: "rgba(234,249,255,.7)",
  surface: "#0b0f13",
  surfaceElev: "#0f141b",
  border: "rgba(160,220,255,.16)",
  separator: "rgba(160,220,255,.18)",
  rowHover: "rgba(53,108,232,.08)",
  hoverBg: "rgba(53,108,232,.10)",
  focus: "#6ef1ff",
  focusSoft: "rgba(110,241,255,.25)",
  sidebarBg: "#05080d",
  sidebarColor: "#cfefff",
  card: "#10161f",
  cardHover: "rgba(110,241,255,.06)",
  tileShadow: "rgba(0,0,0,.35)",
  accent: "#6ef1ff",
  primary: "#53c8ff",
  accent: "#61D095",
};
const neonLight = {
  name: "neonLight",
  text: "#0b1220",
  muted: "rgba(11,18,32,.65)",
  surface: "#ffffff",
  surfaceElev: "#f9fbff",
  border: "rgba(15,23,42,.12)",
  separator: "rgba(15,23,42,.14)",
  rowHover: "rgba(83,200,255,.08)",
  hoverBg: "rgba(83,200,255,.10)",
  focus: "#2cbcff",
  focusSoft: "rgba(44,188,255,.22)",
  sidebarBg: "#ffffff",
  sidebarColor: "#0b1220",
  card: "#ffffff",
  cardHover: "rgba(44,188,255,.06)",
  tileShadow: "rgba(15,23,42,.08)",
  accent: "#2cbcff",
  primary: "#1aa6ff",
  accent: "#2E8F6D", 
};

const warmDark = {
  name: "warmDark",
  text: "#fff6e9",
  muted: "rgba(255,246,233,.70)",
  surface: "#14100c",
  surfaceElev: "#1a1510",
  border: "rgba(255,214,170,.16)",
  separator: "rgba(255,214,170,.18)",
  rowHover: "rgba(255,214,170,.08)",
  hoverBg: "rgba(255,214,170,.10)",
  focus: "#ffc98b",
  focusSoft: "rgba(255,201,139,.25)",
  sidebarBg: "#0f0b07",
  sidebarColor: "#ffe6c7",
  card: "#1a1510",
  cardHover: "rgba(255,214,170,.06)",
  tileShadow: "rgba(0,0,0,.35)",
  accent: "#ffae5a",
  primary: "#ff8b2c",
};
const warmLight = {
  name: "warmLight",
  text: "#1a120a",
  muted: "rgba(26,18,10,.65)",
  surface: "#ffffff",
  surfaceElev: "#fffaf4",
  border: "rgba(80,50,20,.12)",
  separator: "rgba(80,50,20,.14)",
  rowHover: "rgba(255,171,90,.08)",
  hoverBg: "rgba(255,171,90,.10)",
  focus: "#ff8b2c",
  focusSoft: "rgba(255,139,44,.20)",
  sidebarBg: "#fff7ee",
  sidebarColor: "#1a120a",
  card: "#ffffff",
  cardHover: "rgba(255,171,90,.06)",
  tileShadow: "rgba(80,50,20,.08)",
  accent: "#ffae5a",
  primary: "#ff7a1a",
};

/* ---- Normalizzazione token (per componenti) ---- */
const normalizeTheme = (base, defaults) => {
  const t = { ...defaults, ...base };
  const isLight = (t.name || "").toLowerCase().includes("light");
  return {
    name: t.name || "custom",
    text: t.text,
    muted: t.muted ?? (isLight ? "rgba(11,18,32,.65)" : "rgba(238,242,246,.65)"),
    background: t.background ?? (isLight ? "#ffffff" : "#0c1c1d"),
    mainBg: t.mainBg ?? t.background ?? (isLight ? "#ffffff" : "#0c1c1d"),
    surface: t.surface ?? (isLight ? "#ffffff" : "#101318"),
    surfaceElev: t.surfaceElev ?? (isLight ? "#ffffff" : "#141820"),
    card: t.card ?? (isLight ? "#ffffff" : "rgba(255,255,255,.06)"),
    cardHover: t.cardHover ?? (isLight ? "rgba(15,23,42,.04)" : "rgba(255,255,255,.08)"),
    sidebarBg: t.sidebarBg ?? (isLight ? "#ffffff" : "#0c0f14"),
    sidebarColor: t.sidebarColor ?? (isLight ? "#0b1220" : "#dbe2ea"),
    border: t.border ?? (isLight ? "rgba(15,23,42,.12)" : "rgba(255,255,255,.12)"),
    separator: t.separator ?? (isLight ? "rgba(15,23,42,.16)" : "rgba(255,255,255,.18)"),
    rowHover: t.rowHover ?? (isLight ? "rgba(15,23,42,.05)" : "rgba(255,255,255,.06)"),
    hoverBg: t.hoverBg ?? (isLight ? "rgba(15,23,42,.06)" : "rgba(255,255,255,.08)"),
    focus: t.focus ?? (isLight ? "#5b8cff" : "#7fb3ff"),
    focusSoft: t.focusSoft ?? (isLight ? "rgba(91,140,255,.20)" : "rgba(127,179,255,.22)"),
    tileShadow: t.tileShadow ?? (isLight ? "rgba(15,23,42,.08)" : "rgba(0,0,0,.25)"),
    widgetShadow: t.widgetShadow ?? t.tileShadow ?? "rgba(0,0,0,.2)",
    primary: t.primary ?? "#00c2cb",
    accent: t.accent ?? "#18b6b9",
    success: t.success ?? "#61d095",
    danger: t.danger ?? "#ff6b6b",
    link: t.link ?? (isLight ? "#356ce8" : "#8ab4ff"),
    input: t.input ?? (isLight ? "#fff" : "rgba(255,255,255,.08)"),
    pinActive: t.pinActive ?? "#22d3ee98",
    pinInactive: t.pinInactive ?? "rgba(255,255,255,0.5)",
  };
};

/* ---- Famiglie disponibili ---- */
const families = {
  calm:   { dark: calmDark,   light: calmLight },
  classic:{ dark: classicDark,light: classicLight },
  neon:   { dark: neonDark,   light: neonLight },
  warm:   { dark: warmDark,   light: warmLight },
  legacy: {
    dark: normalizeTheme(darkTheme, calmDark),   // tuo tema storico
    light: normalizeTheme(lightTheme, calmLight)
  },
};

export function pickTheme(family = "legacy", mode = "dark") {
  const f = families[family] || families.legacy;
  const raw = f[mode] || f.dark;
  return normalizeTheme(raw, mode === "light" ? calmLight : calmDark);
}

export const themes = {
  calmDark, calmLight, classicDark, classicLight,
  neonDark, neonLight, warmDark, warmLight,
  lightTheme, darkTheme, GlobalStyle,
};
