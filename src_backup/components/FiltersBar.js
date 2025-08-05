import React, { useState, useMemo } from "react";
import styled from "styled-components";
import { formatDate } from "../utils/format";

const FiltersContainer = styled.div`
  position: fixed;
  bottom: 0;
  left: ${({ sidebarWidth }) => sidebarWidth}px;
  right: 0;
  background: ${({ theme }) => theme.sidebarBg};
  border-top: 1px solid ${({ theme }) => theme.hoverBg};
  padding: 8px 16px;
  box-shadow: 0 -2px 6px rgb(0 0 0 / 0.1);
  transition: height 0.3s ease;
  overflow: hidden;
  z-index: 20;
`;

const FiltersSummary = styled.div`
  cursor: pointer;
  color: ${({ theme }) => theme.text};
  user-select: none;
`;

const FiltersExpand = styled.div`
  margin-top: 12px;
`;

const Section = styled.div`
  margin-bottom: 10px;
`;

const Label = styled.label`
  font-weight: 600;
  display: block;
  margin-bottom: 4px;
`;

const CheckboxLabel = styled.label`
  display: inline-flex;
  align-items: center;
  margin-right: 12px;
  margin-bottom: 6px;
  cursor: pointer;
  input {
    margin-right: 4px;
  }
`;

const DateInputs = styled.div`
  display: flex;
  gap: 8px;
  input[type="date"] {
    padding: 4px 6px;
    border-radius: 4px;
    border: 1px solid ${({ theme }) => theme.hoverBg};
  }
`;

export default function FiltersBar({ filters, setFilters, accounts, categories, theme }) {
  const [expanded, setExpanded] = useState(false);

  // Composizione testo filtri attivi (barra compressa)
  const filtersSummary = useMemo(() => {
    const tipo = Array.from(filters.tipo).map((t) =>
      t === "entrate" ? "Entrate" : t === "uscite" ? "Uscite" : "Trasferimenti"
    );
    const categoriesNames = categories
      .filter((c) => filters.categories.has(c.id))
      .map((c) => c.name);
    const accountsNames = accounts.filter((a) => filters.accounts.has(a.id)).map((a) => a.name);
    const [from, to] = filters.dateRange;
    const dateText =
      from && to
        ? `${formatDate(from)} - ${formatDate(to)}`
        : from
        ? `Da ${formatDate(from)}`
        : to
        ? `Fino a ${formatDate(to)}`
        : "Tutto il periodo";

    return `Tipo: ${tipo.join(", ")} | Categorie: ${
      categoriesNames.length ? categoriesNames.join(", ") : "Tutte"
    } | Conti: ${accountsNames.length ? accountsNames.join(", ") : "Tutti"} | Data: ${dateText}`;
  }, [filters, categories, accounts]);

  // Handlers checkbox e selezioni multipla
  function toggleTipo(value) {
    const newTipo = new Set(filters.tipo);
    if (newTipo.has(value)) newTipo.delete(value);
    else newTipo.add(value);
    setFilters({ ...filters, tipo: newTipo });
  }

  function toggleCategory(id) {
    const newCats = new Set(filters.categories);
    if (newCats.has(id)) newCats.delete(id);
    else newCats.add(id);
    setFilters({ ...filters, categories: newCats });
  }

  function toggleAccount(id) {
    const newAccs = new Set(filters.accounts);
    if (newAccs.has(id)) newAccs.delete(id);
    else newAccs.add(id);
    setFilters({ ...filters, accounts: newAccs });
  }

  function setDateRange(from, to) {
    setFilters({ ...filters, dateRange: [from, to] });
  }

  return (
    <FiltersContainer sidebarWidth={expanded ? 220 : 56} theme={theme} style={{ height: expanded ? "auto" : "40px" }}>
      <FiltersSummary onClick={() => setExpanded(!expanded)}>{filtersSummary}</FiltersSummary>
      {expanded && (
        <FiltersExpand>
          <Section>
            <Label>Tipo transazione</Label>
            {["entrate", "uscite", "trasferimento"].map((t) => (
              <CheckboxLabel key={t}>
                <input
                  type="checkbox"
                  checked={filters.tipo.has(t)}
                  onChange={() => toggleTipo(t)}
                />
                {t === "entrate" ? "Entrate" : t === "uscite" ? "Uscite" : "Trasferimenti"}
              </CheckboxLabel>
            ))}
          </Section>
          <Section>
            <Label>Categorie</Label>
            <div style={{ maxHeight: 100, overflowY: "auto", border: `1px solid ${theme.hoverBg}`, padding: 4 }}>
              {categories.map((c) => (
                <CheckboxLabel key={c.id}>
                  <input
                    type="checkbox"
                    checked={filters.categories.has(c.id)}
                    onChange={() => toggleCategory(c.id)}
                  />
                  {c.name}
                </CheckboxLabel>
              ))}
            </div>
          </Section>
          <Section>
            <Label>Conti</Label>
            <div style={{ maxHeight: 100, overflowY: "auto", border: `1px solid ${theme.hoverBg}`, padding: 4 }}>
              {accounts.map((a) => (
                <CheckboxLabel key={a.id}>
                  <input
                    type="checkbox"
                    checked={filters.accounts.has(a.id)}
                    onChange={() => toggleAccount(a.id)}
                  />
                  {a.name}
                </CheckboxLabel>
              ))}
            </div>
          </Section>
          <Section>
            <Label>Data</Label>
            <DateInputs>
              <input
                type="date"
                value={filters.dateRange[0] ? filters.dateRange[0].toISOString().slice(0, 10) : ""}
                onChange={(e) => setDateRange(e.target.value ? new Date(e.target.value) : null, filters.dateRange[1])}
              />
              <input
                type="date"
                value={filters.dateRange[1] ? filters.dateRange[1].toISOString().slice(0, 10) : ""}
                onChange={(e) => setDateRange(filters.dateRange[0], e.target.value ? new Date(e.target.value) : null)}
              />
            </DateInputs>
          </Section>
        </FiltersExpand>
      )}
    </FiltersContainer>
  );
}
