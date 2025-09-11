import React, { useRef, useState, useEffect } from "react";
import styled, { keyframes } from "styled-components";
import GlobalSearch from "../components/GlobalSearch";
import Logo from "../assets/logo";
import { useTranslation } from "react-i18next";
import i18n from "../i18n/config";
import { UserIcon, UpgradeIcon, LogoutIcon } from "../assets/icons/icons";
import { useNavigate } from "react-router-dom";
import { logout } from "../services/authService";
import AvatarDropdown from "../layout/AvatarDropdown";
import { useThemeSettings } from "../context/ThemeContext";

/* Anim */
const fadeInScale = keyframes`
  from { opacity: 0; transform: scale(0.95); }
  to   { opacity: 1; transform: scale(1); }
`;

/* Styled */
const Nav = styled.nav`
  position: fixed;
  inset: 0 auto auto 0;
  width: 100%;
  height: var(--topbar-h, 64px);
  background: ${({ theme }) => theme.sidebarBg};
  color: ${({ theme }) => theme.sidebarColor};
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 2rem;
  box-shadow: 0 1px 6px rgba(0,0,0,.15);
  z-index: 1100;
  overflow: visible;
`;

const Brand = styled.div`
  display: flex;
  align-items: center;
  gap: .5rem;
  font: 600 1.5rem 'Montserrat', sans-serif;
`;

const SearchWrap = styled.div`
  flex: 1;
  display: flex;
  justify-content: center;
  padding: 0 1rem;
  position: relative;
  overflow: visible;
  z-index: 1200; /* la search resta sopra il blur */
`;

const Controls = styled.div`
  display: flex;
  align-items: center;
  gap: .75rem;
  position: relative;
`;

const LanguageSelector = styled.select`
  background: ${({ theme }) => theme.surfaceElev};
  border: 1px solid ${({ theme }) => theme.border};
  color: ${({ theme }) => theme.text};
  border-radius: 8px;
  padding: .35rem .5rem;
  font-size: .85rem;
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
  z-index: 1300;
  min-width: 180px;
  animation: ${fadeInScale} .18s ease-out;
  transform-origin: top right;
`;

const DropdownItem = styled.div`
  padding: .75rem 1rem;
  font-size: .9rem;
  color: ${({ theme }) => theme.text};
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: .5rem;
  &:hover { background: ${({ theme }) => theme.hoverBg}; }
`;

const ThemeCombo = styled.select`
  background: ${({ theme }) => theme.surfaceElev};
  border: 1px solid ${({ theme }) => theme.border};
  color: ${({ theme }) => theme.text};
  border-radius: 8px;
  padding: .35rem .6rem;
  font-size: .85rem;
  cursor: pointer;
`;

/* Component */
const user = { nome: "Claudio", cognome: "Salvatore" };
const fullName = user?.cognome ? `${user.nome} ${user.cognome}` : user.nome;

const NavigationBar = ({
  theme,                  // "dark" | "light" (compat)
  toggleTheme,            // legacy/no-op
  transactions = [],
  categories = [],
  accounts = [],
  documents = [],
  onAnalysisPick,
  onOpenTransaction,
  onOpenDocument,
  onFreeText,
}) => {
  const navigate = useNavigate();             // ✅ FIX no-undef
  const { t } = useTranslation();             // ✅ FIX no-undef

  const [showMenu, setShowMenu] = useState(false);  // ✅ FIX no-undef
  const menuRef = useRef(null);

  const { themeFamily, setThemeFamily, themeMode, setThemeMode } = useThemeSettings();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setShowMenu(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const themeValue = `${themeFamily}:${themeMode}`;
  const onThemeChange = (e) => {
    const [family, mode] = e.target.value.split(":");
    setThemeFamily(family);
    setThemeMode(mode);
  };

  return (
    <Nav>
      <Brand>
        <Logo darkMode={themeMode === "dark"} style={{ height: 32, filter: "drop-shadow(0 1px 4px rgba(0,0,0,.3))" }} />
        Clark
      </Brand>

      <SearchWrap>
        <GlobalSearch
          transactions={transactions}
          categories={categories}
          accounts={accounts}
          documents={documents}
          onPick={(p) => {
            if (p.type === "openDetail") navigate(`/detail/${p.entity}/${encodeURIComponent(p.value)}`);
            if (p.type === "analysis") onAnalysisPick?.(p.dimension, p.value);
            if (p.type === "open" && p.target === "transaction") onOpenTransaction?.(p.id);
            if (p.type === "open" && p.target === "document") onOpenDocument?.(p.id);
          }}
          onSubmit={(query) => onFreeText?.(query)}
        />
      </SearchWrap>

      <Controls ref={menuRef}>
        <ThemeCombo value={themeValue} onChange={onThemeChange} title="Tema">
          <option value="legacy:dark">Legacy — Dark (default)</option>
          <option value="legacy:light">Legacy — Light</option>
          <option value="neon:dark">Neon — Dark</option>
          <option value="neon:light">Neon — Light</option>
          <option value="warm:dark">Warm — Dark</option>
          <option value="warm:light">Warm — Light</option>
          <option value="calm:dark">Calm — Dark</option>
          <option value="calm:light">Calm — Light</option>
          <option value="classic:dark">Classic — Dark</option>
          <option value="classic:light">Classic — Light</option>
        </ThemeCombo>

        <LanguageSelector value={i18n.language} onChange={(e) => i18n.changeLanguage(e.target.value)}>
          <option value="it">🇮🇹</option>
          <option value="en">🇬🇧</option>
          <option value="de">🇩🇪</option>
          <option value="fr">🇫🇷</option>
        </LanguageSelector>

        <AvatarDropdown user={{ name: fullName }} />

        {showMenu && (
          <Dropdown>
            <DropdownItem><UserIcon /> {t("Profilo")}</DropdownItem>
            <DropdownItem><UpgradeIcon /> {t("Upgrade del piano")}</DropdownItem>
            <DropdownItem onClick={() => { logout(); navigate("/login"); }}>
              <LogoutIcon /> {t("logout")}
            </DropdownItem>
          </Dropdown>
        )}
      </Controls>
    </Nav>
  );
};

export default NavigationBar;
