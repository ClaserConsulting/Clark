import React, { useState } from "react";
import styled from "styled-components";
import { Plus, Trash2, ChevronDown, ChevronUp } from "lucide-react";

const ScrollWrapper = styled.div`
  display: flex;
  gap: 1rem;
  overflow-x: auto;
  padding: 1rem 0;
  scrollbar-width: thin;

  &::-webkit-scrollbar {
    height: 6px;
  }

  &::-webkit-scrollbar-thumb {
    background-color: ${({ theme }) => theme.accent};
    border-radius: 4px;
  }
`;

const RowContainer = styled.div`
  position: relative;
`;

const ExpandBar = styled.div`
  width: 100%;
  text-align: center;
  padding: 0.5rem 0;
  cursor: pointer;
  opacity: 0.6;
  font-size: 0.8rem;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.3rem;
  color: ${({ theme }) => theme.text};
`;

const AccountCard = styled.div`
  min-width: 160px;
  background: ${({ theme }) => theme.card};
  color: ${({ theme }) => theme.text};
  padding: 1rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px ${({ theme }) => theme.tileShadow};
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  position: relative;
`;

const ColorCircle = styled.div`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: ${({ color }) => color || "#ccc"};
  margin-bottom: 0.5rem;
`;

const AddCard = styled(AccountCard)`
  cursor: pointer;
  justify-content: center;
  align-items: center;
  color: ${({ theme }) => theme.accent};
  border: 2px dashed ${({ theme }) => theme.accent};
`;

const TrashIcon = styled(Trash2)`
  position: absolute;
  top: 8px;
  right: 8px;
  cursor: pointer;
  stroke: red;
  width: 18px;
  height: 18px;
`;

const AccountRow = ({ accounts, onAddAccount, onDeleteAccount }) => {
  const [expanded, setExpanded] = useState(false);
  const visibleAccounts = expanded ? accounts : accounts.slice(0, 5);

  const confirmDelete = (id) => {
    const confirm = window.confirm("Sei sicuro di voler eliminare questo conto?");
    if (confirm) {
      onDeleteAccount(id);
    }
  };

  return (
    <RowContainer>
      <ScrollWrapper>
        {visibleAccounts.map((acc, idx) => (
          <AccountCard key={idx}>
            <TrashIcon onClick={() => confirmDelete(acc.id)} />
            <ColorCircle color={acc.color} />
            <strong>{acc.name}</strong>
            <span>{(acc.balance ?? 0).toFixed(2)} €</span>
          </AccountCard>
        ))}
        <AddCard onClick={onAddAccount}>
          <Plus size={24} />
        </AddCard>
      </ScrollWrapper>

      {accounts.length > 5 && (
        <ExpandBar onClick={() => setExpanded((e) => !e)}>
          {expanded ? (
            <>
              Nascondi <ChevronUp size={16} />
            </>
          ) : (
            <>
              Mostra tutti <ChevronDown size={16} />
            </>
          )}
        </ExpandBar>
      )}
    </RowContainer>
  );
};

export default AccountRow;
