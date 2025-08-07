import React, { useState } from "react";
import styled from "styled-components";

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const Popup = styled.div`
  background: ${({ theme }) => theme.card};
  padding: 2rem;
  border-radius: 12px;
  width: 95%;
  max-width: 400px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 4px 20px ${({ theme }) => theme.tileShadow};
`;

const Modal = styled.div`
  background: ${({ theme }) => theme.card};
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 16px ${({ theme }) => theme.tileShadow};
  width: 100%;
  max-width: 400px;
`;

const Field = styled.div`
  margin-bottom: 1rem;
`;

const Label = styled.label`
  display: block;
  font-weight: 500;
  margin-bottom: 6px
  border-bottom: 3px solid ${({ color }) => color};
  padding-bottom: 4px;;
`;

const ColorInput = styled.input`
  width: 100%;
  height: 35px;
  border: none;
  background: ${({ theme }) => theme.background};
  padding: 11px;
  cursor: pointer;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px;
  border: 1px solid ${({ theme }) => theme.hoverBg};
  border-radius: 6px;
  background: ${({ theme }) => theme.background};
  color: ${({ theme }) => theme.text};
`;

const Button = styled.button`
  width: 100%;
  padding: 10px;
  background-color: ${({ theme }) => theme.primary};
  color: white;
  font-weight: 500;
  border: none;
  border-radius: 6px;
  cursor: pointer;

  &:hover {
    background-color: \${({ theme }) => theme.accent};
  }
`;

const ButtonRow = styled.div`
  margin-top: 2rem;
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
`;

const Error = styled.p`
  color: red;
  font-size: 0.85rem;
  margin-top: -8px;
  margin-bottom: 1rem;
`;

const NewAccountPopup = ({ onClose, onCreate, existingAccounts }) => {
  const [form, setForm] = useState({
    name: "",
    balance: "0",
    color: "#38bdf8", // blu predefinito
    id: crypto.randomUUID()
  });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setError("");
};

const handleSubmit = (e) => {
    e.preventDefault();
    const nameExists = existingAccounts?.some(
      (acc) => acc.name.trim().toLowerCase() === form.name.trim().toLowerCase()
    );
    if (nameExists) {
      setError("Esiste già un conto con questo nome.");
      return;
    }

    const newAcc = {
      ...form,
      balance: parseFloat(form.balance) || 0,
    };
    onCreate(newAcc);
    onClose();
};

  return (
    <Overlay onClick={onClose}>
      <Popup onClick={(e) => e.stopPropagation()}>
        <Modal>
          <h3>Nuovo conto</h3>
          <form onSubmit={handleSubmit}>
            <Field>
              <Label>Nome del conto</Label>
              <Input
                name="name"
                value={form.name}
                onChange={handleChange}
                required
              />
              {error && <Error>{error}</Error>}
            </Field>

            <Field>
              <Label>Saldo iniziale (€)</Label>
              <Input
                type="number"
                step="10"
                name="balance"
                value={form.balance}
                onChange={handleChange}
              />
            </Field>

            <Field>
            <Label>Colore (facoltativo)</Label>
              <ColorInput
                type="color"
                name="color"
                value={form.color}
                onChange={handleChange}
              />
            </Field>
            <ButtonRow>
              <Button type="submit">Crea conto</Button>
              <Button onClick={onClose}>Annulla</Button>
            </ButtonRow>
          </form>
        </Modal>
      </Popup>
    </Overlay>
  );
};

export default NewAccountPopup;