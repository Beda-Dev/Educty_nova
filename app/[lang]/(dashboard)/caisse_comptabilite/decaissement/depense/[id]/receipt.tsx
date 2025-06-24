"use client";
import { useState, useRef } from "react";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Download, Printer } from "lucide-react";
import { generationNumero } from "@/lib/fonction";
import { useSchoolStore } from "@/store";
import { generatePDFfromRef } from "@/lib/utils";
import { Expense, Demand, ValidationExpense, User } from "@/lib/interface";

interface Props {
  expense: Expense;
  demand: Demand;
  validation: ValidationExpense;
  cashier: User;
}

const ExpenseReceipt = ({ expense, demand, validation, cashier }: Props) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);
  const { settings } = useSchoolStore();

  const generatePDF = async (action: "print" | "download") => {
    if (!printRef.current) return;

    setIsProcessing(true);
    try {
      generatePDFfromRef(
        printRef, 
        `decaissement_${expense.id}_${generationNumero(expense.id.toString(), expense.created_at, "decaissement")}`, 
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
    currency: settings?.[0]?.currency || "FCFA",
    email: settings?.[0]?.email || "Email établissement",
  };

  // Check if applicant and validator are the same person
  const isSamePerson = demand.applicant_id === validation.user_id;

  const ReceiptCopy = () => (
    <div className="p-2 bg-white rounded-lg" style={{ fontSize: "12px" }}>
      {/* Header */}
      <div className="flex justify-between items-start border-b pb-2 mb-2">
        <div className="flex items-start gap-2">
          {schoolInfo.logo ? (
            <Image
              src={`${process.env.NEXT_PUBLIC_API_BASE_URL_2}/${schoolInfo.logo}`}
              alt="Logo"
              width={60}
              height={60}
              className="school-logo"
            />
          ) : (
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs">
              Logo
            </div>
          )}
          <div className="space-y-0">
            <h1 className="text-xs font-bold leading-snug">{schoolInfo.name}</h1>
            <p className="text-[10px] text-gray-600 leading-snug">
              {schoolInfo.address} | Tél: {schoolInfo.phone}
            </p>
            <p className="text-[10px] text-gray-600 leading-snug">
              Email: {schoolInfo.email}
            </p>

          </div>
        </div>
        <div className="text-right space-y-0">
          <h2 className="text-xs font-semibold leading-snug">REÇU DE DÉCAISSEMENT</h2>
          <p className="text-[10px] text-gray-600 leading-snug">
            {generationNumero(expense.id.toString(), expense.created_at, "decaissement")}
          </p>
          <p className="text-[10px] text-gray-600 leading-snug">
            Date: {new Date(expense.created_at).toLocaleDateString("fr-FR")}
          </p>
        </div>
      </div>

      <Card className="print:shadow-none border-0">
        <CardContent className="p-2 space-y-2">
          {/* Expense Info */}
          <div className="mb-2">
            <h3 className="text-xs font-semibold text-blue-800 mb-1">INFORMATIONS DU DÉCAISSEMENT</h3>
            <div className="grid grid-cols-2 gap-x-1">
              <Info label="Motif" value={expense.label} />
              <Info label="Type de dépense" value={expense.expense_type.name} />
              <Info label="Montant" value={`${Number(expense.amount).toLocaleString()} ${schoolInfo.currency}`} />
              <Info label="Date opération" value={new Date(expense.expense_date).toLocaleDateString("fr-FR")} />
              <Info label="Caisse" value={expense.cash_register.cash_register_number} />
              <Info label="Caissier" value={`${cashier.name}`} />
              <Info label="Demandeur" value={`${demand.applicant.name}`} />
              <Info label="Matricule Demandeur" value={`MAT2025-${demand.applicant.id}`} />
              <Info label="Béneficiare" value={`${demand.applicant.name}`} /> {/* La personne qui a effectuer le retrait */}

            </div>
          </div>

          <Separator className="my-1" />

          {/* Demand Info */}
          <div className="mb-2">
            <h3 className="text-xs font-semibold text-blue-800 mb-1">DEMANDE</h3>
            <div className="grid grid-cols-2 gap-x-2 gap-y-1">
              <Info label="Motif" value={demand.pattern} />
              <Info label="Date demande" value={new Date(demand.created_at).toLocaleDateString("fr-FR")} />
              <Info label="Statut" value={demand.status} /> 
            </div>
          </div>

          <Separator className="my-1" />

          {/* Validation Info - Only show if not same person */}
          {!isSamePerson && (
            <>
              <div className="mb-2">
                <h3 className="text-xs font-semibold text-blue-800 mb-1">VALIDATION</h3>
                <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                  <Info label="Approuvée par " value={`${validation.user?.name}`} />
                  <Info label="Date validation" value={new Date(validation.validation_date).toLocaleDateString("fr-FR")} />
                  <Info label="Commentaire" value={validation.comment || "Aucun"} />
                </div>
              </div>
              <Separator className="my-1" />
            </>
          )}

          <Separator className="my-1" />

          {/* Signatures */}
          <div className="grid grid-cols-2 gap-2 mt-2">
            <div className="text-[10px] text-gray-700 text-center space-y-1">
              <div className="border-t border-gray-400 h-8 w-32 mx-auto"></div>
              <span>Signature du bénéficiaire</span>
            </div>
            <div className="text-[10px] text-gray-700 text-center space-y-1">
              <div className="border-t border-gray-400 h-8 w-32 mx-auto"></div>
              <span>Cachet et signature de l'établissement</span>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center text-[10px] text-gray-600 mt-2 pt-2 border-t">
            <p className="mb-0">Document officiel de {schoolInfo.name}</p>
            <p>Émis le {new Date(expense.created_at).toLocaleDateString("fr-FR")} à {new Date(expense.created_at).toLocaleTimeString("fr-FR", { hour: '2-digit', minute: '2-digit' })}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto p-2">
      <div ref={printRef} className="space-y-3">
        <ReceiptCopy />
        <div className="text-[10px] text-center text-gray-500">---------------------------- ----------------------------</div>
        <ReceiptCopy />
      </div>

      <div className="flex justify-center gap-2 mt-2 print:hidden">
        <Button
          onClick={() => generatePDF("print")}
          variant="outline"
          size="sm"
          className="h-8 px-3 text-xs"
          disabled={isProcessing}
        >
          <Printer className="w-3 h-3 mr-1" />
          Imprimer
        </Button>
        <Button
          onClick={() => generatePDF("download")}
          variant="outline"
          size="sm"
          className="h-8 px-3 text-xs"
          disabled={isProcessing}
        >
          <Download className="w-3 h-3 mr-1" />
          Télécharger PDF
        </Button>
      </div>
    </div>
  );
};

const Info = ({ label, value }: { label: string; value?: string | number | null }) => (
  <div className="flex items-start">
    <span className="font-semibold min-w-[80px] text-[10px]">{label}:</span>
    <span className="text-gray-800 ml-1 text-[10px]">{value || "N/A"}</span>
  </div>
);

export default ExpenseReceipt;