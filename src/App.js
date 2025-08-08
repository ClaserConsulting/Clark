import React, { useState, useEffect, useMemo} from "react";
import { ThemeProvider } from "styled-components";
import { darkTheme, lightTheme, GlobalStyle } from "./utils/theme";
import { accounts as initialAccounts } from "./data/accounts";
import {categories as initialCategories}  from "./data/categories";
import {types as initialTypes} from "./data/types";
import transactions from "./data/transactions";
import "./i18n/config";
import AppRouter from "./routes/AppRouter";

const App = () => {
  const [darkMode, setDarkMode] = useState(true);
  const [menuPinned, setMenuPinned] = useState(true);
  const [menuExpanded, setMenuExpanded] = useState(false);
  const [accounts, setAccounts] = useState(initialAccounts);
  const [categories, setCategories] = useState(initialCategories);
  const [types, setTypes] = useState(initialTypes);
  const [filters, setFilters] = useState({});
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) setDarkMode(savedTheme === "dark");
  }, []);

  const toggleTheme = () => {
    const newTheme = !darkMode;
    setDarkMode(newTheme);
    localStorage.setItem("theme", newTheme ? "dark" : "light");
  };

  const filteredTransactions = useMemo(() => {
  return transactions.filter((t) => {
    // Esempio: filtra per categoria e tipo
    const matchCategoria = !filters.categoryName || filters.categoryName === "Tutte" || t.categoryName === filters.categoryName;
    const matchAccount = !filters.accountId || filters.accountId === "Tutti" || t.accountId === filters.accountId;
    const matchTipo = !filters.type || filters.type === "Tutti" || t.type === filters.type;
    return matchCategoria && matchTipo && matchAccount;
  });
}, [transactions, filters]);


  return (
    <ThemeProvider theme={darkMode ? darkTheme : lightTheme}>
      <GlobalStyle />
      <AppRouter
        theme={darkMode ? "dark" : "light"}
        toggleTheme={toggleTheme}
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
    </ThemeProvider>
  );
};

export default App;
