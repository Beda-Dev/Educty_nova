"use client";
import { useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Download, Printer, CheckCircle2, AlertCircle } from "lucide-react";
import { DetailsPaiement } from "./fonction";
import { motion } from "framer-motion";
import { generationNumero } from "@/lib/fonction";
import { useSchoolStore } from "@/store";
import { generatePDFfromRef } from "@/lib/utils";
import { Payment } from "@/lib/interface";
import { getPaymentSummary, getTotalPaymentAmounts } from "./fonction";
import {FeeType , Registration} from "@/lib/interface"

interface Props {
  payment: Payment;
  detail: DetailsPaiement;
}

const PaymentDetail = ({ payment, detail }: Props) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);
  const { settings, pricing, installements, registrations, payments , feeTypes } = useSchoolStore();
  const inscription = registrations.find((re) => Number(re.academic_year_id) === Number(detail.anneeAcademique.id) && re.student_id === payment.student_id);

  // Filtrer tous les paiements de l'étudiant antérieurs ou égaux au paiement actuel
  const datePaiementActuel = new Date(payment.created_at);
  
  const studentPayments = payments.filter(p => {
    // Vérifier si le paiement appartient à l'étudiant
    if (p.student_id !== payment.student_id) return false;
    
    // Vérifier si le paiement est antérieur ou égal au paiement actuel
    const datePaiement = new Date(p.created_at);
    if (datePaiement.getTime() > datePaiementActuel.getTime()) return false;
    
    // Trouver l'installment associé au paiement
    const installment = installements.find(inst => inst.id === p.installment_id);
    if (!installment) return false;
    
    // Trouver le pricing associé à l'installment
    const pricingItem = pricing.find(pr => pr.id === installment.pricing_id);
    if (!pricingItem) return false;
    
    // Vérifier si le pricing appartient à l'année académique courante
    return pricingItem.academic_years_id === detail.anneeAcademique.id;
  });

  // Get payment summary avec tous les paiements antérieurs ou égaux au paiement actuel
  const paymentSummary = getPaymentSummary(
    payment.student_id,
    studentPayments, // Tous les paiements antérieurs ou égaux au paiement actuel
    pricing,
    installements,
    detail.anneeAcademique.id,
    Number(inscription?.classe.level_id),
    Number(payment.student.assignment_type_id)
  );

  // Calculer les montants avec réduction si applicable
  const { totalAmount, totalPaid, remainingAmount } = getTotalPaymentAmounts(paymentSummary);
  
  // Vérifier s'il y a une réduction sur l'inscription
  const hasDiscount = !!(inscription && (inscription.discount_percentage || inscription.discount_amount));
  // console.log('=== DEBUG DISCOUNT CALCULATION ===');
  // console.log('Inscription:', inscription);
  // console.log('Has discount:', hasDiscount);
  // console.log('Original total amount:', totalAmount);
  // console.log('Discount percentage from DB:', inscription?.discount_percentage);
  // console.log('Discount amount from DB:', inscription?.discount_amount);
  
  // Calculer le montant total après réduction
  let totalAfterDiscount = totalAmount;
  let discountAmount = 0;
  let discountPercentage = inscription?.discount_percentage ? parseFloat(inscription.discount_percentage) : 0;
  
  if (hasDiscount && inscription) {
    console.log('Processing discount for inscription:', {
      discount_amount: inscription.discount_amount,
      discount_percentage: inscription.discount_percentage
    });
    
    if (inscription.discount_amount) {
      discountAmount = parseFloat(inscription.discount_amount);
      totalAfterDiscount = totalAmount - discountAmount;
      console.log(`Applied fixed discount: ${discountAmount} (New total: ${totalAfterDiscount})`);
      // Si on a un pourcentage, on le calcule pour l'affichage
      if (inscription.discount_percentage) {
        discountPercentage = parseFloat(inscription.discount_percentage);
        console.log(`Also has percentage discount: ${discountPercentage}%`);
      }
    } else if (inscription.discount_percentage) {
      // Convertir la chaîne "20.00" en nombre décimal
      discountPercentage = parseFloat(inscription.discount_percentage);
      if (!isNaN(discountPercentage)) {
        discountAmount = (totalAmount * discountPercentage) / 100;
        totalAfterDiscount = totalAmount - discountAmount;
        console.log(`Applied percentage discount: ${discountPercentage}% (${discountAmount.toFixed(2)} off, New total: ${totalAfterDiscount.toFixed(2)})`);
      } else {
        console.error('Invalid discount percentage format:', inscription.discount_percentage);
      }
    }
  } else {
    console.log('No discount applied');
  }
  
  console.log('Final values:', {
    totalAmount,
    discountAmount,
    discountPercentage,
    totalAfterDiscount,
    hasDiscount
  });

  const generatePDF = async (action: "print" | "download") => {
    if (!printRef.current) return;

    setIsProcessing(true);
    try {
      generatePDFfromRef(
        printRef, 
        `paiement_${payment.id}_${payment.student.registration_number}`, 
        action
      );
    } catch (error) {
      console.error("PDF generation error:", error);
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
      <div className="flex justify-between items-start border-b pb-3 mb-1">
        <div className="flex items-start gap-3">
          {schoolInfo.logo ? (
            <img
              src={`${process.env.NEXT_PUBLIC_API_BASE_URL_2}/${schoolInfo.logo}`}
              alt="Logo"
              width={60}
              height={60}
              className="school-logo"
              crossOrigin="anonymous" // Ajoutez cette ligne
              onError={(e) => {
                // Gérer les erreurs de chargement d'image
                e.currentTarget.src = '/images/default-logo.png'
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
              Année scolaire: {detail.anneeAcademique.label}
            </p>
          </div>
        </div>
        <div className="text-right space-y-1">
          <h2 className="text-sm font-semibold leading-snug">REÇU DE PAIEMENT</h2>
          <p className="text-xs text-gray-600 leading-snug">
           {generationNumero(payment.id.toString(), payment.created_at, "encaissement")}
          </p>
          <p className="text-xs text-gray-600 leading-snug">
            Date: {new Date(payment.created_at).toLocaleDateString("fr-FR")}
          </p>
        </div>
      </div>

      <Card className="print:shadow-none border-0">
        <CardContent className="p-3 space-y-1">
          {/* Student Info */}
          <div className="mb-1">
            <h3 className="text-sm font-semibold text-blue-800">INFORMATIONS DE L'ÉLÈVE</h3>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
              <Info label="Nom complet" value={`${payment.student.name} ${payment.student.first_name}`} />
              <Info label="Matricule" value={payment.student.registration_number} />
              <Info label="Date de naissance" value={new Date(payment.student.birth_date).toLocaleDateString("fr-FR")} />
              <Info label="Sexe" value={payment.student.sexe} />
              <Info label="Classe" value={inscription?.classe.label} />
              <Info label="Type de paiement" value={detail.typeFrais} />
            </div>
          </div>

          <Separator className="" />

          {/* Payment Details */}
          <div className="">
            <h3 className="text-sm font-semibold text-blue-800 mb-3 flex items-center justify-between">
              <span>Détails du paiement</span>
              <span className="bg-blue-50 border border-blue-200 rounded-md px-3 py-1 text-sm font-medium flex items-center gap-2">
                <span className="text-blue-700">Montant Versé :</span>
                <span className="text-green-600 font-bold">
                  {totalPaid.toLocaleString()} {schoolInfo.currency}
                </span>
              </span>
            </h3>
            <div className="">
              <PaymentTable
                payments={paymentSummary}
                totalAmount={totalAmount}
                totalPaid={totalPaid}
                remainingAmount={remainingAmount}
                currency={schoolInfo.currency}
                hasDiscount={hasDiscount}
                discountAmount={discountAmount}
                discountPercentage={discountPercentage}
                totalAfterDiscount={totalAfterDiscount}
                feeTypes={feeTypes}
                registration={inscription as Registration}
              />
            </div>
          </div>

          <Separator className="" />

          {/* Payment Method */}
          <div className="">
            <h3 className="text-xs font-semibold text-blue-800 mb-2">INFORMATIONS DE PAIEMENT</h3>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
              <Info 
                label="Caissier(e)" 
                value={payment.cashier.name
                  .split(' ')
                  .map(part => part[0]?.toUpperCase() || '')
                  .join('')} 
              />
              <Info label="Caisse" value={payment.cash_register.cash_register_number} />
            </div>
          </div>

          <Separator className="" />

          {/* Signatures */}
          <div className="grid grid-cols-2 gap-4 mt-1">
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
          <div className="text-center text-xs text-gray-600 mt-1 pt-1 border-t">
            <p className="mb-1">Document officiel de {schoolInfo.name}</p>
            <p>Émis le {new Date(payment.created_at).toLocaleDateString("fr-FR")} à {new Date(payment.created_at).toLocaleTimeString("fr-FR", { hour: '2-digit', minute: '2-digit' })}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div ref={printRef} className="space-y-2">
        <ReceiptCopy />
        <div className="text-xs text-center text-gray-500">---------------------------- ---------------------------- ----------------------------</div>
        <ReceiptCopy />
      </div>

      <div className="flex justify-center gap-3 mt-4 print:hidden">
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

type PaymentItem = {
  label: string;
  total: number;
  paid: number;
};

interface PaymentTableProps {
  payments: PaymentItem[];
  totalAmount: number;
  totalPaid: number;
  remainingAmount: number;
  currency: string;
  hasDiscount: boolean;
  discountAmount: number;
  discountPercentage: number;
  totalAfterDiscount: number;
  feeTypes: FeeType[];
  registration: Registration;
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
            payments.map((payment: PaymentItem, index: number) => (
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
          {hasDiscount && (
            <>
              <tr className="border-t border-gray-200">
                <td className="border border-gray-300 p-1 font-medium" colSpan={3}>Total avant remise</td>
                <td className="border border-gray-300 p-1 text-right">
                  {/* {totalAmount.toLocaleString()} {currency} */}
                  {remainingAmount.toLocaleString()} {currency}
                </td>
              </tr>
              <tr className="border-b border-gray-200">
                <td className="border border-gray-300 p-1" colSpan={3}>
                  Remise sur {feeTypes.find((fee)=>fee.id === registration.pricing?.fee_type_id)?.label} {hasDiscount ? `(${discountPercentage}%)` : '(0%)'}
                </td>
                <td className="border border-gray-300 p-1 text-right text-red-600">
                  -{discountAmount.toLocaleString()} {currency}
                </td>
              </tr>
            </>
          )}
          <tr>
            <td className="border border-gray-300 p-1 font-medium">
              {hasDiscount ? "Total après remise" : "Total"}
            </td>
            <td className="border border-gray-300 p-1 text-right">
              {hasDiscount ? totalAfterDiscount.toLocaleString() : totalAmount.toLocaleString()} {currency}
            </td>
            <td className={`border border-gray-300 p-2 font-semibold text-right text-green-600`}>
              {totalPaid.toLocaleString()} {currency}
            </td>
            <td className={`border border-gray-300 p-2 font-semibold text-right ${remainingAmount > 0 ? "text-red-600" : "text-green-600"}`}>
              {hasDiscount 
                ? (totalAfterDiscount - totalPaid).toLocaleString() 
                : remainingAmount.toLocaleString()} {currency}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
};

const Info = ({ label, value }: { label: string; value?: string | number | null }) => (
  <div className="flex items-start">
    <span className="font-semibold min-w-[100px]">{label}:</span>
    <span className="text-gray-800 ml-1">{value || "N/A"}</span>
  </div>
);

export default PaymentDetail;