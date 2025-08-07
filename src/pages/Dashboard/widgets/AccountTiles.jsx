// 📁 src/pages/Dashboard/widgets/AccountTiles.jsx
import React, { useState } from "react";
import styled from "styled-components";
import { FiEye, FiEyeOff } from "react-icons/fi";

const ToggleAll = styled.button`
  align-self: flex-end;
  margin-bottom: 0.5rem;
  background: none;
  border: none;
  color: ${({ theme }) => theme.textSoft || "#aaa"};
  cursor: pointer;
  font-size: 0.85rem;
  transition: color 0.2s ease;
  &:hover {
    color: ${({ theme }) => theme.text};
  }
`;

const TilesRow = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  overflow-x: auto;
`;

const Tile = styled.div`
  min-width: 160px;
  display: flex;
  align-items: center;
  background: ${({ theme }) => theme.card};
  box-shadow: 0 4px 12px ${({ theme }) => theme.tileShadow};
  border-radius: 12px;
  padding: 1rem;
  position: relative;
  cursor: pointer;
  transition: transform 0.2s ease;
  &:hover {
    transform: scale(1.02);
    background: ${({ theme }) => theme.cardHover || "rgba(255, 255, 255, 0.05)"};
  }
  &:hover .eye-icon {
    opacity: 1;
  }
`;

const AddTile = styled(Tile)`
  justify-content: center;
  font-size: 2rem;
  font-weight: bold;
  color: ${({ theme }) => theme.primary};
`;

const ColorBar = styled.div`
  width: 6px;
  height: 100%;
  border-radius: 6px 0 0 6px;
  margin-right: 1rem;
  background-color: ${(props) => props.color || "#ccc"};
`;

const TileContent = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
`;

const TileLabel = styled.span`
  font-size: 0.9rem;
  color: ${({ theme }) => theme.text};
`;

const TileValue = styled.span`
  font-size: 1.2rem;
  font-weight: bold;
  color: ${({ theme }) => theme.text};
  transition: opacity 0.3s ease;
  opacity: ${(props) => (props.visible ? 1 : 0.4)};
`;

const EyeIcon = styled.div`
  position: absolute;
  top: 8px;
  right: 8px;
  opacity: 0;
  transition: opacity 0.2s ease;
  z-index: 1;
  color: ${({ theme }) => theme.textSoft || "#aaa"};
`;


const AccountTiles = ({ accounts, onClickAccount, onAdd }) => {
  const [allHidden, setAllHidden] = useState(false);

  const toggleAll = () => {
    const updated = {};
    accounts.forEach(acc => {
      updated[acc.id] = !allHidden;
    });
    setHiddenAccounts(updated);
    setAllHidden(!allHidden);
  };

  const [hiddenAccounts, setHiddenAccounts] = useState({});

  const toggleVisibility = (accountId, e) => {
    e.stopPropagation(); // evita che scatti anche onClickAccount
    setHiddenAccounts((prev) => ({
      ...prev,
      [accountId]: !prev[accountId],
    }));
  };

  const getSaldo = (account) => {
    if (hiddenAccounts[account.id]) return "***€";
    return account.balance?.toFixed(2) + "€" || "0.00€";
  };

  return (
    <>
      <ToggleAll onClick={toggleAll}>
        {allHidden ? "Mostra tutti i saldi" : "Nascondi tutti i saldi"}
      </ToggleAll>
      <TilesRow>
        {accounts.map((account) => (
          <Tile key={account.id} onClick={() => onClickAccount(account)}>
            <ColorBar color={account.color} />
            <TileContent>
              <TileLabel>{account.name}</TileLabel>
              <TileValue visible={!hiddenAccounts[account.id]}>
                {getSaldo(account)}
              </TileValue>
            </TileContent>
            <EyeIcon
              className="eye-icon"
              onClick={(e) => toggleVisibility(account.id, e)}
            >
              {hiddenAccounts[account.id] ? <FiEyeOff /> : <FiEye />}
            </EyeIcon>
          </Tile>
        ))}
        <AddTile onClick={onAdd}>＋</AddTile>
      </TilesRow>
    </>
  );
};

export default AccountTiles;
