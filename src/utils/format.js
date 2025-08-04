export function formatDate(date) {
  if (!date) return "";
  const d = new Date(date);
  return d.toLocaleDateString("it-IT", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function formatCurrency(amount, currency = "EUR") {
  return amount.toLocaleString("it-IT", {
    style: "currency",
    currency,
  });
}
