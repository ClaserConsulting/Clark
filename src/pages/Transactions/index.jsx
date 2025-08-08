// 📁 src/pages/Transactions/index.jsx
import React, { useMemo } from "react";
import {Amount, Column, Container, Item, Page, Section, Title} from "../Dashboard/styled"

const TransactionsPage = ({transactions = [] }) => {
  const sorted = useMemo(
    () => [...transactions].sort((a, b) => new Date(b.date) - new Date(a.date)),
    [transactions]
  );

  return (
      <Page>
        <Container>
          <Title>Tutte le Transazioni</Title>
          <Section>
            {sorted.map((tx) => {
              const isIncome = tx.type === "Entrata";
              const isTransfer = tx.type === "Trasferimento";
              return (
                <Item key={tx.id} isIncome={isIncome} isTransfer={isTransfer}>
                  <Column>{tx.date}</Column>
                  <Column>{tx.categoryName}</Column>
                  <Column>{tx.subcategory}</Column>
                  <Column>{tx.comment || "-"}</Column>
                  <Column>{tx.accountId || "-"}</Column>
                  <Column>{tx.accountTo || tx.beneficiary}</Column>
                  <Amount isIncome={isIncome} isTransfer={isTransfer}>{tx.importo.toFixed(2)}€</Amount>
                </Item>
              );
            })}
          </Section>
        </Container>
      </Page>
  );
};

export default TransactionsPage;
