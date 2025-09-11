// 📁 src/layout/AppLayout.jsx
import React, { useState, useEffect, useCallback } from "react";
import styled from "styled-components";
import Sidebar from "./Sidebar";
import NavigationBar from "../layout/NavigationBar";
import FiltersBar from "../layout/FiltersBar"; // crea questo piccolo componente (vedi sotto)

const Layout = styled.div`
  --topbar-h: 64px;
  --filters-h: 48px;   /* regola se ti serve più alto */
  --sidebar-w: 220px;

  display: grid;
  grid-template-columns: var(--sidebar-w) 1fr;
  grid-template-rows: var(--topbar-h) var(--filters-h) minmax(0, 1fr);
  grid-template-areas:
    "topbar  topbar"
    "sidebar filters"
    "sidebar main";
  min-height: 100dvh;
  background: ${({ theme }) => theme.mainBg};
`;

const NavBarWrap = styled.header`
  grid-area: topbar;
  position: sticky;
  top: 0;
  z-index: 1000;
`;

const SidebarWrap = styled.aside`
  grid-area: sidebar;
  position: sticky;
  top: var(--topbar-h);
  height: calc(100dvh - var(--topbar-h));
  overflow: auto;
  z-index: 900;
  box-shadow: 2px 0 8px rgb(0 0 0 / 0.08);
`;

const FiltersWrap = styled.div`
  grid-area: filters;
  position: sticky;
  top: var(--topbar-h);
  height: var(--filters-h);
  display: flex;
  align-items: center;
  padding: 0 12px;
  background: ${({ theme }) => theme.mainBg};
  border-bottom: 1px solid ${({ theme }) => theme.separator || "rgba(0,0,0,.08)"};
  z-index: 950; /* sopra il main, sotto la navbar */
`;

const MainWrap = styled.main`
  grid-area: main;
  min-width: 0;
  overflow: auto;
  padding: 16px;  /* spazio pagina */
`;

const AppLayout = ({ children, theme, toggleTheme }) => {
  const [pinned, setPinned] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const expanded = pinned || hovered || mobileSidebarOpen;

  const [filters, setFilters] = useState({
    type: "Tutti",
    accountId: "Tutti",
    categoryName: "Tutte",
  });

  const handlePinToggle = () => {
    if (window.innerWidth <= 768) setMobileSidebarOpen((prev) => !prev);
    else setPinned((prev) => !prev);
  };

  const handleKeyDown = useCallback((e) => {
    if (e.key === "Escape") setMobileSidebarOpen(false);
  }, []);

  useEffect(() => {
    if (mobileSidebarOpen) document.addEventListener("keydown", handleKeyDown);
    else document.removeEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [mobileSidebarOpen, handleKeyDown]);

  return (
    <Layout>
      <NavBarWrap>
        <NavigationBar theme={theme} toggleTheme={toggleTheme} />
      </NavBarWrap>

      <SidebarWrap>
        <Sidebar
          pinned={pinned}
          expanded={expanded}
          onPinToggle={handlePinToggle}
          onHoverChange={setHovered}
          theme={theme}
        />
      </SidebarWrap>

      <MainWrap>{children}</MainWrap>
    </Layout>
  );
};

export default AppLayout;
