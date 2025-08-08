// 📁 src/pages/Dashboard/widgets/RecentTransactions.jsx
import React, { useState } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import {Amount, Column, Section, Item} from "../styled"

const LoadMore = styled.button`
  margin: 0.3rem;
  padding: 0.6rem 1rem;
  border: none;
  border-radius: 8px;
  background: ${({ theme }) => theme.hoverBg};
  color: ${({ theme }) => theme.text};
  cursor: pointer;
  transition: background 0.3s ease;
  &:hover {
    background: ${({ theme }) => theme.accent};
    color: #fff;
  }
`;

const ShowAll = styled(LoadMore)`
margin: 0.3rem;
  padding: 0.6rem 1rem;
  border: none;
  border-radius: 8px;
  background: ${({ theme }) => theme.hoverBg};
  color: ${({ theme }) => theme.text};
  cursor: pointer;
  transition: background 0.3s ease;
  &:hover {
    background: ${({ theme }) => theme.accent};
    color: #fff;
  }
`;

const RecentTransactions = ({ transactions = [] }) => {
  const navigate = useNavigate();
  const sorted = [...transactions].sort((a, b) => new Date(b.date) - new Date(a.date));
  const [visibleCount, setVisibleCount] = useState(5);
  const visible = sorted.slice(0, visibleCount);

  const handleLoadMore = () => setVisibleCount((prev) => prev + 10);

  return (
    <Section>
      {visible.map((tx) => {
        const isIncome = tx.type === "Entrata";
        const isTransfer = tx.type === "Trasferimento";
        return (
          <Item key={tx.id} isIncome={isIncome} isTransfer={isTransfer}>
            <Column>{tx.date}</Column>
            <Column>{tx.categoryName}</Column>
            <Column>{tx.subcategory}</Column>
            <Column>{tx.accountId || "-"}</Column>
            <Column>{tx.accountTo || tx.beneficiary}</Column>
            <Amount isIncome={isIncome} isTransfer={isTransfer}> {tx.importo.toFixed(2)}€</Amount>
          </Item>
        );
      })}
      {visibleCount < transactions.length && (
        <LoadMore onClick={handleLoadMore}>Mostra altre</LoadMore>
      )}
      <ShowAll onClick={() => navigate("/transactions")}>Mostra tutte</ShowAll>
    </Section>
  );
};

export default RecentTransactions;
