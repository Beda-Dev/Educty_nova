import React from 'react';
import type { PaymentFormData, Pricing, Setting, Installment } from '@/lib/interface';

interface TableauPaiementProps {
  payments: PaymentFormData[];
  availablePricing: Pricing[];
  paidAmount: number;
  settings: Setting[];
  discount_amount?: string | null;
  discount_percentage?: string | null;
  pricing_id?: number | null;

}

// Calcule le montant payé pour un type de frais (fee_type_id)
function getPaidForFeeType(payments: PaymentFormData[] = [], pricing: Pricing): number {
  if (!pricing || !Array.isArray(pricing.installments) || pricing.installments.length === 0) {
    // Pas d'échéancier, on suppose paiement direct sur le pricing
    // Mais PaymentFormData n'a pas de pricing_id, donc on ne peut pas lier sans installments
    return 0;
  }
  const installmentIds = pricing.installments.map(inst => String(inst.id));
  return (payments || [])
    .filter(p => p && p.installment_id && installmentIds.includes(String(p.installment_id)))
    .reduce((sum, p) => sum + (typeof p.amount === 'number' ? p.amount : 0), 0);
}

export const TableauPaiement: React.FC<TableauPaiementProps> = ({ 
  payments = [], 
  availablePricing = [], 
  paidAmount = 0, 
  settings = [],
  discount_amount = null,
  discount_percentage = null,
  pricing_id = null
}) => {
  const currency = (settings && settings[0]?.currency) || 'FCFA';
  const discountAmount = discount_amount ? Number(discount_amount) : 0;
  const discountPercentage = discount_percentage ? Number(discount_percentage) : 0;

  // Vérification des données d'entrée
  if (!Array.isArray(availablePricing) || availablePricing.length === 0) {
    return <div style={{ fontSize: '0.85rem', color: '#888' }}>Aucun type de frais disponible.</div>;
  }
  if (!Array.isArray(payments)) {
    return <div style={{ fontSize: '0.85rem', color: '#888' }}>Aucun paiement trouvé.</div>;
  }

  // Pour chaque type de frais, calculer le montant payé et le reste à payer
  const rows = availablePricing.map(pricing => {
    let total = Number(pricing.amount) || 0;
    let reduction = 0;
    
    // Appliquer la réduction si ce pricing est concerné et qu'une réduction est spécifiée
    if (Number(pricing_id) === Number(pricing.id) && (discountPercentage > 0 || discountAmount > 0)) {
      if (discountPercentage > 0) {
        reduction = total * (discountPercentage / 100);
      } else if (discountAmount > 0) {
        reduction = Math.min(discountAmount, total); // Ne pas dépasser le montant total
      }
      total = Math.max(0, total - reduction);
    }
    
    const paid = getPaidForFeeType(payments, pricing);
    const reste = total - paid;
    
    return {
      label: pricing.fee_type?.label || pricing.label,
      totalOriginal: Number(pricing.amount) || 0,
      total,
      paid,
      reste,
      reduction,
      hasReduction: reduction > 0
    };
  });

  // Calcul global
  const totalOriginalGlobal = rows.reduce((sum, row) => sum + row.totalOriginal, 0);
  const totalReductionGlobal = rows.reduce((sum, row) => sum + row.reduction, 0);
  const totalGlobal = rows.reduce((sum, row) => sum + row.total, 0);
  const resteGlobal = totalGlobal - paidAmount;
  const hasPayment = rows.some(row => row.paid > 0);
  const hasReduction = totalReductionGlobal > 0;

  return (
    <div className="overflow-x-auto">
      <table className="min-w-[320px] w-full border-collapse text-sm">
        <thead>
          <tr>
            <th className="border px-2 py-1 text-left font-medium">Type de frais</th>
            <th className="border px-2 py-1 text-right font-medium">Montant initial</th>
            {hasReduction && <th className="border px-2 py-1 text-right font-medium">Rémise</th>}
            <th className="border px-2 py-1 text-right font-medium">Montant à payer</th>
            <th className="border px-2 py-1 text-right font-medium">Montant payé</th>
            <th className="border px-2 py-1 text-right font-medium">Reste à payer</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 || !hasPayment ? (
            <tr>
              <td colSpan={hasReduction ? 5 : 4} className="border px-3 py-2 text-center text-muted-foreground">
                Aucun paiement enregistré.
              </td>
            </tr>
          ) : (
            rows.map((row, i) => (
              <tr key={i}>
                <td className="border px-2 py-1 whitespace-nowrap">{row.label}</td>
                <td className="border px-2 py-1 text-right">
                  {row.totalOriginal.toLocaleString()} {currency}
                </td>
                {hasReduction && (
                  <td className="border px-2 py-1 text-right text-red-600 font-semibold">
                    {row.reduction > 0 ? `-${row.reduction.toLocaleString()} ${currency}` : '-'}
                  </td>
                )}
                <td className="border px-2 py-1 text-right font-semibold">
                  {row.total.toLocaleString()} {currency}
                </td>
                <td className="border px-2 py-1 text-right">
                  {row.paid.toLocaleString()} {currency}
                </td>
                <td
                  className={`border px-2 py-1 text-right font-semibold ${
                    row.reste > 0 ? "text-red-600 font-medium" : "text-green-700 font-semibold"
                  }`}
                >
                  {row.reste.toLocaleString()} {currency}
                </td>
              </tr>
            ))
          )}
        </tbody>
        <tfoot>
          <tr>
            <td className="border px-2 py-1 text-right font-semibold">Total :</td>
            <td className="border px-2 py-1 text-right font-semibold">
              {totalOriginalGlobal.toLocaleString()} {currency}
            </td>
            {hasReduction && (
              <td className="border px-2 py-1 text-right font-semibold text-red-600">
                -{totalReductionGlobal.toLocaleString()} {currency}
              </td>
            )}
            <td className="border px-2 py-1 text-right font-semibold">
              {totalGlobal.toLocaleString()} {currency}
            </td>
            <td className="border px-2 py-1 text-right font-semibold">
              {paidAmount.toLocaleString()} {currency}
            </td>
            <td
              className={`border px-2 py-1 text-right font-semibold ${
                resteGlobal > 0 ? "text-red-600" : "text-green-700"
              }`}
            >
              {resteGlobal.toLocaleString()} {currency}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
};