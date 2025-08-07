// 📁 src/pages/Dashboard/index.jsx
import React, { useState } from "react";
import { Page, Container, WidgetTitle, Section } from "./styled";
import AccountTiles from "./widgets/AccountTiles";
import { AccountDetailsPopup } from "../../components/popups/AccountDetailsPopup";
import NewAccountPopup from "../../components/popups/NewAccountPopup";
import RecentTransactions from "./widgets/RecentTransactions";
import SpendingChart from "./widgets/SpendingChart"; // opzionale

const Dashboard = ({ accounts, transactions, filteredTransactions }) => {
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [showNewPopup, setShowNewPopup] = useState(false);

const handleClickAccount = (account) => setSelectedAccount(account);
const handleAddAccount = () => setShowNewPopup(true);
const closePopups = () => {
  setSelectedAccount(null);
  setShowNewPopup(false);
};

return (
  <Page>
    <Container>
      <AccountTiles
        accounts={accounts || []}
        onClickAccount={handleClickAccount}
        onAdd={handleAddAccount}
      />

      <Section>
        <WidgetTitle>Transazioni recenti</WidgetTitle>
        <RecentTransactions transactions={filteredTransactions} />
      </Section>

      <Section>
        <WidgetTitle>Spese per categoria</WidgetTitle>
        <SpendingChart transactions={transactions} />
      </Section>
    </Container>

    {/* POPUPs */}
    {selectedAccount && (
      <AccountDetailsPopup account={selectedAccount} onClose={closePopups} />
    )}

    {showNewPopup && (
      <NewAccountPopup
        onClose={closePopups}
        onCreate={(newAccount) => {
          // TODO: logica per aggiunta account
          closePopups();
        }}
      />
    )}
  </Page>
);

};

export default Dashboard;
