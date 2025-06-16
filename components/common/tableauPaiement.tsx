import React from 'react';
import type { PaymentFormData, Pricing, Setting, Installment } from '@/lib/interface';

interface TableauPaiementProps {
  payments: PaymentFormData[];
  availablePricing: Pricing[];
  paidAmount: number;
  settings: Setting[];
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

export const TableauPaiement: React.FC<TableauPaiementProps> = ({ payments = [], availablePricing = [], paidAmount = 0, settings = [] }) => {
  const currency = (settings && settings[0]?.currency) || 'FCFA';

  // Vérification des données d'entrée
  if (!Array.isArray(availablePricing) || availablePricing.length === 0) {
    return <div style={{ fontSize: '0.85rem', color: '#888' }}>Aucun type de frais disponible.</div>;
  }
  if (!Array.isArray(payments)) {
    return <div style={{ fontSize: '0.85rem', color: '#888' }}>Aucun paiement trouvé.</div>;
  }

  // Pour chaque type de frais, calculer le montant payé et le reste à payer
  const rows = availablePricing.map(pricing => {
    const total = Number(pricing.amount) || 0;
    const paid = getPaidForFeeType(payments, pricing);
    const reste = total - paid;
    return {
      label: pricing.fee_type?.label || pricing.label,
      total,
      paid,
      reste,
    };
  });

  // Calcul global
  const totalGlobal = rows.reduce((sum, row) => sum + row.total, 0);
  const resteGlobal = totalGlobal - paidAmount;
  const hasPayment = rows.some(row => row.paid > 0);

  return (
    <div style={{ overflowX: 'auto' }}>
      <table
        style={{ minWidth: 320, borderCollapse: 'collapse', fontSize: '0.85rem', width: '100%' }}
        aria-label="Tableau récapitulatif des paiements"
      >
        <caption style={{ position: 'absolute', left: '-9999px', height: 1, width: 1, overflow: 'hidden' }}>
          Récapitulatif des paiements par type de frais
        </caption>
        <thead>
          <tr>
            <th scope="col" style={{ border: '1px solid #ddd', padding: '4px', fontWeight: 500, textAlign: 'left' }}>Type de frais</th>
            <th scope="col" style={{ border: '1px solid #ddd', padding: '4px', fontWeight: 500, textAlign: 'right' }}>Montant total</th>
            <th scope="col" style={{ border: '1px solid #ddd', padding: '4px', fontWeight: 500, textAlign: 'right' }}>Montant payé</th>
            <th scope="col" style={{ border: '1px solid #ddd', padding: '4px', fontWeight: 500, textAlign: 'right' }}>Reste à payer</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 || !hasPayment ? (
            <tr>
              <td colSpan={4} style={{ border: '1px solid #ddd', padding: '6px', textAlign: 'center', color: '#888' }}>
                Aucun paiement enregistré.
              </td>
            </tr>
          ) : (
            rows.map((row, i) => (
              <tr key={i}>
                <td style={{ border: '1px solid #ddd', padding: '4px', whiteSpace: 'nowrap' }}>{row.label}</td>
                <td style={{ border: '1px solid #ddd', padding: '4px', textAlign: 'right' }}>{row.total.toLocaleString()} {currency}</td>
                <td style={{ border: '1px solid #ddd', padding: '4px', textAlign: 'right' }}>{row.paid.toLocaleString()} {currency}</td>
                <td style={{ border: '1px solid #ddd', padding: '4px', textAlign: 'right', color: row.reste > 0 ? '#c00' : '#108a00', fontWeight: row.reste > 0 ? 500 : 600 }}>
                  {row.reste.toLocaleString()} {currency}
                </td>
              </tr>
            ))
          )}
        </tbody>
        <tfoot>
          <tr>
            <td style={{ border: '1px solid #ddd', padding: '4px', fontWeight: 600, textAlign: 'right' }} colSpan={2}>
              Total à payer :
            </td>
            <td style={{ border: '1px solid #ddd', padding: '4px', fontWeight: 600, textAlign: 'right' }}>
              {totalGlobal.toLocaleString()} {currency}
            </td>
            <td style={{ border: '1px solid #ddd', padding: '4px', fontWeight: 600, textAlign: 'right', color: resteGlobal > 0 ? '#c00' : '#108a00' }}>
              {resteGlobal.toLocaleString()} {currency}
            </td>
          </tr>
          <tr>
            <td style={{ border: '1px solid #ddd', padding: '4px', fontWeight: 600, textAlign: 'right' }} colSpan={2}>
              Total payé :
            </td>
            <td style={{ border: '1px solid #ddd', padding: '4px', fontWeight: 600, textAlign: 'right' }} colSpan={2}>
              {typeof paidAmount === 'number' ? paidAmount.toLocaleString() : 0} {currency}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
};

