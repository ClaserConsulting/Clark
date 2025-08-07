import React, { useState } from "react";
import Sidebar from "./components/Sidebar";
import FiltersBar from "./components/FiltersBar";
import Dashboard from "./components/Dashboard";
import Config from "./components/Config";
import Profile from "./components/Profile";
import TransactionsPage from "./components/Transactions";
import { ThemeProvider } from "styled-components";
import { lightTheme, darkTheme, GlobalStyle } from "./theme";
import { accounts as accountsData } from "./data/accounts";
import transactionsData from "./data/transactions";
import categoriesData from "./data/dataCategories";

export default function App() {
  const [theme, setTheme] = useState("light");
  const [menuPinned, setMenuPinned] = useState(false);
  const [menuExpanded, setMenuExpanded] = useState(false);
  const [activeSection, setActiveSection] = useState("dashboard");
  const [accounts, setAccounts] = useState(accountsData);
  const [categories, setCategories] = useState(categoriesData);
  const [transactions, setTransactions] = useState(transactionsData);

  const [filters, setFilters] = useState({
    tipo: new Set(["entrata", "uscita", "trasferimento"]),
    categories: new Set(categoriesData.map(c => c.id)),
    accounts: new Set(accountsData.map(a => a.id)),
    dateRange: [null, null],
  });

  const toggleTheme = () => setTheme(theme === "light" ? "dark" : "light");

  return (
    <ThemeProvider theme={theme === "light" ? lightTheme : darkTheme}>
      <GlobalStyle />
      <div className="app-container" style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
        <Sidebar
          pinned={menuPinned}
          expanded={menuPinned || menuExpanded}
          onPinToggle={() => setMenuPinned(!menuPinned)}
          onHoverChange={expanded => !menuPinned && setMenuExpanded(expanded)}
          activeSection={activeSection}
          onSelectSection={setActiveSection}
          theme={theme}
        />
        <main style={{ flexGrow: 1, overflowY: "auto", padding: "1rem", backgroundColor: theme === "light" ? "#f5f7fa" : "#121212" }}>
          {activeSection === "dashboard" && (
            <Dashboard
              accounts={accounts}
              categories={categories}
              filters={filters}
              transactions={transactions}
              theme={theme}
              onShowAllTransactions={() => setActiveSection("transactions")}
            />
          )}
          {activeSection === "config" && (
            <Config
              accounts={accounts}
              setAccounts={setAccounts}
              categories={categories}
              setCategories={setCategories}
              theme={theme}
            />
          )}
          {activeSection === "profile" && <Profile />}
          {activeSection === "transactions" && (
            <TransactionsPage
              transactions={transactions}
              categories={categories}
              accounts={accounts}
            />
          )}

          <div style={{ position: "fixed", top: 12, right: 12 }}>
            <label style={{ cursor: "pointer", userSelect: "none", color: theme === "light" ? "#222" : "#ddd" }}>
              <input type="checkbox" checked={theme === "dark"} onChange={toggleTheme} style={{ marginRight: 8 }} />
              {theme === "dark" ? "Tema Dark" : "Tema Light"}
            </label>
          </div>

          <FiltersBar
            filters={filters}
            setFilters={setFilters}
            accounts={accounts}
            categories={categories}
            theme={theme}
          />
        </main>
      </div>
    </ThemeProvider>
  );
}
