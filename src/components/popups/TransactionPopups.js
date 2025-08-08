import React from "react";
import styled from "styled-components";

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
`;

const Modal = styled.div`
  background: ${({ theme }) => theme.card};
  padding: 2rem;
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 4px 20px ${({ theme }) => theme.tileShadow};
`;

const Title = styled.h3`
  margin-top: 0;
  color: ${({ theme }) => theme.text};
`;

const Label = styled.label`
  display: block;
  margin-top: 1rem;
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

export function TransactionEditPopup({ transaction, onClose }) {
  if (!transaction) return null;
  return (
    <Overlay>
      <Modal>
        <Title>Modifica Transazione</Title>
        <Label>Data</Label>
        <Input type="date" defaultValue={transaction.date} />
        <Label>Categoria</Label>
        <Input type="text" defaultValue={transaction.categoryId} />
        <Label>Nota</Label>
        <Input type="text" defaultValue={transaction.note} />
        <Label>Importo</Label>
        <Input type="number" defaultValue={transaction.importo} />

        <ButtonRow>
          <Button onClick={onClose}>Annulla</Button>
          <Button>Salva</Button>
        </ButtonRow>
      </Modal>
    </Overlay>
  );
}

export function ConfirmDeletePopup({ transaction, onClose, onConfirm }) {
  if (!transaction) return null;
  return (
    <Overlay>
      <Modal>
        <Title>Conferma eliminazione</Title>
        <p>Sei sicuro di voler eliminare la transazione del {transaction.date}?</p>
        <ButtonRow>
          <Button onClick={onClose}>Annulla</Button>
          <Button danger onClick={onConfirm}>Elimina</Button>
        </ButtonRow>
      </Modal>
    </Overlay>
  );
}
