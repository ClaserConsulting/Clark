import React, { useState } from "react";
import { Page } from "./styled";
import AccountTiles from "./widgets/AccountTiles";
import RecentTransactions from "./widgets/RecentTransactions";

const Dashboard = ({ accounts, transactions, filteredTransactions }) => {
  const [selectedAccount, setSelectedAccount] = useState(null);

  const handleClickAccount = (account) => {
    setSelectedAccount(account);
    // In futuro potrai filtrare transazioni in base all'account
  };

  const handleAddAccount = () => {
    alert("Apertura popup nuovo conto");
  };

  return (
    <Page>
      <AccountTiles accounts={accounts} onClickAccount={handleClickAccount} onAdd={handleAddAccount} />
      <RecentTransactions transactions={filteredTransactions} />
    </Page>
  );
};

export default Dashboard;
