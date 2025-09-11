"use client";

import { useEffect, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Download, Printer } from "lucide-react";
import { useSchoolStore } from "@/store";
import { findStudentById } from "./fonction";
import { toast } from "sonner";
import { generationNumero } from "@/lib/fonction";
import { Registration, Student, Payment, Pricing, Installment, Setting } from "@/lib/interface";
import { generatePDFfromRef } from "@/lib/utils"

interface DataProps {
  registration: Registration;
  payments: Payment[];
  settings: Setting[];
}

function filterPaymentsByRegistrationDate(
  payments: Payment[],
  registration: Registration,
  marginMinutes: number = 1
): Payment[] {
  if (!registration.created_at) return [];

  // Convertir la date de l'inscription en timestamp
  const registrationDate = new Date(registration.created_at);
  const registrationTime = registrationDate.getTime();

  // Calculer la marge en millisecondes
  const marginMs = marginMinutes * 60 * 1000;

  return payments.filter(payment => {
    if (!payment.created_at) return false;

    const paymentDate = new Date(payment.created_at);
    const paymentTime = paymentDate.getTime();

    // Vérifier si le paiement est dans l'intervalle [registrationTime - margin, registrationTime + margin]
    return Math.abs(paymentTime - registrationTime) <= marginMs;
  });
}

