"use client";
import { useState, useRef } from "react";
import Image from "next/image";
import LogoComponent1 from "@/app/[lang]/logo1";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Download, Printer, CheckCircle2, AlertCircle } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { Payment } from "@/lib/interface";
import { DetailsPaiement } from "./fonction";
import { motion } from "framer-motion";
import {generationNumero} from "@/lib/fonction"
import {useSchoolStore} from "@/store/index"

interface Props {
  payment: Payment;
  detail: DetailsPaiement;
}



const PaymentDetail = ({ payment, detail }: Props) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);
  const {settings} = useSchoolStore()


  const formatFCFA = (amount: number | string) => {
    const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;
    if (isNaN(numAmount)) return "0 " + (settings[0].currency? settings[0].currency : "FCFA");
  
    return (
      new Intl.NumberFormat("fr-FR", {
        style: "decimal",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(numAmount) + "\u00A0" + (settings[0].currency? settings[0].currency : "FCFA")
    );
  };

  const generatePDF = async (action: "print" | "download") => {
    setIsProcessing(true);
    try {
      if (!printRef.current) return;

      const canvas = await html2canvas(printRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
      });

      const pdf = new jsPDF("p", "mm", "a4");
      const imgWidth = 190;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(
        canvas.toDataURL("image/png"),
        "PNG",
        10,
        10,
        imgWidth,
        imgHeight
      );

      if (action === "print") {
        const pdfUrl = URL.createObjectURL(pdf.output("blob"));
        const printWindow = window.open(pdfUrl);
        if (printWindow) {
          printWindow.onload = () => {
            printWindow.print();
            URL.revokeObjectURL(pdfUrl);
          };
        }
      } else {
        pdf.save(
          `paiement_${payment.id}_${payment.student.registration_number}.pdf`
        );
      }
    } catch (error) {
      console.error("PDF generation error:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const paymentStatus =
    detail.soldeRestantApresPaiement === 0
      ? {
          text: "Paiement complet",
          icon: CheckCircle2,
          color: "text-green-600 bg-green-50",
        }
      : {
          text: "Solde restant",
          icon: AlertCircle,
          color: "text-amber-600 bg-amber-50",
        };

  return (
    <div className="container mx-auto p-4 max-w-5xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-6"
      >
        {/* Receipt Card */}
        <div
          ref={printRef}
          className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100"
        >
          <Card>
            <CardContent className="p-6">
              {/* Header Section */}
              <div className="flex flex-col md:flex-row justify-between gap-6 pb-6 border-b border-gray-100">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <LogoComponent1 width={40} height={40} />
                    <h1 className="text-2xl font-bold text-gray-800">Educty</h1>
                  </div>

                  <div className="space-y-2">
                    <h2 className="text-xl font-semibold text-gray-900">
                      {payment.student.name} {payment.student.first_name}
                    </h2>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>Matricule: {payment.student.registration_number}</p>
                      <p>Année académique: {detail.anneeAcademique.label}</p>
                      <p>Type de frais: {detail.typeFrais}</p>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-lg font-medium text-gray-500">
                    Reçu de paiement
                  </div>
                  <div className="text-2xl font-bold text-primary-600">
                    # {generationNumero(payment.id.toString(), payment.created_at, "encaissement")}
                  </div>
                  <div className="mt-2 text-sm text-gray-500">
                    Émis le:{" "}
                    {new Date(payment.created_at).toLocaleDateString("fr-FR")}
                  </div>
                </div>
              </div>

              {/* Payment Status */}
              <div
                className={`mt-4 p-3 rounded-lg flex items-center ${paymentStatus.color}`}
              >
                <paymentStatus.icon className="w-5 h-5 mr-2" />
                <span className="font-medium">
                  {paymentStatus.text}:{" "}
                  {formatFCFA(detail.soldeRestantApresPaiement)}
                </span>
              </div>

              {/* Payment Details */}
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">
                  Détails du paiement
                </h3>
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader className="bg-gray-50">
                      <TableRow>
                        <TableHead className="font-semibold">
                          Montant dû
                        </TableHead>
                        <TableHead className="font-semibold">Payé</TableHead>
                        <TableHead className="font-semibold">
                          Reste à payer
                        </TableHead>
                        <TableHead className="font-semibold">Caisse</TableHead>
                        <TableHead className="font-semibold">
                          Caissier
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell className="font-medium">
                          {formatFCFA(detail.soldeRestantAvantPaiement)}
                        </TableCell>
                        <TableCell className="font-medium text-green-600">
                          {formatFCFA(payment.amount)}
                        </TableCell>
                        <TableCell
                          className={`font-medium ${
                            detail.soldeRestantApresPaiement > 0
                              ? "text-amber-600"
                              : "text-green-600"
                          }`}
                        >
                          {formatFCFA(detail.soldeRestantApresPaiement)}
                        </TableCell>
                        <TableCell>
                          {payment.cash_register.cash_register_number}
                        </TableCell>
                        <TableCell>{payment.cashier.name}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </div>

              
              {/* Additional Information + Signature */}
              <div className="mt-6 pt-4 border-t border-gray-100 space-y-8">
                <p className="text-sm text-gray-500 text-center">
                  Ce document fait foi de paiement. Conservez-le précieusement.
                </p>

                {/* Zone de signature */}
                <div className="flex justify-end items-center">
                  <div className="text-right">
                    <p className="text-sm text-gray-700 mb-6">
                      Signature du caissier
                    </p>
                    <div className="w-48 h-16 border-t-2 border-gray-500" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        <p className="my-2 border border-dashed " >---------------------------------------------------------------------------------------------------------------------------------------------------------</p>
          <Card>
            <CardContent className="p-6">
              {/* Header Section */}
              <div className="flex flex-col md:flex-row justify-between gap-6 pb-6 border-b border-gray-100">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <LogoComponent1 width={40} height={40} />
                    <h1 className="text-2xl font-bold text-gray-800">Educty</h1>
                  </div>

                  <div className="space-y-2">
                    <h2 className="text-xl font-semibold text-gray-900">
                      {payment.student.name} {payment.student.first_name}
                    </h2>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>Matricule: {payment.student.registration_number}</p>
                      <p>Année académique: {detail.anneeAcademique.label}</p>
                      <p>Type de frais: {detail.typeFrais}</p>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-lg font-medium text-gray-500">
                    Reçu de paiement
                  </div>
                  <div className="text-2xl font-bold text-primary-600">
                    #{payment.id}
                  </div>
                  <div className="mt-2 text-sm text-gray-500">
                    Émis le:{" "}
                    {new Date(payment.created_at).toLocaleDateString("fr-FR")}
                  </div>
                </div>
              </div>

              {/* Payment Status */}
              <div
                className={`mt-4 p-3 rounded-lg flex items-center ${paymentStatus.color}`}
              >
                <paymentStatus.icon className="w-5 h-5 mr-2" />
                <span className="font-medium">
                  {paymentStatus.text}:{" "}
                  {formatFCFA(detail.soldeRestantApresPaiement)}
                </span>
              </div>

              {/* Payment Details */}
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">
                  Détails du paiement
                </h3>
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader className="bg-gray-50">
                      <TableRow>
                        <TableHead className="font-semibold">
                          Montant dû
                        </TableHead>
                        <TableHead className="font-semibold">Payé</TableHead>
                        <TableHead className="font-semibold">
                          Reste à payer
                        </TableHead>
                        <TableHead className="font-semibold">Caisse</TableHead>
                        <TableHead className="font-semibold">
                          Caissier
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell className="font-medium">
                          {formatFCFA(detail.soldeRestantAvantPaiement)}
                        </TableCell>
                        <TableCell className="font-medium text-green-600">
                          {formatFCFA(payment.amount)}
                        </TableCell>
                        <TableCell
                          className={`font-medium ${
                            detail.soldeRestantApresPaiement > 0
                              ? "text-amber-600"
                              : "text-green-600"
                          }`}
                        >
                          {formatFCFA(detail.soldeRestantApresPaiement)}
                        </TableCell>
                        <TableCell>
                          {payment.cash_register.cash_register_number}
                        </TableCell>
                        <TableCell>{payment.cashier.name}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </div>

              
              {/* Additional Information + Signature */}
              <div className="mt-6 pt-4 border-t border-gray-100 space-y-8">
                <p className="text-sm text-gray-500 text-center">
                  Ce document fait foi de paiement. Conservez-le précieusement.
                </p>

                {/* Zone de signature */}
                <div className="flex justify-end items-center">
                  <div className="text-right">
                    <p className="text-sm text-gray-700 mb-6">
                      Signature du caissier
                    </p>
                    <div className="w-48 h-16 border-t-2 border-gray-500" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        {!isProcessing && (
          <div className="flex justify-end gap-3">
            <Button
              onClick={() => generatePDF("download")}
              variant="outline"
              className="gap-2 text-gray-700"
            >
              <Download className="w-4 h-4" />
              Télécharger PDF
            </Button>
            <Button
              onClick={() => generatePDF("print")}
              className="gap-2 bg-primary-600 hover:bg-primary-700"
            >
              <Printer className="w-4 h-4" />
              Imprimer le reçu
            </Button>
          </div>
        )}

        {isProcessing && (
          <div className="flex justify-end">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <div className="w-4 h-4 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
              Génération du document...
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default PaymentDetail;
