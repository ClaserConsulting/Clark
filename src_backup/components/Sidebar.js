import React from "react";
import styled from "styled-components";
import { HomeIcon, ConfigIcon, UserIcon, PinIcon, HamburgerIcon } from "../icons";

const SidebarContainer = styled.nav`
  position: relative;
  width: ${({ expanded }) => (expanded ? "220px" : "56px")};
  background: ${({ theme }) => theme.sidebarBg};
  color: ${({ theme }) => theme.sidebarColor};
  height: 100vh;
  transition: width 0.3s ease;
  box-shadow: 2px 0 8px rgb(0 0 0 / 0.15);
  user-select: none;
  display: flex;
  flex-direction: column;
`;

const MenuList = styled.ul`
  margin: 0; padding: 0; list-style: none; flex-grow: 1;
`;

const MenuItem = styled.li`
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 12px 16px;
  color: ${({ active, theme }) => (active ? theme.accent : theme.sidebarColor)};
  background-color: ${({ active, theme }) => (active ? theme.hoverBg : "transparent")};
  &:hover {
    background-color: ${({ theme }) => theme.hoverBg};
  }
`;

const IconWrapper = styled.div`
  min-width: 24px;
  display: flex;
  justify-content: center;
  align-items: center;
  svg {
    stroke: ${({ theme }) => theme.sidebarColor};
    stroke-width: 1.5;
    width: 20px;
    height: 20px;
  }
`;

const Label = styled.span`
  margin-left: 12px;
  font-weight: 500;
  white-space: nowrap;
  opacity: ${({ expanded }) => (expanded ? 1 : 0)};
  transition: opacity 0.3s ease;
`;

const PinButton = styled.button`
  position: absolute;
  top: 56px;
  right: -10px;
  background: ${({ active, theme }) => (active ? theme.pinActive : theme.pinInactive)};
  border: none;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.3s ease;
  svg {
    stroke: ${({ theme, active }) => (active ? theme.sidebarColor : "transparent")};
    stroke-width: 2;
    width: 12px;
    height: 12px;
  }
`;

const HamburgerWrapper = styled.div`
  padding: 12px 16px;
  cursor: pointer;
  svg {
    stroke: ${({ theme }) => theme.sidebarColor};
    stroke-width: 1.5;
    width: 24px;
    height: 24px;
  }
`;

export default function Sidebar({ pinned, expanded, onPinToggle, onHoverChange, activeSection, onSelectSection, theme }) {
  return (
    <SidebarContainer
      expanded={expanded}
      onMouseEnter={() => onHoverChange(true)}
      onMouseLeave={() => onHoverChange(false)}
    >
      <HamburgerWrapper onClick={() => onPinToggle()}>
        <HamburgerIcon />
      </HamburgerWrapper>
      <MenuList>
        <MenuItem active={activeSection === "dashboard"} onClick={() => onSelectSection("dashboard")}>
          <IconWrapper><HomeIcon color={theme === "dark" ? "#fff" : "#000"} /></IconWrapper>
          <Label expanded={expanded}>Dashboard</Label>
        </MenuItem>
        <MenuItem active={activeSection === "config"} onClick={() => onSelectSection("config")}>
          <IconWrapper><ConfigIcon color={theme === "dark" ? "#fff" : "#000"} /></IconWrapper>
          <Label expanded={expanded}>Configurazione</Label>
        </MenuItem>
        <MenuItem active={activeSection === "profile"} onClick={() => onSelectSection("profile")}>
          <IconWrapper><UserIcon color={theme === "dark" ? "#fff" : "#000"} /></IconWrapper>
          <Label expanded={expanded}>Profilo</Label>
        </MenuItem>
      </MenuList>
      <PinButton active={pinned} onClick={onPinToggle} aria-label={pinned ? "Blocca menu" : "Sblocca menu"}>
        <PinIcon />
      </PinButton>
    </SidebarContainer>
  );
}
