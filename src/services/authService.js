// file: src/services/authService.js

const USER_KEY = "gs_user";
const TOKEN_KEY = "gs_token";

// Finto database utenti (per test)
const USERS = [
  { id: 1, username: "claudio", password: "1234", name: "Claudio", role: "admin" },
  { id: 2, username: "ospite", password: "0000", name: "Ospite", role: "user" },
];

// Simula login → salva token e utente in localStorage
export function login(username, password) {
  const user = USERS.find((u) => u.username === username && u.password === password);
  if (!user) return null;

  const token = "mocked-token-" + Date.now();

  localStorage.setItem(USER_KEY, JSON.stringify(user));
  localStorage.setItem(TOKEN_KEY, token);

  return { user, token };
}

// Verifica se c'è un utente loggato
export function isAuthenticated() {
  return Boolean(localStorage.getItem(TOKEN_KEY));
}

// Restituisce l’utente attualmente loggato
export function getCurrentUser() {
  const data = localStorage.getItem(USER_KEY);
  return data ? JSON.parse(data) : null;
}

// Logout → rimuove dati da localStorage
export function logout() {
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(TOKEN_KEY);
}
