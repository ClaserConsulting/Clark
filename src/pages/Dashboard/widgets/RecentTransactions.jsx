// 📁 src/pages/Dashboard/widgets/RecentTransactions.jsx
import React from "react";
import styled from "styled-components";
import transactions from "../../../data/transactions";

const Section = styled.div`
  margin-bottom: 2rem;
  background: ${({ theme }) => theme.card};
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 6px 18px ${({ theme }) => theme.widgetShadow};
  backdrop-filter: blur(12px);
`;

const Title = styled.h2`
  font-size: 1.4rem;
  margin-bottom: 1.5rem;
  color: ${({ theme }) => theme.text};
`;

const Item = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.25rem;
  border-radius: 14px;
  margin-bottom: 0.75rem;
  background: ${({ isIncome, isTransfer }) => {if (isTransfer) return "rgba(255, 255, 255, 0.2)"; 
    return isIncome ? "rgba(101, 204, 163, 0.1)" : "rgba(207, 96, 96, 0.25)"}};
  border-left: 5px solid ${({ isIncome, isTransfer}) => {if (isTransfer) return "#ffffff";      // bianco per trasferimenti
    return isIncome ? "#4caf93" : "#e57373"; // verde entrata / rosso uscita
  }};
  box-shadow: 0 3px 10px rgba(0,0,0,0.05);
  transition: transform 0.2s ease;
  &:hover {
    transform: scale(1.01);
  }
`;

const Column = styled.div`
  flex: 1;
  padding: 0 0.5rem;
  font-size: 0.9rem;
  color: ${({ theme }) => theme.text};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const Amount = styled(Column)`
  text-align: right;
  font-weight: bold;
  color: ${({ isIncome, isTransfer }) => {
  if (isTransfer) return "#ffffff";      // bianco per trasferimenti
  return isIncome ? "#4caf93" : "#e57373"; // verde entrata / rosso uscita
}};
`;

const RecentTransactions = () => {
  return (
    <Section>
      <Title>Ultime Transazioni</Title>
      {transactions.slice(0, 5).map((tx) => {
        const isIncome = tx.type === "entrata";
        const isTransfer = tx.type === "trasferimento";
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
    </Section>
  );
};

export default RecentTransactions;
