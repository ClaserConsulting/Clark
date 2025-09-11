import React, { createContext, useContext, useState, useMemo, useCallback } from "react";

const SearchContext = createContext(null);

export function SearchProvider({ children }) {
  const [analysis, setAnalysis] = useState(null);     // { dimension, value } | null
  const [openTxId, setOpenTxId] = useState(null);     // id transazione da aprire
  const [freeTextFilter, setFreeTextFilter] = useState("");

  const pickAnalysis     = useCallback((dimension, value) => setAnalysis({ dimension, value }), []);
  const openTransaction  = useCallback((id) => setOpenTxId(id), []);
  const submitFreeText   = useCallback((q) => setFreeTextFilter(q), []);
  const clearOpenTx      = useCallback(() => setOpenTxId(null), []);

  const value = useMemo(() => ({
    analysis, setAnalysis,
    openTxId, setOpenTxId, clearOpenTx,
    freeTextFilter, setFreeTextFilter,
    pickAnalysis, openTransaction, submitFreeText,
  }), [analysis, openTxId, freeTextFilter, pickAnalysis, openTransaction, submitFreeText, clearOpenTx]);

  return <SearchContext.Provider value={value}>{children}</SearchContext.Provider>;
}

export function useSearch() {
  const ctx = useContext(SearchContext);
  if (!ctx) throw new Error("useSearch must be used within a SearchProvider");
  return ctx;
}