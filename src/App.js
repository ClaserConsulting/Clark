import React, { useState, useEffect } from "react";
import { ThemeProvider } from "styled-components";
import { darkTheme, lightTheme, GlobalStyle } from "./utils/theme";
import { accounts as initialAccounts } from "./data/accounts";
import transactions from "./data/transactions";
import "./i18n/config";
import AppRouter from "./routes/AppRouter";

const App = () => {
  const [darkMode, setDarkMode] = useState(true);
  const [menuPinned, setMenuPinned] = useState(true);
  const [menuExpanded, setMenuExpanded] = useState(false);
  const [accounts, setAccounts] = useState(initialAccounts);
  const [categories, setCategories] = useState([]); // puoi caricarle da backend più avanti
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

  const filteredTransactions = showAll
    ? transactions
    : transactions.filter((t) => t.importo < 0); // esempio filtro base

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
