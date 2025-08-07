import React, { useState } from "react";
import styled from "styled-components";

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 9999;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const Modal = styled.div`
  background: ${({ theme }) => theme.card};
  padding: 2rem;
  border-radius: 12px;
  width: 95%;
  max-width: 400px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 4px 20px ${({ theme }) => theme.tileShadow};
`;

const Title = styled.h2`
  margin-top: 0;
  color: ${({ theme }) => theme.text};
`;

const Label = styled.label`
  display: block;
  margin: 1rem 0 0.25rem;
  color: ${({ theme }) => theme.text};
`;

const Input = styled.input`
  width: 100%;
  padding: 0.5rem;
  border-radius: 6px;
  border: 1px solid #ccc;
  background: ${({ theme }) => theme.input};
  color: ${({ theme }) => theme.text};
`;

const TransactionsList = styled.ul`
  margin-top: 1.5rem;
  padding: 0;
  list-style: none;
`;

const TransactionItem = styled.li`
  display: flex;
  justify-content: space-between;
  padding: 0.5rem;
  background: ${({ theme }) => theme.background};
  border-radius: 6px;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
  color: ${({ theme }) => theme.text};
  transition: background 0.2s;

  &:hover {
    background: ${({ theme }) => theme.card};
  }
`;

const ButtonRow = styled.div`
  margin-top: 2rem;
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
`;

const Button = styled.button`
  padding: 0.5rem 1rem;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  background-color: ${({ theme, danger }) =>
    danger ? theme.danger : theme.primary};
  color: white;
`;

const ColorInput = styled.input`
  width: 100%;
  height: 35px;
  border: none;
  background: ${({ theme }) => theme.background};
  padding: 11px;
  cursor: pointer;
`;

export function AccountDetailsPopup({ account, onClose, onSave }) {
    
  const [name, setName] = useState(account.name);
  const [saldo, setSaldo] = useState(account.saldo);
  const [color, setColor] = useState(account.color);
  
  if (!account) return null;

  const handleSave = () => {
    const updatedAccount = {
      ...account,
      name,
      saldo: parseFloat(saldo),
      color,
    };
    onSave(updatedAccount);
    onClose();
  };

  return (
    <Overlay>
      <Modal>
        <Title>Dettagli Conto</Title>

        <Label>Nome</Label>
        <Input value={name} onChange={(e) => setName(e.target.value)} />

        <Label>Saldo</Label>
        <Input
          type="number"
          step="10"
          value={saldo}
          onChange={(e) => setSaldo(e.target.value)}
        />

        <Label>Colore</Label>

        <ColorInput
          type="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
        />

        <ButtonRow>
          <Button onClick={onClose}>Annulla</Button>
          <Button onClick={handleSave}>Salva modifiche</Button>
        </ButtonRow>
      </Modal>
    </Overlay>
  );
}
