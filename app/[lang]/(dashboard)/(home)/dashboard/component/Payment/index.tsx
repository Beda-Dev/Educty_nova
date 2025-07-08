"use client";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import PaymentTable from './Payment-table';
import { Payment, AcademicYear, Installment } from '@/lib/interface';

interface PaymentTableProps {
  data: Payment[];
  academic: AcademicYear;
  installments: Installment[]; // Correction du nom de la prop (installmen -> installments)
}

const Payments = ({ data, academic, installments }: PaymentTableProps) => {
  // Filtrer les échéances pour l'année académique courante
  const filteredInstallments = installments
    .filter((installment) => installment.pricing.academic_years_id === academic.id);

  // Filtrer les paiements correspondant aux échéances filtrées
  const filteredPayment = data
    .filter((payment) => 
      filteredInstallments.some(installment => installment.id === payment.installment_id)
    )
    .slice(0, 10); // Garder les 10 derniers paiements

  return (
    <Card>
      <CardHeader className="mb-0 p-6">
        <CardTitle>Paiements récents</CardTitle>
      </CardHeader>
      <CardContent className="px-0">
        {/* Passer les paiements filtrés au tableau */}
        <PaymentTable data={filteredPayment} />
      </CardContent>
    </Card>
  );
};

export default Payments;