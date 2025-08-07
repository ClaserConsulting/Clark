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
