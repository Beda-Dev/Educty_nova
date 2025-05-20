export function formatCurrency(amount: number) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "XOF", // XOF = Franc CFA BCEAO (Afrique de l'Ouest)
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}
