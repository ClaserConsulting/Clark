// 📍 src/components/widgets/FiltersBar.jsx
import React, { useState, useMemo } from "react";
import styled, { keyframes } from "styled-components";
import { useTranslation } from "react-i18next";

const rollDown = keyframes`
  0% {
    opacity: 0;
    transform: translate(-50%, 20%) scaleY(0.8);
  }
  100% {
    opacity: 1;
    transform: translate(-50%, 0%) scaleY(1);
  }
`;

const Container = styled.div`
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1001;
`;

const ToggleButton = styled.div`
  background: rgba(0, 0, 0, 0.3);
  width: 64px;
  height: 36px;
  border-radius: 20px 20px 0 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 -2px 12px rgba(0, 0, 0, 0.25);
  backdrop-filter: blur(6px);
  transition: all 0.3s ease;

  &:hover {
    background: rgba(0, 0, 0, 0.5);
  }

  span {
    height: 2px;
    background: white;
    margin: 2px 0;
    border-radius: 1px;
    transition: width 0.3s ease;
  }
  span:nth-child(1) { width: 50%; }
  span:nth-child(2) { width: 70%; }
  span:nth-child(3) { width: 40%; }
`;

const Dropdown = styled.div`
  background-color: ${({ theme }) => theme.card};
  box-shadow: 0 -4px 16px ${({ theme }) => theme.widgetShadow};
  border-radius: 16px 16px 0 0;
  padding: 2rem;
  display: ${({ visible }) => (visible ? "flex" : "none")};
  gap: 2rem;
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  animation: ${({ visible }) => (visible ? rollDown : "none")} 0.6s ease forwards;
  opacity: ${({ visible }) => (visible ? 1 : 0)};
  pointer-events: ${({ visible }) => (visible ? "all" : "none")};
`;

const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
`;

const Label = styled.label`
  font-size: 0.75rem;
  margin-bottom: 0.25rem;
  color: ${({ theme }) => theme.text};
`;

const Select = styled.select`
  padding: 0.4rem;
  border-radius: 6px;
  border: 1px solid #ccc;
  background-color: ${({ theme }) => theme.background};
  color: ${({ theme }) => theme.text};
`;

const FiltersBar = ({ filters, setFilters, accounts = [], categories = [] }) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  const handleChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const accountOptions = useMemo(() => [
    { id: "Tutti", name: t("Tutti") },
    ...accounts
  ], [accounts, t]);

  const categoryOptions = useMemo(() => [
    { id: "Tutte", name: t("Tutte") },
    ...categories
  ], [categories, t]);

  return (
    <Container>
      <ToggleButton onClick={() => setOpen(!open)}>
        <span></span>
        <span></span>
        <span></span>
      </ToggleButton>
      <Dropdown visible={open}>
        <FilterGroup>
          <Label>{t("Account")}</Label>
          <Select
            value={filters.accountId || "Tutti"}
            onChange={(e) => handleChange("accountId", e.target.value)}
          >
            {accountOptions.map((acc) => (
              <option key={acc.id} value={acc.id}>{acc.name}</option>
            ))}
          </Select>
        </FilterGroup>

        <FilterGroup>
          <Label>{t("Categorie")}</Label>
          <Select
            value={filters.categoryId || "Tutte"}
            onChange={(e) => handleChange("categoryId", e.target.value)}
          >
            {categoryOptions.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </Select>
        </FilterGroup>
      </Dropdown>
    </Container>
  );
};

export default FiltersBar;