export const RegistrationFinal = ({ registration, payments, settings }: DataProps) => {
  const { students, academicYears, classes, pricing, installements } = useSchoolStore();
  const [student, setStudent] = useState<Student | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);
  const filteredPayments = filterPaymentsByRegistrationDate(payments, registration);

  useEffect(() => {
    if (registration.student_id && students.length > 0) {
      setStudent(findStudentById(registration.student_id, students));
    }
  }, [registration.student_id, students]);

  // Get academic year
  const academicYear = academicYears.find(ay => ay.id === registration.academic_year_id)

  // Get class
  const classe = classes.find(c => c.id === registration.class_id)

  // Calculate payment summary
  const getPaymentSummary = () => {
    const feeTypes: Record<number, {
      label: string;
      total: number;
      paid: number;
      pricingId?: number
    }> = {};

    // Group payments by fee type
    filteredPayments.forEach(payment => {
      const installment = installements.find(i => i.id === payment.installment_id);
      if (!installment) return;

      const pricingItem = pricing.find(p => p.id === installment.pricing_id);
      if (!pricingItem) return;

      const feeTypeId = pricingItem.fee_type_id;
      const amount = parseFloat(payment.amount) || 0;

      if (!feeTypes[feeTypeId]) {
        feeTypes[feeTypeId] = {
          label: pricingItem.fee_type?.label || pricingItem.label,
          total: parseFloat(pricingItem.amount) || 0,
          paid: 0,
          pricingId: pricingItem.id
        };
      }

      feeTypes[feeTypeId].paid += amount;
    });

    // Add pricing that might not have payments yet
    pricing.forEach(pricingItem => {
      if (pricingItem.academic_years_id === registration.academic_year_id &&
        pricingItem.level_id === classe?.level_id && pricingItem.assignment_type_id === registration.student?.assignment_type_id) {
        if (!feeTypes[pricingItem.fee_type_id]) {
          feeTypes[pricingItem.fee_type_id] = {
            label: pricingItem.fee_type?.label || pricingItem.label,
            total: parseFloat(pricingItem.amount) || 0,
            paid: 0,
            pricingId: pricingItem.id
          };
        }
      }
    });

    return Object.values(feeTypes);
  };

  const paymentSummary = getPaymentSummary();
  const totalAmount = paymentSummary.reduce((sum, item) => sum + item.total, 0);
  const totalPaid = paymentSummary.reduce((sum, item) => sum + item.paid, 0);
  const remainingAmount = totalAmount - totalPaid;

  const generatePDF = async (action: "download" | "print") => {
    if (!printRef.current) return;

    setIsProcessing(true);
    try {
      generatePDFfromRef(printRef, `reçu_inscription_${student?.registration_number}`, action);
    } catch (error) {
      console.error("Erreur PDF:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  // School info
  const schoolInfo = {
    logo: settings?.[0]?.establishment_logo || "",
    name: settings?.[0]?.establishment_name || "Nom Établissement",
    address: settings?.[0]?.address || "Adresse établissement",
    phone: `${settings?.[0]?.establishment_phone_1 || ""} ${settings?.[0]?.establishment_phone_2 ? "/ " + settings?.[0]?.establishment_phone_2 : ""}`.trim(),
    currency: settings?.[0]?.currency || "FCFA"
  };

  const ReceiptCopy = () => (
    <div className="p-4 bg-white rounded-lg shadow-sm" style={{ fontSize: "12px" }}>
      {/* Header */}
      <div className="flex justify-between items-start border-b pb-3 mb-4">
        <div className="flex items-start gap-3">
          {schoolInfo.logo ? (
            <img
              src={`${process.env.NEXT_PUBLIC_API_BASE_URL_2}/${schoolInfo.logo}`}
              alt="Logo"
              width={80}
              height={80}
              className="school-logo"
              crossOrigin="anonymous" // Ajoutez cette ligne
              onError={(e) => {
                // Gérer les erreurs de chargement d'image
                e.currentTarget.src = 'public\images\default-logo.png'
              }}
            />
          ) : (
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm">
              Logo
            </div>
          )}
          <div className="space-y-1">
            <h1 className="text-sm font-bold leading-snug">{schoolInfo.name}</h1>
            <p className="text-xs text-gray-600 leading-snug">
              {schoolInfo.address} | Tél: {schoolInfo.phone}
            </p>
            <p className="text-xs text-gray-600 leading-snug">
              Année scolaire: {academicYear?.label}
            </p>
          </div>
        </div>
        <div className="text-right space-y-1">
          <h2 className="text-sm font-semibold leading-snug">REÇU D'INSCRIPTION</h2>
          <p className="text-xs text-gray-600 leading-snug">
            N° {generationNumero(registration.id, registration.created_at, "inscription")}
          </p>
          <p className="text-xs text-gray-600 leading-snug">
            Date: {new Date(registration.registration_date).toLocaleDateString("fr-FR")}
          </p>
        </div>
      </div>

      <Card className="print:shadow-none border-0">
        <CardContent className="p-3 space-y-4">
          {/* Student Info */}
          {student && (
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-blue-800 mb-2">INFORMATIONS DE L'ÉLÈVE</h3>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                <Info label="Nom complet" value={`${student.name} ${student.first_name}`} />
                <Info label="Matricule" value={student.registration_number} />
                <Info label="Date de naissance" value={new Date(student.birth_date).toLocaleDateString("fr-FR")} />
                <Info label="Sexe" value={student.sexe} />
                <Info label="Classe" value={classe?.label} />
                <Info label="Date d'inscription" value={new Date(registration.registration_date).toLocaleDateString("fr-FR")} />
              </div>
            </div>
          )}

          <Separator className="my-4" />

          {/* Payment Summary */}
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-blue-800 mb-3 flex items-center justify-between">
              <span>Récapitulatif des paiements</span>

              {/* Encadré Montant Versé */}
              <span className="bg-blue-50 border border-blue-200 rounded-md px-3 py-1 text-sm font-medium flex items-center gap-2">
                <span className="text-blue-700">Montant Versé :</span>
                <span className="text-green-600 font-bold">
                  {totalPaid.toLocaleString()} {schoolInfo.currency}
                </span>
              </span>
            </h3>
            <div className="my-2">
              <PaymentTable
                payments={paymentSummary}
                totalAmount={totalAmount}
                totalPaid={totalPaid}
                remainingAmount={remainingAmount}
                currency={schoolInfo.currency}
              />
            </div>
          </div>

          <Separator className="my-4" />

          {/* Signatures */}
          <div className="grid grid-cols-2 gap-4 mt-6">
            <div className="text-xs text-gray-700 text-center space-y-2">
              <div className="border-t border-gray-400 h-10 w-40 mx-auto"></div>
              <span>Signature du parent/tuteur</span>
            </div>
            <div className="text-xs text-gray-700 text-center space-y-2">
              <div className="border-t border-gray-400 h-10 w-40 mx-auto"></div>
              <span>Cachet et signature de l'établissement</span>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center text-xs text-gray-600 mt-6 pt-4 border-t">
            <p className="mb-1">Document officiel de {schoolInfo.name}</p>
            <p>Émis le {new Date(registration.created_at).toLocaleDateString("fr-FR")} à {new Date(registration.created_at).toLocaleTimeString("fr-FR", { hour: '2-digit', minute: '2-digit' })}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div ref={printRef} className="space-y-6">
        <ReceiptCopy />
        <div className="text-xs text-center text-gray-500 py-2">---------------------------- ---------------------------- ----------------------------</div>
        <ReceiptCopy />
      </div>

      <div className="flex justify-center gap-3 mt-6 print:hidden">
        <Button
          onClick={() => generatePDF("print")}
          variant="outline"
          size="sm"
          className="h-9 px-4 text-sm"
          disabled={isProcessing}
        >
          <Printer className="w-4 h-4 mr-2" />
          Imprimer
        </Button>
        <Button
          onClick={() => generatePDF("download")}
          variant="outline"
          size="sm"
          className="h-9 px-4 text-sm"
          disabled={isProcessing}
        >
          <Download className="w-4 h-4 mr-2" />
          Télécharger PDF
        </Button>
      </div>
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
}

const PaymentTable = ({ payments, totalAmount, totalPaid, remainingAmount, currency }: PaymentTableProps) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border-collapse" style={{ fontSize: "0.85rem" }}>
        <thead>
          <tr>
            <th className="border border-gray-300 p-2 text-left">Type de frais</th>
            <th className="border border-gray-300 p-2 text-right">Montant total</th>
            <th className="border border-gray-300 p-2 text-right">Montant payé</th>
            <th className="border border-gray-300 p-2 text-right">Reste à payer</th>

          </tr>
        </thead>
        <tbody>
          {payments.length === 0 ? (
            <tr>
              <td colSpan={4} className="border border-gray-300 p-2 text-center text-gray-500">
                Aucun paiement enregistré
              </td>
            </tr>
          ) : (
            payments.map((payment, index) => (
              <tr key={index}>
                <td className="border border-gray-300 p-2">{payment.label}</td>
                <td className="border border-gray-300 p-2 text-right">{payment.total.toLocaleString()} {currency}</td>
                <td className="border border-gray-300 p-2 text-right">{payment.paid.toLocaleString()} {currency}</td>
                <td className={`border border-gray-300 p-2 text-right ${payment.total - payment.paid > 0 ? "text-red-600 font-medium" : "text-green-600 font-semibold"}`}>
                  {(payment.total - payment.paid).toLocaleString()} {currency}
                </td>
              </tr>
            ))
          )}

        </tbody>
        <tfoot>
          <tr>
            <td className="border border-gray-300 p-2 font-semibold">
              Total
            </td>
            <td className="border border-gray-300 p-2 font-semibold text-right">
              {totalAmount.toLocaleString()} {currency}
            </td>
            <td className={`border border-gray-300 p-2 font-semibold text-right text-green-600`}>
              {totalPaid.toLocaleString()} {currency}
            </td>
            <td className={`border border-gray-300 p-2 font-semibold text-right ${remainingAmount > 0 ? "text-red-600" : "text-green-600"}`}>
              {remainingAmount.toLocaleString()} {currency}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
};

const Info = ({ label, value }: { label: string; value?: string | number | null }) => (
  <div className="flex items-start">
    <span className="font-semibold min-w-[120px]">{label}:</span>
    <span className="text-gray-800 ml-2">{value || "N/A"}</span>
  </div>
);

export default RegistrationFinal;