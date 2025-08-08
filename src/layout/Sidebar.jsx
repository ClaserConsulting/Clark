// 📁 src/components/Sidebar.jsx
import React from "react";
import styled from "styled-components";
import { useNavigate, useLocation } from "react-router-dom";
import { HomeIcon, ConfigIcon, UserIcon, PinIcon, HamburgerIcon } from "../assets/icons/icons";

const SidebarContainer = styled.nav`
  position: fixed;
  top: 64px;
  left: 0;
  width: ${({ expanded }) => (expanded ? "220px" : "56px")};
  background: ${({ theme }) => theme.sidebarBg};
  color: ${({ theme }) => theme.sidebarColor};
  height: calc(100vh - 64px);
  transition: width 0.3s ease, transform 0.3s ease;
  box-shadow: 2px 0 8px rgb(0 0 0 / 0.15);
  user-select: none;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  z-index: 1001;

  @media (max-width: 768px) {
    width: 220px;
    transform: ${({ expanded }) => (expanded ? "translateX(0)" : "translateX(-100%)")};
  }
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

  @media (max-width: 768px) {
    display: none;
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

export default function Sidebar({ pinned, expanded, onPinToggle, onHoverChange = () => {}, theme }) {
  const navigate = useNavigate();
  const location = useLocation();

  const sections = [
    { key: "dashboard", label: "Dashboard", icon: <HomeIcon color={theme === "dark" ? "#fff" : "#000"} />, path: "/" },
    { key: "config", label: "Configurazione", icon: <ConfigIcon color={theme === "dark" ? "#fff" : "#000"} />, path: "/config" },
    { key: "profile", label: "Profilo", icon: <UserIcon color={theme === "dark" ? "#fff" : "#000"} />, path: "/profile" },
  ];

  return (
    <SidebarContainer
      expanded={expanded}
      onMouseEnter={() => onHoverChange(true)}
      onMouseLeave={() => onHoverChange(false)}
    >
      <HamburgerWrapper onClick={onPinToggle}>
        <HamburgerIcon />
      </HamburgerWrapper>

      <MenuList>
        {sections.map((section) => (
          <MenuItem
            key={section.key}
            active={location.pathname === section.path}
            onClick={() => navigate(section.path)}
          >
            <IconWrapper>{section.icon}</IconWrapper>
            <Label expanded={expanded}>{section.label}</Label>
          </MenuItem>
        ))}
      </MenuList>

      <PinButton active={pinned} onClick={onPinToggle} aria-label={pinned ? "Blocca menu" : "Sblocca menu"}>
        <PinIcon />
      </PinButton>
    </SidebarContainer>
  );
}
