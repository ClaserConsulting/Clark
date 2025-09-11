// src/context/ThemeContext.jsx
import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";

const ThemeCtx = createContext(null);
const LS_FAMILY = "clark.theme.family";
const LS_MODE   = "clark.theme.mode";

function readLS() {
  const family = localStorage.getItem(LS_FAMILY) || "legacy"; // ★ default: tua palette
  const mode   = localStorage.getItem(LS_MODE)   || "dark";
  return { family, mode };
}

export function ThemeSettingsProvider({ children }) {
  const [{ family, mode }, setState] = useState(readLS);

  useEffect(() => {
    localStorage.setItem(LS_FAMILY, family);
    localStorage.setItem(LS_MODE, mode);
  }, [family, mode]);

  const setThemeFamily = useCallback((f) => setState(s => ({ ...s, family: f })), []);
  const setThemeMode   = useCallback((m) => setState(s => ({ ...s, mode: m })), []);
  const toggleMode     = useCallback(() => setState(s => ({ ...s, mode: s.mode === "dark" ? "light" : "dark" })), []);

  const value = useMemo(() => ({
    themeFamily: family,
    themeMode: mode,
    setThemeFamily,
    setThemeMode,
    toggleMode,
  }), [family, mode, setThemeFamily, setThemeMode, toggleMode]);

  return <ThemeCtx.Provider value={value}>{children}</ThemeCtx.Provider>;
}

export function useThemeSettings() {
  const ctx = useContext(ThemeCtx);
  if (!ctx) throw new Error("useThemeSettings must be used within ThemeSettingsProvider");
  return ctx;
}
