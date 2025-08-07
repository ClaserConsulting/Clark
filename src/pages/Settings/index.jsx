import React, { useState } from "react";

const Settings = ({ accounts, setAccounts, categories, setCategories, theme }) => {
  const [newAccount, setNewAccount] = useState("");
  const [newCategory, setNewCategory] = useState("");

  const handleAddAccount = () => {
    if (!newAccount.trim()) return;
    const newEntry = {
      id: Date.now().toString(),
      name: newAccount,
      color: "#007bff",
    };
    setAccounts((prev) => [...prev, newEntry]);
    setNewAccount("");
  };

  const handleAddCategory = () => {
    if (!newCategory.trim()) return;
    const newEntry = {
      id: Date.now().toString(),
      name: newCategory,
      color: "#4caf50",
    };
    setCategories((prev) => [...prev, newEntry]);
    setNewCategory("");
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h2 style={{ marginBottom: "1rem" }}>⚙️ Impostazioni</h2>

      <section style={{ marginBottom: "2rem" }}>
        <h3>Conti</h3>
        <ul>
          {accounts.map((acc) => (
            <li key={acc.id} style={{ padding: "4px 0" }}>
              <span style={{ color: acc.color }}>{acc.name}</span>
            </li>
          ))}
        </ul>
        <input
          value={newAccount}
          onChange={(e) => setNewAccount(e.target.value)}
          placeholder="Nuovo conto"
          style={{ marginRight: 8 }}
        />
        <button onClick={handleAddAccount}>Aggiungi conto</button>
      </section>

      <section>
        <h3>Categorie</h3>
        <ul>
          {categories.map((cat) => (
            <li key={cat.id} style={{ padding: "4px 0" }}>
              <span style={{ color: cat.color }}>{cat.name}</span>
            </li>
          ))}
        </ul>
        <input
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
          placeholder="Nuova categoria"
          style={{ marginRight: 8 }}
        />
        <button onClick={handleAddCategory}>Aggiungi categoria</button>
      </section>
    </div>
  );
};

export default Settings;
