// 📁 src/components/widgets/FiltersBar.jsx
import React, { useMemo } from "react";
import styled from "styled-components";

const Bar = styled.div`
  display: flex;
  gap: 1rem;
  padding: 1rem;
  background: ${({ theme }) => theme.card};
  border-bottom: 1px solid ${({ theme }) => theme.hoverBg};
`;

const Select = styled.select`
  padding: 0.5rem;
  border-radius: 8px;
  border: none;
  background: ${({ theme }) => theme.background};
  color: ${({ theme }) => theme.text};
`;

const FiltersBar = ({ filters, setFilters, accounts = [], categories = [], theme }) => {
  const accountOptions = useMemo(() => {
    return Array.from(new Set((accounts || []).map((a) => a.name)));
  }, [accounts]);

  const categoryOptions = useMemo(() => {
    return Array.from(new Set((categories || []).map((c) => c.label)));
  }, [categories]);

  return (
    <Bar>
      <Select
        value={filters.account || ""}
        onChange={(e) => setFilters((f) => ({ ...f, account: e.target.value }))}
      >
        <option value="">Tutti gli account</option>
        {accountOptions.map((account) => (
          <option key={account} value={account}>{account}</option>
        ))}
      </Select>

      <Select
        value={filters.category || ""}
        onChange={(e) => setFilters((f) => ({ ...f, category: e.target.value }))}
      >
        <option value="">Tutte le categorie</option>
        {categoryOptions.map((cat) => (
          <option key={cat} value={cat}>{cat}</option>
        ))}
      </Select>
    </Bar>
  );
};

export default FiltersBar;
