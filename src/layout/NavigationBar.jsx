import React, { useRef, useState, useEffect } from "react";
import styled from "styled-components";
import { FiMoon, FiSun } from "react-icons/fi";
import Logo from "../assets/logo";
import { useTranslation } from "react-i18next";
import i18n from "../i18n/config";
import { UserIcon, UpgradeIcon, LogoutIcon } from "../data/icons";
import { keyframes } from "styled-components";
import { useNavigate } from "react-router-dom";
import { logout, isAuthenticated } from "../services/authService";

const fadeInScale = keyframes`
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
`;

const Nav = styled.nav`
  width: 100%;
  height: 64px;
  background: ${({ theme }) => theme.sidebarBg};
  color: ${({ theme }) => theme.sidebarColor};
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 2rem;
  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.15);
  z-index: 1100;
`;

const Brand = styled.div`
  display: flex;
  align-items: center;
  font-size: 1.5rem;
  font-weight: bold;
  gap: 0.5rem;
`;

const Controls = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  position: relative;
`;

const ToggleTheme = styled.button`
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 12px;
  padding: 0.4rem 0.7rem;
  color: white;
  cursor: pointer;
  transition: background 0.3s ease;
  font-size: 1rem;
  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }
`;

const LanguageSelector = styled.select`
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 8px;
  padding: 0.3rem 0.5rem;
  color: white;
  font-size: 0.9rem;
  cursor: pointer;
`;

const Avatar = styled.div`
  background-color: #006666;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 0.9rem;
  cursor: pointer;
`;

const Dropdown = styled.div`
  position: absolute;
  top: 56px;
  right: 0;
  background: ${({ theme }) => theme.card};
  border-radius: 10px;
  box-shadow: 0 4px 12px ${({ theme }) => theme.tileShadow};
  backdrop-filter: blur(10px);
  overflow: hidden;
  z-index: 999;
  min-width: 180px;
  animation: ${fadeInScale} 0.2s ease-out;
  transform-origin: top right;
`;

const DropdownItem = styled.div`
  padding: 0.75rem 1rem;
  font-size: 0.9rem;
  color: ${({ theme }) => theme.text};
  cursor: pointer;
  &:hover {
    background: ${({ theme }) => theme.hoverBg};
  }
`;

// 👤 ESEMPIO UTENTE
const user = {
  nome: "Claudio",
  cognome: "Serra",
};

const getInitials = (user) => {
  if (!user) return "??";
  const { nome, cognome } = user;
  if (nome && cognome) return nome[0] + cognome[0];
  return nome?.slice(0, 2).toUpperCase() || "??";
};

const NavigationBar = ({ darkMode, toggleTheme }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);

  // Chiudi il menu cliccando fuori
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <Nav>
      <Brand>
        <Logo darkMode={darkMode} style={{ height: 32, filter: "drop-shadow(0 1px 4px rgba(0,0,0,0.3))" }} />
        Clark
      </Brand>

      <Controls ref={menuRef}>
        <LanguageSelector
          onChange={(e) => i18n.changeLanguage(e.target.value)}
          value={i18n.language}
        >
          <option value="it">🇮🇹</option>
          <option value="en">🇬🇧</option>
          <option value="de">🇩🇪</option>
          <option value="fr">🇫🇷</option>
        </LanguageSelector>

        <ToggleTheme onClick={toggleTheme}>
          {darkMode ? <FiSun /> : <FiMoon />}
        </ToggleTheme>

        <Avatar onClick={() => setShowMenu((prev) => !prev)}>
          {getInitials(user)}
        </Avatar>

        {showMenu && (
          <Dropdown>
            <DropdownItem><UserIcon /> {t("Profilo")}</DropdownItem>
            <DropdownItem><UpgradeIcon /> {t("Upgrade del piano")}</DropdownItem>
            <DropdownItem
              onClick={() => {
                logout();
                navigate("/login");
              }}
            >
              <LogoutIcon /> {t("logout")}
            </DropdownItem>
          </Dropdown>
        )}
      </Controls>
    </Nav>
  );
};

export default NavigationBar;