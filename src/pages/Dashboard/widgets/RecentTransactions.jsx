// 📁 src/pages/Dashboard/widgets/RecentTransactions.jsx
import React from "react";
import styled from "styled-components";

const Section = styled.div`
  margin-bottom: 2rem;
  background: ${({ theme }) => theme.card};
  border-radius: 12px;
  padding: 1rem;
  box-shadow: 0 4px 12px ${({ theme }) => theme.widgetShadow};
`;

const Title = styled.h2`
  font-size: 1.2rem;
  margin-bottom: 1rem;
  color: ${({ theme }) => theme.text};
`;

const Item = styled.div`
  padding: 0.75rem 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-radius: 8px;
  margin-bottom: 0.5rem;
  background: ${({ theme }) => theme.card};
  box-shadow: 0 2px 8px ${({ theme }) => theme.tileShadow};
`;

const RecentTransactions = ({ transactions = [] }) => {
  return (
    <Section>
      <Title>Ultime Transazioni</Title>
      {transactions.slice(0, 5).map((tx) => (
        <Item key={tx.id}>
          <div>{tx.data}</div>
          <div>{tx.categoria}</div>
          <div>{tx.note}</div>
          <div>{tx.importo.toFixed(2)}€</div>
        </Item>
      ))}
    </Section>
  );
};

export default RecentTransactions;
