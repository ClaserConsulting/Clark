// 📁 src/layout/AppLayout.jsx
import React, { useState, useEffect, useCallback } from "react";
import styled from "styled-components";
import Sidebar from "./Sidebar";
import NavigationBar from "../layout/NavigationBar";


const Layout = styled.div`
  display: flex;
`;

const Overlay = styled.div`
  display: none;
  @media (max-width: 768px) {
    display: ${({ active }) => (active ? "block" : "none")};
    position: fixed;
    top: 64px;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 1000;
  }
`;

const MainContent = styled.div`
  margin-left: ${({ expanded }) => (expanded ? "220px" : "56px")};
  width: ${({ expanded }) => (expanded ? "calc(100% - 220px)" : "calc(100% - 56px)")};
  transition: margin-left 0.3s ease;

  @media (max-width: 768px) {
    margin-left: 0;
    width: 100%;
  }
`;

const FixedTop = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1100;
`;

const ContentWrapper = styled.div`
  padding: 6rem 2rem 2rem;
  background: ${({ theme }) => theme.mainBg};
  min-height: 100vh;
`;

const AppLayout = ({ children, darkMode, toggleTheme }) => {
  const [pinned, setPinned] = useState(true);
  const [hovered, setHovered] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const expanded = pinned || hovered || mobileSidebarOpen;

  const handlePinToggle = () => {
    if (window.innerWidth <= 768) {
      setMobileSidebarOpen((prev) => !prev);
    } else {
      setPinned((prev) => !prev);
    }
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
      <FixedTop>
        <NavigationBar darkMode={darkMode} toggleTheme={toggleTheme} />
      </FixedTop>

      <Sidebar
        pinned={pinned}
        expanded={expanded}
        onPinToggle={handlePinToggle}
        onHoverChange={setHovered}
        theme={darkMode ? "dark" : "light"}
      />

      <Overlay active={mobileSidebarOpen} onClick={() => setMobileSidebarOpen(false)} />

      <MainContent expanded={expanded}>
        <ContentWrapper>{children}</ContentWrapper>
      </MainContent>
    </Layout>
  );
};

export default AppLayout;
