import React, { useEffect, useState } from 'react';

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [newCategoryName, setNewCategoryName] = useState('');

  // Carica le categorie dal backend
  useEffect(() => {
    fetch('http://localhost:3000/api/categories', {
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('token'), // metti il token vero qui!
      },
    })
      .then(res => res.json())
      .then(data => setCategories(data))
      .catch(err => console.error('Errore fetching categories:', err));
  }, []);

  // Funzione per creare una nuova categoria
  const handleCreateCategory = () => {
    fetch('http://localhost:3000/api/categories', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + localStorage.getItem('token'),
      },
      body: JSON.stringify({ name: newCategoryName, productIds: [], newProducts: [] }),
    })
      .then(res => res.json())
      .then(data => {
        alert('Categoria creata!');
        setCategories(prev => [...prev, data.category]); // aggiorna lista
        setNewCategoryName('');
      })
      .catch(err => console.error('Errore creando categoria:', err));
  };

  return (
    <div>
      <h2>Categorie</h2>
      <ul>
        {categories.map(cat => (
          <li key={cat.id}>{cat.name}</li>
        ))}
      </ul>

      <input
        type="text"
        placeholder="Nuova categoria"
        value={newCategoryName}
        onChange={e => setNewCategoryName(e.target.value)}
      />
      <button onClick={handleCreateCategory}>Crea Categoria</button>
    </div>
  );
}
