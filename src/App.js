import React, { useState } from "react";
import { ThemeProvider } from "styled-components";
import { lightTheme, darkTheme, GlobalStyle } from "./utils/theme";
import AppRouter from "./routes/AppRouter";

import { accounts as accountsData } from "./data/accounts";
import initialTransactions from "./data/transactions";
import categoriesData from "./data/dataCategories";

export default function App() {
  const [theme, setTheme] = useState("light");
  const [menuPinned, setMenuPinned] = useState(false);
  const [menuExpanded, setMenuExpanded] = useState(false);

  const [accounts, setAccounts] = useState(accountsData);
  const [categories, setCategories] = useState(categoriesData);
  const [transactions, setTransactions] = useState(initialTransactions);
  const [showAll, setShowAll] = useState(true);
  const [filters, setFilters] = useState({
    tipo: new Set(["entrata", "uscita", "trasferimento"]),
    categories: new Set(categoriesData.map((c) => c.id)),
    accounts: new Set(accountsData.map((a) => a.id)),
    dateRange: [null, null],
  });

  const toggleTheme = () => setTheme(theme === "light" ? "dark" : "light");
  const filteredTransactions = showAll ? transactions : transactions.slice(0, 5);

  return (
    <ThemeProvider theme={theme === "light" ? lightTheme : darkTheme}>
      <GlobalStyle />
      <AppRouter
        theme={theme}
        toggleTheme={toggleTheme}
        menuPinned={menuPinned}
        menuExpanded={menuExpanded}
        setMenuPinned={setMenuPinned}
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
}
