// 📁 src/routes/AppRouter.jsx
import React, { useState, useMemo } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import PrivateRoute from "./PrivateRoute";
import EntityDetail from "../pages/EntityDetail";
import Beneficiaries from "../pages/Beneficiaries";
import Dashboard from "../pages/Dashboard";
import Profile from "../pages/Profile";
import Settings from "../pages/Settings";
import TransactionsPage from "../pages/Transactions/index";
import LoginPage from "../pages/_Login/Login";
import ForgotPassword from "../pages/Auth/ForgotPassword";
import ResetPassword from "../pages/Auth/ResetPassword";
import Sidebar from "../layout/Sidebar";
import NavigationBar from "../layout/NavigationBar";
import { SearchProvider } from "../context/SearchContext";

/* ---------------- Layout wrapper ---------------- */

const LayoutWrapper = ({
  theme,
  toggleTheme,
  menuPinned,
  setMenuPinned,
  menuExpanded,
  setMenuExpanded,
  accounts,
  categories,
  types = [],
  filters,
  setFilters,

  // 🔎 props per la GlobalSearch in navbar
  allTransactions = [],
  docs = [],
  onAnalysisPick,
  onOpenTransaction,
  onOpenDocument,
  onFreeText,
  children,
}) => (
  <div
    className="app-container"
    style={{
      display: "flex",
      height: "100vh",
      overflow: "hidden",
      backgroundColor: theme === "light" ? "#f5f7fa" : "#002f33",
    }}
  >
    <Sidebar
      pinned={menuPinned}
      expanded={menuPinned || menuExpanded}
      onPinToggle={() => setMenuPinned(!menuPinned)}
      onHoverChange={(expanded) => !menuPinned && setMenuExpanded(expanded)}
      theme={theme}
    />

    <div style={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
      {/* NAVBAR con GlobalSearch */}
      <NavigationBar
        theme={theme}
        toggleTheme={toggleTheme}
        transactions={allTransactions}
        categories={categories}
        accounts={accounts}
        documents={docs}
      />

      <main style={{ flexGrow: 1, overflowY: "auto", padding: "1rem" }}>
        {children}
      </main>
    </div>
  </div>
);

/* ---------------- Router ---------------- */

const AppRouter = ({
  theme,
  toggleTheme,
  menuPinned,
  setMenuPinned,
  menuExpanded,
  setMenuExpanded,
  accounts,
  setAccounts,
  categories,
  setCategories,
  types,
  setTypes,
  transactions = [],
  filteredTransactions = [],
  filters,
  setFilters,
  showAll,
  setShowAll,
}) => {
  // 🔧 stati condivisi con la navbar / ricerca
  const [analysis, setAnalysis] = useState(null);
  const [openTxId, setOpenTxId] = useState(null);
  const [freeTextFilter, setFreeTextFilter] = useState("");

  // dati per la search (sostituisci con le tue fonti reali)
  const allTransactions = useMemo(() => transactions || [], [transactions]);
  const docs = useMemo(() => [], []); // TODO: i tuoi documenti
  const openDocument = (id) => {
    // TODO: apri/mostra documento
    console.debug("openDocument", id);
  };

  // handler che passiamo alla navbar
  const handleAnalysisPick = (dimension, value) => setAnalysis({ dimension, value });
  const handleOpenTx = (id) => setOpenTxId(id);
  const handleFreeText = (q) => setFreeTextFilter(q);

  return (
    <SearchProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <LayoutWrapper
                  theme={theme}
                  toggleTheme={toggleTheme}
                  menuPinned={menuPinned}
                  setMenuPinned={setMenuPinned}
                  menuExpanded={menuExpanded}
                  setMenuExpanded={setMenuExpanded}
                  accounts={accounts}
                  categories={categories}
                  types={types}
                  filters={filters}
                  setFilters={setFilters}
                  /* 🔎 navbar props */
                  allTransactions={allTransactions}
                  docs={docs}
                >
                  <Dashboard
                    accounts={accounts}
                    filteredTransactions={filteredTransactions}
                  />
                </LayoutWrapper>
              </PrivateRoute>
            }
          />

          <Route
            path="/config"
            element={
              <PrivateRoute>
                <LayoutWrapper
                  theme={theme}
                  toggleTheme={toggleTheme}
                  menuPinned={menuPinned}
                  setMenuPinned={setMenuPinned}
                  menuExpanded={menuExpanded}
                  setMenuExpanded={setMenuExpanded}
                  accounts={accounts}
                  categories={categories}
                  types={types}
                  filters={filters}
                  setFilters={setFilters}
                  /* 🔎 navbar props */
                  allTransactions={allTransactions}
                  docs={docs}
                  onAnalysisPick={handleAnalysisPick}
                  onOpenTransaction={handleOpenTx}
                  onOpenDocument={openDocument}
                  onFreeText={handleFreeText}
                >
                  <Settings
                    accounts={accounts}
                    setAccounts={setAccounts}
                    categories={categories}
                    setCategories={setCategories}
                    theme={theme}
                    types={types}
                    setTypes={setTypes}
                  />
                </LayoutWrapper>
              </PrivateRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <PrivateRoute>
                <LayoutWrapper
                  theme={theme}
                  toggleTheme={toggleTheme}
                  menuPinned={menuPinned}
                  setMenuPinned={setMenuPinned}
                  menuExpanded={menuExpanded}
                  setMenuExpanded={setMenuExpanded}
                  accounts={accounts}
                  categories={categories}
                  types={types}
                  filters={filters}
                  setFilters={setFilters}
                  /* 🔎 navbar props */
                  allTransactions={allTransactions}
                  docs={docs}
                  onAnalysisPick={handleAnalysisPick}
                  onOpenTransaction={handleOpenTx}
                  onOpenDocument={openDocument}
                  onFreeText={handleFreeText}
                >
                  <Profile />
                </LayoutWrapper>
              </PrivateRoute>
            }
          />

          <Route
            path="/transactions"
            element={
              <PrivateRoute>
                <LayoutWrapper
                  theme={theme}
                  toggleTheme={toggleTheme}
                  menuPinned={menuPinned}
                  setMenuPinned={setMenuPinned}
                  menuExpanded={menuExpanded}
                  setMenuExpanded={setMenuExpanded}
                  accounts={accounts}
                  categories={categories}
                  types={types}
                  filters={filters}
                  setFilters={setFilters}
                  /* 🔎 navbar props */
                  allTransactions={allTransactions}
                  docs={docs}
                  onAnalysisPick={handleAnalysisPick}
                  onOpenTransaction={handleOpenTx}
                  onOpenDocument={openDocument}
                  onFreeText={handleFreeText}
                >
                  <TransactionsPage transactions={transactions} />
                </LayoutWrapper>
              </PrivateRoute>
            }
          />

          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        
          <Route
            path="/detail/:entity/:value"
            element={
              <PrivateRoute>
                <LayoutWrapper
                  theme={theme} toggleTheme={toggleTheme}
                  menuPinned={menuPinned} setMenuPinned={setMenuPinned}
                  menuExpanded={menuExpanded} setMenuExpanded={setMenuExpanded}
                  accounts={accounts} categories={categories} types={types}
                  filters={filters} setFilters={setFilters}
                  allTransactions={transactions} docs={[]}
                >
                  <EntityDetail accounts={accounts} categories={categories} transactions={transactions} />
                </LayoutWrapper>
              </PrivateRoute>
            }
          />

          <Route
            path="/beneficiaries"
            element={
              <PrivateRoute>
                <LayoutWrapper
                  theme={theme}
                  toggleTheme={toggleTheme}
                  menuPinned={menuPinned}
                  setMenuPinned={setMenuPinned}
                  menuExpanded={menuExpanded}
                  setMenuExpanded={setMenuExpanded}
                  accounts={accounts}
                  categories={categories}
                  types={types}
                  filters={filters}
                  setFilters={setFilters}
                  /* 🔎 navbar props */
                  allTransactions={allTransactions}
                  docs={docs}
                  onAnalysisPick={handleAnalysisPick}
                  onOpenTransaction={handleOpenTx}
                  onOpenDocument={openDocument}
                  onFreeText={handleFreeText}
                >
                  <Beneficiaries transactions={transactions} />
                </LayoutWrapper>
              </PrivateRoute>
            }
          />

        </Routes>
      </Router>
    </SearchProvider>
  );
};

export default AppRouter;