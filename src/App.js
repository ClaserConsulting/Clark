// src/App.js
import React, { useState, useEffect, useMemo } from "react";
import { GlobalStyle } from "./utils/theme";
import { accounts as initialAccounts } from "./data/accounts";
import { categories as initialCategories } from "./data/categories";
import { types as initialTypes } from "./data/types";
import transactions from "./data/transactions";
import "./i18n/config";
import AppRouter from "./routes/AppRouter";
import { useThemeSettings } from "./context/ThemeContext";

const App = () => {
  const { themeMode } = useThemeSettings(); // "dark" | "light"
  const [menuPinned, setMenuPinned] = useState(true);
  const [menuExpanded, setMenuExpanded] = useState(false);
  const [accounts, setAccounts] = useState(initialAccounts);
  const [categories, setCategories] = useState(initialCategories);
  const [types, setTypes] = useState(initialTypes);
  const [filters, setFilters] = useState({});
  const [showAll, setShowAll] = useState(false);

  // compat: salva solo la stringa per chi la legge altrove
  useEffect(() => {
    localStorage.setItem("theme", themeMode);
  }, [themeMode]);

  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      const matchCategoria =
        !filters.categoryName || filters.categoryName === "Tutte" || t.categoryName === filters.categoryName;
      const matchAccount =
        !filters.accountId || filters.accountId === "Tutti" || t.accountId === filters.accountId;
      const matchTipo = !filters.type || filters.type === "Tutti" || t.type === filters.type;
      return matchCategoria && matchTipo && matchAccount;
    });
  }, [transactions, filters]);

  // compat con AppRouter/NavigationBar (non serve più, lascio no-op)
  const toggleTheme = () => {};

  return (
    <>
      <GlobalStyle />
      <AppRouter
        theme={themeMode}                // "dark" | "light"
        toggleTheme={toggleTheme}        // legacy/no-op
        menuPinned={menuPinned}
        setMenuPinned={setMenuPinned}
        menuExpanded={menuExpanded}
        setMenuExpanded={setMenuExpanded}
        accounts={accounts}
        setAccounts={setAccounts}
        categories={categories}
        setCategories={setCategories}
        types={types}
        setTypes={setTypes}
        transactions={transactions}
        filteredTransactions={filteredTransactions}
        filters={filters}
        setFilters={setFilters}
        showAll={showAll}
        setShowAll={setShowAll}
      />
    </>
  );
};

export default App;
