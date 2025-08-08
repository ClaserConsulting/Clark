# Clark — Personal Finance Organizer 🐙

Clark è un'app elegante e potente per organizzare le tue finanze in modo intelligente e rilassato. Con un'interfaccia moderna, personalizzazione completa e un polpo fidato al tuo fianco, non dovrai più preoccuparti del caos contabile.

---

## ✨ Funzionalità principali

- 🧩 **Dashboard interattiva** con widget modulari
- 👁️‍🗨️ **Gestione account** con visibilità toggle (occhietto + asterischi)
- 💳 **Visualizzazione e filtro transazioni**
- 🧠 **Temi dark/light** con salvataggio in `localStorage`
- 🌍 **Supporto multilingua** (IT, EN, DE, FR) via i18next
- 📱 **Responsive design** per desktop e mobile
- 🔐 **Routing protetto + login personalizzato**
- 🔮 **Animazioni fluide + layout persistente con Sidebar & Topbar**
- 🧪 **Componenti modulari** (Popups, Tiles, Charts)
- 🎯 **Preparazione per gamification e sincronizzazione PSD2**

---

## 🚀 Installazione

```bash
git clone https://github.com/ClaserConsulting/Clark.git
cd Clark
npm install
npm start
```

L'app sarà disponibile su `http://localhost:3000`

---

## 📁 Struttura del progetto

```
src/
│
├── components/         // Navbar, Sidebar, Logo, Popups...
├── pages/              // Dashboard, Login, Settings, Profile
├── data/               // Dummy data: accounts, transactions
├── utils/              // Themes, i18n config
├── routes/             // Routing protetto (PrivateRoute, AppRouter)
├── layout/             // AppLayout con struttura a L
└── assets/             // Icone, immagini, video
```

---

## 🧪 Comandi utili

```bash
npm run build        # build produzione
npm run lint         # verifica stile
npm run format       # (prettier) formatta il codice
```

---

## 🧱 Stack Tecnologico

- React 18, Styled-Components
- React Router DOM
- i18next + browser-language-detector
- Chart.js, ESLint, Prettier
- Vite/Webpack (a seconda del setup)
- GitHub + Git flow

---

## 🛣️ Roadmap futura

- [ ] Integrazione API backend
- [ ] Salvataggio transazioni in database
- [ ] Login OAuth2 + gestione utenti reali
- [ ] Sincronizzazione bancaria (PSD2)
- [ ] Funzionalità pro e gamification
- [ ] App mobile / PWA
- [ ] Video marketing animato (in lavorazione)

---

## 👨‍💻 Autore

Claudio Salvatore
Contatti → [LinkedIn] | [Email]

---

## ⚖️ Licenza

MIT License — Feel free to fork, build, remix (citando il progetto)

---

> “Clark – 8 tentacoli. 0 stress.” 🐙
