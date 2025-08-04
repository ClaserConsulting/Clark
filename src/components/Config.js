import React, { useState } from "react";
import styled from "styled-components";

const Section = styled.section`
  margin-bottom: 32px;
`;

const Input = styled.input`
  padding: 8px;
  border-radius: 4px;
  border: 1px solid ${({ theme }) => theme.hoverBg};
  width: 200px;
  margin-right: 12px;
`;

const Button = styled.button`
  padding: 8px 12px;
  background-color: ${({ theme }) => theme.accent};
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
  &:hover {
    opacity: 0.85;
  }
`;

const List = styled.ul`
  list-style: none;
  padding: 0;
  margin-top: 12px;
`;

const ListItem = styled.li`
  margin-bottom: 6px;
`;

export default function Config({ accounts, setAccounts, categories, setCategories, theme }) {
  const [newAccountName, setNewAccountName] = useState("");
  const [newCategoryName, setNewCategoryName] = useState("");

  function addAccount() {
    if (!newAccountName.trim()) return;
    setAccounts([...accounts, { id: Date.now().toString(), name: newAccountName.trim(), color: "#4caf50" }]);
    setNewAccountName("");
  }

  function addCategory() {
    if (!newCategoryName.trim()) return;
    setCategories([...categories, { id: Date.now().toString(), name: newCategoryName.trim() }]);
    setNewCategoryName("");
  }

  return (
    <>
      <h2>Configurazione</h2>
      <Section>
        <h3>Conti</h3>
        <Input
          type="text"
          value={newAccountName}
          onChange={(e) => setNewAccountName(e.target.value)}
          placeholder="Nuovo conto"
          aria-label="Nome nuovo conto"
        />
        <Button onClick={addAccount}>Aggiungi</Button>
        <List>
          {accounts.map((acc) => (
            <ListItem key={acc.id}>{acc.name}</ListItem>
          ))}
        </List>
      </Section>
      <Section>
        <h3>Categorie</h3>
        <Input
          type="text"
          value={newCategoryName}
          onChange={(e) => setNewCategoryName(e.target.value)}
          placeholder="Nuova categoria"
          aria-label="Nome nuova categoria"
        />
        <Button onClick={addCategory}>Aggiungi</Button>
        <List>
          {categories.map((cat) => (
            <ListItem key={cat.id}>{cat.name}</ListItem>
          ))}
        </List>
      </Section>
    </>
  );
}
