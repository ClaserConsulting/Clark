const transactions = [
  {
    id: "t1",
    date: "Tuesday 01/05/2025 08:51",
    categoryId: "c1",
    categoryName: "Alimentari",
    subcategory: "Frutta e verdura",
    tag: ["spesa", "tempo-libero"],
    accountId: "Carta di credito",
    accountTo: null,
    beneficiary: "IKEA",
    comment: "Auto-generata per test (uscita)",
    typeId: "ty2",
    type: "Uscita",
    importo: -470.63,
    // Allegati: presenti
    attachmentsStr: "Scontrino_0105.pdf|Foto_busta_spesa.jpg",
    // Posizione: Roma Termini (esempio)
    location: {
      lat: 41.901042,
      lon: 12.500838,
      display_name: "Roma Termini, Roma, Lazio, Italia",
      place_id: "IT-ROMA-TERM-001"
    }
  },
  {
    id: "t2",
    date: "Friday 19/02/2025 03:36",
    categoryId: "c1",
    categoryName: "Alimentari",
    subcategory: "Supermercato",
    tag: ["tempo-libero", "investimento", "famiglia"],
    accountId: "Contanti",
    accountTo: null,
    beneficiary: "Università",
    comment: "Auto-generata per test (entrata)",
    typeId: "ty1",
    type: "Entrata",
    importo: 448.1,
    // Allegati: nessuno
    attachmentsStr: "",
    // Posizione: Milano Duomo (solo nazione/città già sufficiente)
    location: {
      lat: 45.464211,
      lon: 9.191383,
      display_name: "Duomo, Milano, Lombardia, Italia",
      place_id: "IT-MI-DUOMO-002"
    }
  },
  {
    id: "t3",
    date: "Thursday 19/06/2025 19:36",
    categoryId: "c4",
    categoryName: "Salute",
    subcategory: "Farmacia",
    tag: ["studio", "urgente"],
    accountId: "Carta di credito",
    accountTo: "Conto corrente",
    beneficiary: "IKEA",
    comment: "Auto-generata per test (trasferimento)",
    typeId: "ty3",
    type: "Trasferimento",
    importo: 67.79,
    // Allegati: presenti
    attachmentsStr: "Ricevuta_farmacia.pdf",
    // Posizione: Napoli, Piazza del Plebiscito
    location: {
      lat: 40.835884,
      lon: 14.248767,
      display_name: "Piazza del Plebiscito, Napoli, Campania, Italia",
      place_id: "IT-NA-PLEB-003"
    }
  },
  {
    id: "t4",
    date: "Tuesday 02/04/2025 08:51",
    categoryId: "c1",
    categoryName: "Alimentari",
    subcategory: "Minimarket",
    tag: ["spesa", "tempo-libero"],
    accountId: "Contanti",
    accountTo: null,
    beneficiary: "IKEA",
    comment: "Auto-generata per test (uscita)",
    typeId: "ty2",
    type: "Uscita",
    importo: -47.63,
    // Allegati: nessuno
    attachmentsStr: " ",
    // Posizione: Firenze, Ponte Vecchio
    location: {
      lat: 43.767792,
      lon: 11.253122,
      display_name: "Ponte Vecchio, Firenze, Toscana, Italia",
      place_id: "IT-FI-PV-004"
    }
  },
  {
    id: "t5",
    date: "Friday 19/07/2025 03:36",
    categoryId: "c1",
    categoryName: "Alimentari",
    subcategory: "Bottega",
    tag: ["tempo-libero", "investimento", "famiglia"],
    accountId: "Contanti",
    accountTo: null,
    beneficiary: "Università",
    comment: "Auto-generata per test (entrata)",
    typeId: "ty1",
    type: "Entrata",
    importo: 44.1,
    // Allegati: presenti multipli
    attachmentsStr: "Contratto_borsa.pdf|Documento_identita.pdf",
    // Posizione: Torino, Mole Antonelliana
    location: {
      lat: 45.0687,
      lon: 7.6931,
      display_name: "Mole Antonelliana, Torino, Piemonte, Italia",
      place_id: "IT-TO-MOLE-005"
    }
  },
  {
    id: "t6",
    date: "Thursday 25/03/2025 19:36",
    categoryId: "c4",
    categoryName: "Salute",
    subcategory: "Medico",
    tag: ["studio", "urgente"],
    accountId: "Carta di credito",
    accountTo: "Conto corrente",
    beneficiary: "Sole365",
    comment: "Auto-generata per test (trasferimento)",
    typeId: "ty3",
    type: "Trasferimento",
    importo: 6.79,
    // Allegati: nessuno
    attachmentsStr: "",
    // Posizione: Venezia, Piazza San Marco
    location: {
      lat: 45.434,
      lon: 12.338,
      display_name: "Piazza San Marco, Venezia, Veneto, Italia",
      place_id: "IT-VE-SMARCO-006"
    }
  }
];

export default transactions;
