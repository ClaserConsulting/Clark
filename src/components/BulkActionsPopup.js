import React from "react";
import styled from "styled-components";

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
`;

const Modal = styled.div`
  background: ${({ theme }) => theme.card};
  border-radius: 12px;
  padding: 2rem;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 4px 16px ${({ theme }) => theme.tileShadow};
`;

export default function BulkActionsPopup({ onClose }) {
  return (
    <Overlay onClick={onClose}>
      <Modal onClick={(e) => e.stopPropagation()}>
        <h2>Azioni in blocco</h2>
        {/* TODO: Aggiungi filtri per data, categoria, nota */}
        {/* E azioni su selezionati: modifica / elimina */}
        <button onClick={onClose}>Chiudi</button>
      </Modal>
    </Overlay>
  );
}
