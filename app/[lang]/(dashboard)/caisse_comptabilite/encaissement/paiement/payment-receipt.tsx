"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { Student, Payment, PaymentMethod, Pricing, Installment, FeeType, Registration } from "@/lib/interface";
import { useSchoolStore } from "@/store";
import { generationNumero } from "@/lib/fonction";

interface InstallmentDetail {
  installment: Installment;
  pricing: Pricing;
  payments: Payment[];
  amountPaid: number;
  remainingAmount: number;
  isOverdue: boolean;
}

interface PaymentReceiptProps {
  student?: Student;
  payments: Payment[];
  financialData: any;
  settings: any[];
  classe: string;
  niveau: string;
  installmentAmounts: Record<number, number>;
  paymentMethods: Record<number, Array<{ id: number; amount: number }>>;
  methodPayment: PaymentMethod[];
  currency: string;
  discountAmount: number;
  discountPercentage: number;
  pricingId: number | null;
  registration?: Registration;
  feeTypes: FeeType[];
}

const PaymentReceipt = ({
  student,
  payments,
  financialData,
  settings,
  classe,
  niveau,
  installmentAmounts,
  paymentMethods,
  methodPayment,
  currency,
  discountAmount,
  discountPercentage,
  registration,
  feeTypes,
}: PaymentReceiptProps) => {
  const { academicYearCurrent } = useSchoolStore();
  const schoolInfo = {
    logo: settings?.[0]?.establishment_logo || "",
    name: settings?.[0]?.establishment_name || "Nom Établissement",
    address: settings?.[0]?.address || "Adresse établissement",
    phone:
      `${settings?.[0]?.establishment_phone_1 || ""} ${settings?.[0]?.establishment_phone_2 ? "/ " + settings?.[0]?.establishment_phone_2 : ""}`.trim(),
    currency: settings?.[0]?.currency || "FCFA",
  };

  const formatAmount = (amount: number) => {
    return amount.toLocaleString('fr-FR');
  };

  const generateReceiptNumber = () => {
    return generationNumero(payments[0]?.id, payments[0]?.created_at || new Date().toISOString(), "encaissement");
  };

  // Calcul des totaux
  const totalPaid = Object.values(installmentAmounts).reduce((sum, amount) => sum + amount, 0);
  const totalDue = financialData?.totalDue || 0;
  const totalRemaining = financialData?.totalRemaining || 0;
  const totalPaidOverall = financialData?.totalPaid || 0;

  const { payments: allPayments } = useSchoolStore();

  // Vérifier s'il y a une réduction
  const hasDiscount = discountAmount > 0 || discountPercentage > 0;

  // Créer un résumé des paiements par type de frais
  const paymentSummary = financialData?.applicablePricing.map((pricing: Pricing) => {
    const feeTypeLabel = pricing.fee_type.label;

    const installmentDetails = financialData.installmentDetails.filter(
      (detail: InstallmentDetail) => detail.pricing.id === pricing.id,
    );

    const totalDue = installmentDetails.reduce(
      (sum: number, detail: InstallmentDetail) => sum + Number(detail.installment.amount_due),
      0,
    );

    const totalPaid = installmentDetails.reduce((sum: number, detail: InstallmentDetail) => sum + detail.amountPaid, 0);

    return {
      label: feeTypeLabel,
      total: totalDue,
      paid: totalPaid,
    };
  });

  const SingleReceipt = () => (
    <div className="p-2 bg-white rounded-lg shadow-sm" style={{ fontSize: "12px" }}>
      {/* Header */}
      <div className="flex justify-between items-start border-b pb-1 mb-2">
        <div className="flex items-start gap-2">
          {schoolInfo.logo ? (
            <img
              src={`${process.env.NEXT_PUBLIC_API_BASE_URL_2}/${schoolInfo.logo}`}
              alt="Logo"
              width={80}
              height={80}
              className="school-logo"
              crossOrigin="anonymous"
              onError={(e) => {
                e.currentTarget.src = "/images/default-logo.png" // placé dans public/images
              }}
            />
          ) : (
            <img
              src="/images/default-logo.png"
              alt="Logo par défaut"
              width={80}
              height={80}
              className="school-logo"
            />
          )}

          <div className="space-y-0">
            <h1 className="text-xs font-bold leading-tight">{schoolInfo.name}</h1>
            <p className="text-xs text-gray-600 leading-tight">
              {schoolInfo.address} | Tél: {schoolInfo.phone}
            </p>
            <p className="text-xs text-gray-600 leading-tight">Année scolaire: {academicYearCurrent.label || "N/A"}</p>
          </div>
        </div>
        <div className="text-right space-y-0">
          <h2 className="text-xs font-semibold leading-tight">REÇU DE PAIEMENT</h2>
          <p className="text-xs text-gray-600 leading-tight">{generateReceiptNumber()}</p>
          <p className="text-xs text-gray-600 leading-tight">Date: {new Date().toLocaleDateString("fr-FR")}</p>
        </div>
      </div>

      <Card className="print:shadow-none border-0">
        <CardContent className="p-2 space-y-2">
          {/* Student Info */}
          <div className="mb-2">
            <h3 className="text-xs font-semibold text-blue-800 mb-1">INFORMATIONS DE L'ÉLÈVE</h3>
            <div className="grid grid-cols-2 gap-x-2 gap-y-1">
              <Info label="Nom complet" value={`${student?.first_name} ${student?.name}`} />
              <Info label="Matricule" value={student?.registration_number} />
              <Info label="Sexe" value={student?.sexe} />
              <Info label="Classe" value={classe} />
              <Info label="Type d'affectation" value={student?.assignment_type?.label} />
            </div>
          </div>

          <Separator className="" />

          {/* Payment Details */}
          <div className="mb-2">
            <h3 className="text-xs font-semibold text-blue-800 mb-1 flex items-center justify-between">
              <span>Détails du paiement</span>
              <span className="bg-blue-50 border border-blue-200 rounded-md px-2 py-1 text-xs font-medium flex items-center gap-1">
                <span className="text-blue-700">Montant Versé :</span>
                <span className="text-green-600 font-bold">
                  {formatAmount(totalPaid)} {currency}
                </span>
              </span>
            </h3>

            {/* {hasDiscount && (
              <div className="mb-2 p-2 bg-green-50 border border-green-200 rounded-md">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-green-700">Réduction appliquée:</span>
                  <span className="text-xs font-bold text-green-600">
                    {discountPercentage > 0
                      ? `${discountPercentage}% (${formatAmount(discountAmount)} ${currency})`
                      : `${formatAmount(discountAmount)} ${currency}`}
                  </span>
                </div>
              </div>
            )} */}

            <div className="my-1">
              <PaymentTable
                payments={paymentSummary || []}
                totalAmount={financialData?.totalDue || 0}
                totalPaid={financialData?.totalPaid || 0}
                remainingAmount={financialData?.totalRemaining || 0}
                currency={currency}
                hasDiscount={hasDiscount}
                discountAmount={discountAmount}
                discountPercentage={discountPercentage}
                totalAfterDiscount={financialData?.totalDue - discountAmount}
                feeTypes={feeTypes}
                registration={registration}
              />
            </div>
          </div>

          <Separator className="" />

          {/* Payment Method */}
          <div className="mb-2">
            <h3 className="text-xs font-semibold text-blue-800 mb-1">INFORMATIONS DE PAIEMENT</h3>
            <div className="grid grid-cols-2 gap-x-2 gap-y-1">
              <Info
                label="Caissier(e)"
                value={
                  payments[0]?.cashier?.name
                    ? payments[0].cashier.name
                      .split(" ")
                      .map((part) => part[0]?.toUpperCase() || "")
                      .join("")
                    : "N/A"
                }
              />
              <Info label="Caisse" value={payments[0]?.cash_register?.cash_register_number || "N/A"} />
            </div>
          </div>

          <Separator className="" />

          {/* Signatures */}
          <div className="grid grid-cols-2 gap-2 mt-2">
            <div className="text-xs text-gray-700 text-center space-y-1">
              <div className="border-t border-gray-400 h-6 w-32 mx-auto"></div>
              <span>Signature du parent/tuteur</span>
            </div>
            <div className="text-xs text-gray-700 text-center space-y-1">
              <div className="border-t border-gray-400 h-6 w-32 mx-auto"></div>
              <span>Cachet et signature de l'établissement</span>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center text-xs text-gray-600 mt-2 pt-2 border-t">
            <p className="mb-0.5">Document officiel de {schoolInfo.name}</p>
            <p>
              Émis le {new Date().toLocaleDateString("fr-FR")} à{" "}
              {new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="space-y-4">
      <SingleReceipt />
      <div className="border-t-2 border-dashed border-gray-400 my-2"></div>
      <SingleReceipt />
    </div>
  );
};

interface PaymentTableProps {
  payments: {
    label: string;
    total: number;
    paid: number;
  }[];
  totalAmount: number;
  totalPaid: number;
  remainingAmount: number;
  currency: string;
  hasDiscount: boolean;
  discountAmount: number;
  discountPercentage: number;
  totalAfterDiscount: number;
  feeTypes: FeeType[];
  registration?: Registration;
}

const PaymentTable = ({
  payments,
  totalAmount,
  totalPaid,
  remainingAmount,
  currency,
  hasDiscount,
  discountAmount,
  discountPercentage,
  totalAfterDiscount,
  feeTypes,
  registration
}: PaymentTableProps) => {
  const formatAmount = (amount: number) => {
    return amount.toLocaleString('fr-FR');
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border-collapse" style={{ fontSize: "0.75rem" }}>
        <thead>
          <tr>
            <th className="border border-gray-300 p-1 text-left">Type de frais</th>
            <th className="border border-gray-300 p-1 text-right">Montant total</th>
            <th className="border border-gray-300 p-1 text-right">Montant payé</th>
            <th className="border border-gray-300 p-1 text-right">Reste à payer</th>
          </tr>
        </thead>
        <tbody>
          {payments.length === 0 ? (
            <tr>
              <td colSpan={4} className="border border-gray-300 p-1 text-center text-gray-500">
                Aucun paiement enregistré
              </td>
            </tr>
          ) : (
            payments.map((payment, index) => (
              <tr key={index}>
                <td className="border border-gray-300 p-1">{payment.label}</td>
                <td className="border border-gray-300 p-1 text-right">
                  {formatAmount(payment.total)} {currency}
                </td>
                <td className="border border-gray-300 p-1 text-right">
                  {formatAmount(payment.paid)} {currency}
                </td>
                <td
                  className={`border border-gray-300 p-1 text-right ${payment.total - payment.paid > 0 ? "text-red-600 font-medium" : "text-green-600 font-semibold"}`}
                >
                  {formatAmount(payment.total - payment.paid)} {currency}
                </td>
              </tr>
            ))
          )}
        </tbody>
        <tfoot>
          {hasDiscount && (
            <>
              <tr className="border-t border-gray-200">
                <td className="border border-gray-300 p-1 font-medium" colSpan={3}>Total avant remise</td>
                <td className="border border-gray-300 p-1 text-right">
                  {formatAmount(totalAmount)} {currency}
                </td>
              </tr>
              <tr className="border-b border-gray-200">
                <td className="border border-gray-300 p-1" colSpan={3}>
                  Remise sur {feeTypes.find((fee) => fee.id === registration?.pricing?.fee_type_id)?.label || "frais"}
                  {discountPercentage > 0 ? ` (${discountPercentage}%)` : ''}
                </td>
                <td className="border border-gray-300 p-1 text-right text-red-600">
                  -{formatAmount(discountAmount)} {currency}
                </td>
              </tr>
            </>
          )}
          <tr>
            <td className="border border-gray-300 p-1 font-semibold">
              {hasDiscount ? "Total après remise" : "Total"}
            </td>
            <td className="border border-gray-300 p-1 font-semibold text-right">
              {hasDiscount ? formatAmount(totalAfterDiscount) : formatAmount(totalAmount)} {currency}
            </td>
            <td className={`border border-gray-300 p-1 font-semibold text-right text-green-600`}>
              {formatAmount(totalPaid)} {currency}
            </td>
            <td
              className={`border border-gray-300 p-1 font-semibold text-right ${remainingAmount > 0 ? "text-red-600" : "text-green-600"}`}
            >
              {formatAmount(remainingAmount)} {currency}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
};

const Info = ({ label, value }: { label: string; value?: string | number | null }) => (
  <div className="flex items-start">
    <span className="font-semibold min-w-[80px] text-xs">{label}:</span>
    <span className="text-gray-800 ml-1 text-xs">{value || "N/A"}</span>
  </div>
);

export default PaymentReceipt;