import dayjs from "dayjs";
import "dayjs/locale/it";
dayjs.locale("it");

export function formatDate(dateString) {
  if (!dateString) return "";
  return dayjs(dateString).format("dddd DD/MM/YYYY HH:mm");
}

export function formatCurrency(amount) {
  const value = Number(amount || 0);
  return value.toLocaleString("it-IT", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
  });
}

export function formatCategoryName(name) {
  if (!name) return "";
  return name[0].toUpperCase() + name.slice(1).toLowerCase();
}

// analysis values for Spending Panel

const ANALYSIS_VALUE = {
  category: (v, { categories = [] } = {}) =>
    categories.find(c => c.id === v || (c.name && c.name.toLowerCase() === String(v).toLowerCase()))?.name
    ?? String(v),

  beneficiary: (v) => String(v || "—"),
  tag: (v) => `#${String(v)}`,
  account: (v, { accounts = [] } = {}) =>
    accounts.find(a => a.id === v || (a.name && a.name.toLowerCase() === String(v).toLowerCase()))?.name
    ?? String(v),

  subcategory: (v) => String(v || "—"),
  default: (v) => String(v || "—"),
};

const DIMENSION_LABEL = {
  category: "Categoria",
  beneficiary: "Beneficiario",
  tag: "Tag",
  account: "Conto",
  subcategory: "Subcategoria",
};

const evalMath = (s) => {
  if (!/^[0-9+\-*/().,\s]+$/.test(s)) return NaN;
  const cleaned = String(s).replace(",", ".");
  try { return Function(`"use strict";return (${cleaned})`)(); } catch { return NaN; }
};

export function formatAnalysisTitle(analysis, ctx = {}) {
  const { defaultTitle = "Analisi entrate/uscite" } = ctx;
  if (!analysis) return defaultTitle;

  const { dimension, value } = analysis || {};
  const labelDim = DIMENSION_LABEL[dimension] ?? dimension ?? "";
  const resolver = ANALYSIS_VALUE[dimension] ?? ANALYSIS_VALUE.default;
  const valueTxt = resolver(value, ctx);

  return `Analisi ${labelDim.toLowerCase()}: ${valueTxt}`;
}
