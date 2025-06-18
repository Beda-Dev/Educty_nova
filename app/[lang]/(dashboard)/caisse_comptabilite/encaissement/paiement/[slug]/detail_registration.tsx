"use client";
import { useState, useRef, useEffect } from "react";
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
import {
  Download,
  User,
  CheckCircle2,
  AlertCircle,
  Printer,
} from "lucide-react";
import { Payment, Registration, Student } from "@/lib/interface";
import { DonneesEtudiantFusionnees } from "../fonction";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { isRecentPayment } from "./fonction";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import {generationNumero} from "@/lib/fonction"


interface dataProps {
  registration: Registration;
  studentData: DonneesEtudiantFusionnees;
}

const PaymentDetail = ({ registration, studentData }: dataProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);
  const [recentPayments, setRecentPayments] = useState<Payment[]>([]);
  const router = useRouter();
  const [showRecentPaymentNotification, setShowRecentPaymentNotification] =
    useState(false);
  const [visibleNotifications, setVisibleNotifications] = useState<
    Record<string, boolean>
  >({});
  

  useEffect(() => {
    if (studentData.detailsPaiements) {
      const recent = studentData.detailsPaiements
        .filter((payment) => isRecentPayment(payment.created_at))
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      setRecentPayments(recent);

      recent.forEach((payment) => {
        toast.custom((t) => (
          <div
            className={`${
              t.visible ? "animate-enter" : "animate-leave"
            } max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5 p-4 border-l-4 border-green-500`}
          >
            <div className="flex-1 w-0">
              <div className="flex items-start">
                <div className="flex-shrink-0 pt-0.5">
                  <CheckCircle2 className="h-6 w-6 text-green-500" />
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    Paiement de {parseFloat(payment.amount).toLocaleString()} FCFA enregistré
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    Type: {getPaymentFeeType(payment.installment_id)}<br />
                    Date: {new Date(payment.created_at).toLocaleString('fr-FR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            </div>
            <div className="ml-4 flex-shrink-0 flex">
              <Button
                size="sm"
                className="bg-primary hover:bg-primary/90 text-white"
                onClick={() => {
                  toast.dismiss(t.id);
                  router.push(`/caisse_comptabilite/encaissement/historique_paiement/${payment.id}`);
                }}
              >
                Voir le reçu
              </Button>
            </div>
          </div>
        ), { duration: 10000 });
      });
    }
  }, [studentData.detailsPaiements, router]);
  


  const handlePrint = async () => {
    setIsProcessing(true);
    if (!printRef.current) return;

    try {
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

      // Open PDF in new tab for printing
      const pdfUrl = URL.createObjectURL(pdf.output("blob"));
      const printWindow = window.open(pdfUrl);

      if (printWindow) {
        printWindow.onload = () => {
          printWindow.print();
          URL.revokeObjectURL(pdfUrl);
        };
      }
    } catch (error) {
      console.error("Print error:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownloadPDF = async () => {
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
      pdf.save(
        `reçu_paiement_${studentData.informationsEtudiant.registration_number}.pdf`
      );
    } catch (error) {
      console.error("Download error:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const getPaymentFeeType = (installmentId: number) => {
    const feeType = studentData.detailsFrais?.find((frais) =>
      frais.echeanceIds.includes(installmentId)
    );
    return feeType?.typeFrais || "Non spécifié";
  };

  const isSolde = studentData.resumePaiements?.soldeRestant === 0;
  const soldeMessage = isSolde
    ? "COMPTE SOLDÉ - Tous les frais sont réglés"
    : `COMPTE NON SOLDÉ - Reste à payer: ${studentData.resumePaiements?.soldeRestant?.toLocaleString()} FCFA`;

    const closeNotification = (paymentId: string) => {
      setVisibleNotifications(prev => ({
        ...prev,
        [paymentId]: false
      }));
    };

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <div className="flex flex-col gap-6">
        {/* Receipt Card */}
        <div
          ref={printRef}
          className="bg-white rounded-lg shadow-md overflow-hidden"
        >
          <Card>
            <CardContent className="p-6">
              {/* Header Section */}
              <div className="flex flex-col md:flex-row justify-between gap-6 pb-6 border-b">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <LogoComponent1 width={40} height={40} />
                    <h1 className="text-2xl font-bold text-gray-800">Educty Nova</h1>
                  </div>

                  <div className="mt-6 flex items-start gap-4">
                    {studentData.informationsEtudiant.photo ? (
                      <img
                        src={typeof studentData.informationsEtudiant.photo === 'string' ? studentData.informationsEtudiant.photo : ''}
                        alt="Photo de l'élève"
                        width={100}
                        height={100}
                        className="rounded-full border-2 border-gray-200 object-cover"
                      />
                    ) : (
                      <div className="rounded-full border-2 border-gray-200 p-4">
                        <User className="w-12 h-12 text-gray-400" />
                      </div>
                    )}

                    <div className="space-y-1">
                      <h2 className="text-xl font-semibold text-gray-900">
                        {studentData.informationsEtudiant.name}{" "}
                        {studentData.informationsEtudiant.first_name}
                      </h2>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p>
                          Matricule:{" "}
                          {studentData.informationsEtudiant.registration_number}
                        </p>
                        <p>
                          Classe: {registration.classe?.label || "Non spécifié"}
                        </p>
                        <p>
                          Année académique:{" "}
                          {registration.academic_year?.label || "Non spécifié"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-lg font-medium text-gray-500">
                    Reçu de paiement
                  </div>
                  <div className="text-2xl font-bold text-skyblue-600">
                    # {generationNumero(registration.id.toString(), registration.created_at, "encaissement")}
                  </div>
                  <div className="mt-2 text-sm text-gray-500">
                    Émis le:{" "}
                    {new Date(
                      registration.registration_date
                    ).toLocaleDateString("fr-FR")}
                  </div>
                </div>
              </div>

              {/* Balance Status */}
              <div
                className={`mt-4 p-3 rounded-lg flex items-center ${
                  isSolde ? "bg-green-50" : "bg-amber-50"
                }`}
              >
                {isSolde ? (
                  <CheckCircle2 className="w-5 h-5 mr-2 text-green-600" />
                ) : (
                  <AlertCircle className="w-5 h-5 mr-2 text-amber-600" />
                )}
                <span
                  className={`font-medium ${
                    isSolde ? "text-green-700" : "text-amber-700"
                  }`}
                >
                  {soldeMessage}
                </span>
              </div>

              {/* Fees Details */}
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">
                  Détails des frais
                </h3>
                <div className="border rounded-lg overflow-hidden">
                  <Table className="min-w-full">
                    <TableHeader className="bg-gray-50">
                      <TableRow>
                        <TableHead className="font-semibold text-gray-700">
                          Type de frais
                        </TableHead>
                        <TableHead className="font-semibold text-gray-700 text-right">
                          Montant dû
                        </TableHead>
                        <TableHead className="font-semibold text-gray-700 text-right">
                          Payé
                        </TableHead>
                        <TableHead className="font-semibold text-gray-700 text-right">
                          Reste
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {studentData.detailsFrais?.map((frais, index) => (
                        <TableRow
                          key={index}
                          className={
                            index % 2 === 0 ? "bg-white" : "bg-gray-50"
                          }
                        >
                          <TableCell className="font-medium text-gray-700">
                            {frais.typeFrais}
                          </TableCell>
                          <TableCell className="">
                            {frais.montantDu.toLocaleString()} FCFA
                          </TableCell>
                          <TableCell className="">
                            {frais.montantPaye.toLocaleString()} FCFA
                          </TableCell>
                          <TableCell
                            className={`text-right font-medium ${
                              frais.resteAPayer > 0
                                ? "text-red-600"
                                : "text-green-600"
                            }`}
                          >
                            {frais.resteAPayer.toLocaleString()} FCFA
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Summary Section */}
              <div className="mt-4 flex justify-end">
                <div className="bg-gray-50 p-4 rounded-lg w-full md:w-1/2">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="font-semibold text-gray-700">Total dû:</div>
                    <div className="text-right">
                      {studentData.resumePaiements?.montantTotalDu.toLocaleString()}{" "}
                      FCFA
                    </div>

                    <div className="font-semibold text-gray-700">
                      Total payé:
                    </div>
                    <div className="text-right">
                      {studentData.resumePaiements?.montantTotalPaye.toLocaleString()}{" "}
                      FCFA
                    </div>

                    <div className="font-semibold text-gray-700">Solde:</div>
                    <div
                      className={`text-right font-semibold ${
                        studentData.resumePaiements?.soldeRestant === 0
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {studentData.resumePaiements?.soldeRestant.toLocaleString()}{" "}
                      FCFA
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment History */}
              {studentData.detailsPaiements &&
                studentData.detailsPaiements.length > 0 && (
                  <div className="mt-8">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">
                      Historique des paiements
                    </h3>
                    <div className="border rounded-lg overflow-hidden">
                      <Table className="min-w-full">
                        <TableHeader className="bg-gray-50">
                          <TableRow>
                            <TableHead className="font-semibold text-gray-700">
                              Date
                            </TableHead>
                            <TableHead className="font-semibold text-gray-700">
                              Montant
                            </TableHead>
                            <TableHead className="font-semibold text-gray-700">
                              Frais
                            </TableHead>
                            <TableHead className="font-semibold text-gray-700">
                              Caisse
                            </TableHead>
                            <TableHead className="font-semibold text-gray-700">
                              Caissier(ère)
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {studentData.detailsPaiements.map(
                            (paiement, index) => (
                              <TableRow
                                key={index}
                                className={
                                  index % 2 === 0 ? "bg-white" : "bg-gray-50"
                                }
                              >
                                <TableCell className="text-gray-600">
                                  {new Date(
                                    paiement.created_at
                                  ).toLocaleDateString("fr-FR")}
                                </TableCell>
                                <TableCell className="font-medium">
                                  {parseFloat(paiement.amount).toLocaleString()}{" "}
                                  FCFA
                                </TableCell>
                                <TableCell>
                                  {getPaymentFeeType(paiement.installment_id)}
                                </TableCell>
                                <TableCell>
                                  {paiement.cash_register.cash_register_number}
                                </TableCell>
                                <TableCell>{paiement.cashier.name}</TableCell>
                              </TableRow>
                            )
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                )}
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        {!isProcessing && (
          <div className="flex justify-end gap-3">
            <Button
              onClick={handleDownloadPDF}
              variant="outline"
              className="gap-2 text-gray-700 hover:bg-gray-50"
            >
              <Download className="w-4 h-4" />
              Télécharger PDF
            </Button>
            <Button
              onClick={handlePrint}
              className="gap-2 bg-primary-600 hover:bg-primary-700"
            >
              <Printer className="w-4 h-4" />
              Imprimer le reçu
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentDetail;
