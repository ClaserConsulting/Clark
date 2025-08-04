const categories = [
  {
    id: "c1",
    name: "Alimentari",
    icon: "shopping-cart",
    color: "#FF7043",
    subcategories: [
      { name: "Supermercato", icon: "shopping-bag" },
      { name: "Frutta e verdura", icon: "leaf" },
      { name: "Pane e pasticceria", icon: "bread-slice" }
    ]
  },
  {
    id: "c2",
    name: "Trasporti",
    icon: "car",
    color: "#42A5F5",
    subcategories: [
      { name: "Carburante", icon: "fuel" },
      { name: "Mezzi pubblici", icon: "bus" },
      { name: "Taxi", icon: "taxi" }
    ]
  },
  {
    id: "c3",
    name: "Casa",
    icon: "home",
    color: "#66BB6A",
    subcategories: [
      { name: "Affitto", icon: "building" },
      { name: "Bollette", icon: "zap" },
      { name: "Manutenzione", icon: "tool" }
    ]
  },
  {
    id: "c4",
    name: "Salute",
    icon: "heart-pulse",
    color: "#AB47BC",
    subcategories: [
      { name: "Farmacia", icon: "medkit" },
      { name: "Visite mediche", icon: "stethoscope" },
      { name: "Assicurazione sanitaria", icon: "shield" }
    ]
  }
];

export default categories;
