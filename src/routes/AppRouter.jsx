import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import PrivateRoute from "./PrivateRoute";

import Dashboard from "../pages/Dashboard";
import Profile from "../pages/Profile";
import Settings from "../pages/Settings";
import Sidebar from "../layout/Sidebar";
import NavigationBar from "../layout/NavigationBar";
import FiltersBar from "../components/widgets/FiltersBar";
import LoginPage from "../pages/Login";
import ForgotPassword from "../pages/Auth/ForgotPassword";
import ResetPassword from "../pages/Auth/ResetPassword";

const LayoutWrapper = ({
  theme,
  toggleTheme,
  menuPinned,
  setMenuPinned,
  menuExpanded,
  setMenuExpanded,
  accounts,
  categories,
  filters,
  setFilters,
  children,
}) => (
  <div className="app-container" style={{
    display: "flex",
    height: "100vh",
    overflow: "hidden",
    backgroundColor: theme === "light" ? "#f5f7fa" : "#002f33", // stile Clark
  }}>
    <Sidebar
      pinned={menuPinned}
      expanded={menuPinned || menuExpanded}
      onPinToggle={() => setMenuPinned(!menuPinned)}
      onHoverChange={(expanded) => !menuPinned && setMenuExpanded(expanded)}
      theme={theme}
    />

    <div style={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
      <NavigationBar theme={theme} toggleTheme={toggleTheme} />

      <FiltersBar
        filters={filters}
        setFilters={setFilters}
        accounts={accounts}
        categories={categories}
        theme={theme}
      />

      <main style={{ flexGrow: 1, overflowY: "auto", padding: "1rem" }}>
        {children}
      </main>
    </div>
  </div>
);

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
  transactions,
  filteredTransactions,
  filters,
  setFilters,
  showAll,
  setShowAll,
}) => {
  return (
    <Router>
      <Routes>
        <Route
          path="/"
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
                filters={filters}
                setFilters={setFilters}
              >
                <Dashboard
                  accounts={accounts}
                  setAccounts={setAccounts}
                  categories={categories}
                  filters={filters}
                  transactions={transactions}
                  filteredTransactions={filteredTransactions}
                  theme={theme}
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
                filters={filters}
                setFilters={setFilters}
              >
                <Settings
                  accounts={accounts}
                  setAccounts={setAccounts}
                  categories={categories}
                  setCategories={setCategories}
                  theme={theme}
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
                filters={filters}
                setFilters={setFilters}
              >
                <Profile />
              </LayoutWrapper>
            </PrivateRoute>
          }
        />

        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default AppRouter;
