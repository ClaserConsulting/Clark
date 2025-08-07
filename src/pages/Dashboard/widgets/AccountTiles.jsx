// 📁 src/pages/Dashboard/widgets/AccountTiles.jsx
import React from "react";
import styled from "styled-components";

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
`;

const TileLabel = styled.span`
  font-size: 0.9rem;
  color: ${({ theme }) => theme.text};
`;

const TileValue = styled.span`
  font-size: 1.2rem;
  font-weight: bold;
  color: ${({ theme }) => theme.text};
`;

const AccountTiles = ({ accounts, onClickAccount, onAdd }) => {
  const getSaldo = (account) => {
    return account.balance?.toFixed(2) || "0.00";
  };

  return (
    <TilesRow>
      {accounts.map((account) => (
        <Tile key={account.id} onClick={() => onClickAccount(account)}>
          <ColorBar color={account.color} />
          <TileContent>
            <TileLabel>{account.name}</TileLabel>
            <TileValue>{getSaldo(account)}€</TileValue>
          </TileContent>
        </Tile>
      ))}
      <AddTile onClick={onAdd}>＋</AddTile>
    </TilesRow>
  );
};

export default AccountTiles;
