import React from "react";
import styled from "styled-components";
import LogoutButton from "../components/ui/LogoutButton";
import ThemeToggle from "../components/ui/ThemeToggle";

const Header = styled.header`
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 1rem;
  background-color: ${({ theme }) => theme.sidebarBg};
  color: ${({ theme }) => theme.sidebarColor};
  border-bottom: 1px solid ${({ theme }) => theme.hoverBg};
  position: sticky;
  top: 0;
  z-index: 10;
`;

const Title = styled.h1`
  font-size: 1.2rem;
  margin: 0;
`;

const RightArea = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const Welcome = styled.span`
  font-size: 0.9rem;
  color: ${({ theme }) => theme.sidebarColor};
`;

const NavigationBar = ({ theme, toggleTheme }) => {
  return (
    <Header>
      <Title>Gestione Spese</Title>
      <RightArea>
        <Welcome>Benvenuto, Claudio</Welcome>
        <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
        <LogoutButton />
      </RightArea>
    </Header>
  );
};

export default NavigationBar;
