"use client";

import { useEffect, useRef, useState } from "react";
import { SiteLogo } from "@/components/svg";
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
import { Download, Printer } from "lucide-react";
import { Registration, Student } from "@/lib/interface";
import { useSchoolStore } from "@/store";
import { findStudentById } from "./fonction";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { toast } from "sonner";

interface DataProps {
  registration: Registration;
  finance: { fees: { label: string; amount: number }[]; total: number };
}

const RegistrationFinal = ({ registration, finance }: DataProps) => {
  const { students } = useSchoolStore();
  const [student, setStudent] = useState<Student | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (registration.student_id && students.length > 0) {
      const foundStudent = findStudentById(registration.student_id, students);
      setStudent(foundStudent);
    }
  }, [registration.student_id, students]);

  const generatePDF = async (action: "download" | "print") => {
    if (!printRef.current) return;

    setIsProcessing(true);
    const toastId = toast.loading("Génération du PDF...");

    try {
      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = 190;

      const canvas = await html2canvas(printRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
      });

      const imgData = canvas.toDataURL("image/png");
      const { height, width } = canvas;
      const pdfHeight = (height * pageWidth) / width;

      // Ajouter le premier reçu
      pdf.addImage(imgData, "PNG", 10, 10, pageWidth, pdfHeight);
      
      // Ajouter le deuxième reçu (duplicata)
      pdf.addImage(imgData, "PNG", 10, pdfHeight + 20, pageWidth, pdfHeight);

      if (action === "download") {
        pdf.save(`reçu_inscription_${student?.registration_number}.pdf`);
        toast.success("PDF téléchargé avec succès", { id: toastId });
      } else {
        const blob = pdf.output("blob");
        const url = URL.createObjectURL(blob);
        const printWindow = window.open(url, "_blank");

        if (printWindow) {
          printWindow.onload = () => {
            printWindow.print();
            toast.success("Impression prête", { id: toastId });
          };
        }
      }
    } catch (error) {
      toast.error("Erreur lors de la génération du PDF", { id: toastId });
      console.error("Erreur PDF:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="mx-auto w-full flex flex-col items-center justify-center p-4 print:p-0">
      {/* Partie imprimable */}
      <div
        ref={printRef}
        className="bg-white p-8 border"
        style={{ width: "794px", minHeight: "1123px", margin: "0 auto" }}
      >
        {/* En-tête école */}
        <div className="flex justify-between items-center border-b pb-4 mb-6">
          <div className="flex items-center gap-3">
            <SiteLogo className="w-10 h-10 text-primary" />
            <div>
              <h1 className="text-xl font-bold text-gray-800">ÉCOLE ÉDUCTY</h1>
              <p className="text-sm text-gray-600">
                BP 1234 Abidjan | Tél: +225 XX XX XX XX
              </p>
            </div>
          </div>
          <div className="text-right">
            <h2 className="text-lg font-semibold">REÇU D'INSCRIPTION</h2>
            <p className="text-sm text-gray-600">N° {registration.id}</p>
            <p className="text-xs mt-1 font-medium">ORIGINAL</p>
          </div>
        </div>

        {/* Infos élève */}
        <div className="mb-8">
          <h3 className="text-base font-bold mb-2">INFORMATIONS ÉLÈVE</h3>
          <div className="grid grid-cols-2 gap-y-2 text-sm">
            <Info label="Nom complet" value={`${student?.name} ${student?.first_name}`} />
            <Info label="Matricule" value={student?.registration_number} />
            <Info label="Sexe" value={student?.sexe} />
            <Info label="Classe" value={registration.classe.label} />
            <Info label="Date d'inscription" value={new Date(registration.registration_date).toLocaleDateString("fr-FR")} />
          </div>
        </div>

        {/* Détails frais */}
        <div className="mb-8" style={{ breakInside: "avoid" }}>
          <h3 className="text-base font-bold mb-3">DÉTAIL DES FRAIS</h3>
          <Table className="border">
            <TableHeader className="bg-gray-100">
              <TableRow>
                <TableHead className="w-[70%] font-bold">LIBELLÉ</TableHead>
                <TableHead className="text-right font-bold">MONTANT (FCFA)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {finance.fees.map((fee, index) => (
                <TableRow key={index}>
                  <TableCell>{fee.label}</TableCell>
                  <TableCell className="text-right">
                    {fee.amount.toLocaleString("fr-FR")}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="flex justify-end mt-4">
            <div className="w-64 border-t-2 border-gray-300 pt-2 font-bold flex justify-between">
              <span>TOTAL :</span>
              <span>{finance.total.toLocaleString("fr-FR")} FCFA</span>
            </div>
          </div>
        </div>

        {/* Signatures */}
        <div className="grid grid-cols-2 gap-6 mt-12">
          <Signature label="Signature du parent" />
          <Signature label="Cachet et signature de l'école" />
        </div>

        {/* Séparateur pour le duplicata */}
        <div className="border-t-2 border-dashed border-gray-400 my-8"></div>

        {/* DUPLICATA */}
        <div className="flex justify-between items-center border-b pb-4 mb-6">
          <div className="flex items-center gap-3">
            <SiteLogo className="w-10 h-10 text-primary" />
            <div>
              <h1 className="text-xl font-bold text-gray-800">ÉCOLE XXXX</h1>
              <p className="text-sm text-gray-600">
                BP 1234 Abidjan | Tél: +225 XX XX XX XX
              </p>
            </div>
          </div>
          <div className="text-right">
            <h2 className="text-lg font-semibold">REÇU D'INSCRIPTION</h2>
            <p className="text-sm text-gray-600">N° {registration.id}</p>
            <p className="text-xs mt-1 font-medium">DUPLICATA</p>
          </div>
        </div>

        {/* Infos élève (duplicata) */}
        <div className="mb-8">
          <h3 className="text-base font-bold mb-2">INFORMATIONS ÉLÈVE</h3>
          <div className="grid grid-cols-2 gap-y-2 text-sm">
            <Info label="Nom complet" value={`${student?.name} ${student?.first_name}`} />
            <Info label="Matricule" value={student?.registration_number} />
            <Info label="Sexe" value={student?.sexe} />
            <Info label="Classe" value={registration.classe.label} />
            <Info label="Date d'inscription" value={new Date(registration.registration_date).toLocaleDateString("fr-FR")} />
          </div>
        </div>

        {/* Détails frais (duplicata) */}
        <div className="mb-8" style={{ breakInside: "avoid" }}>
          <h3 className="text-base font-bold mb-3">DÉTAIL DES FRAIS</h3>
          <Table className="border">
            <TableHeader className="bg-gray-100">
              <TableRow>
                <TableHead className="w-[70%] font-bold">LIBELLÉ</TableHead>
                <TableHead className="text-right font-bold">MONTANT (FCFA)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {finance.fees.map((fee, index) => (
                <TableRow key={index}>
                  <TableCell>{fee.label}</TableCell>
                  <TableCell className="text-right">
                    {fee.amount.toLocaleString("fr-FR")}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="flex justify-end mt-4">
            <div className="w-64 border-t-2 border-gray-300 pt-2 font-bold flex justify-between">
              <span>TOTAL :</span>
              <span>{finance.total.toLocaleString("fr-FR")} FCFA</span>
            </div>
          </div>
        </div>

        {/* Signatures (duplicata) */}
        <div className="grid grid-cols-2 gap-6 mt-12">
          <Signature label="Signature du parent" />
          <Signature label="Cachet et signature de l'école" />
        </div>

        {/* Footer */}
        <div className="text-center text-xs mt-8 pt-4 border-t">
          <p>Reçu établi le {new Date(registration.registration_date).toLocaleDateString("fr-FR")}</p>
          <p className="text-gray-600 mt-1">
            Merci pour votre confiance - École XXXX © {new Date().getFullYear()}
          </p>
        </div>
      </div>

      {/* Boutons action */}
      <div className="flex gap-4 mt-6 print:hidden">
        <Button 
          onClick={() => generatePDF("download")} 
          disabled={isProcessing} 
          variant="outline" 
          className="gap-2"
        >
          <Download className="w-4 h-4" />
          Télécharger
        </Button>
        <Button 
          onClick={() => generatePDF("print")} 
          disabled={isProcessing} 
          className="gap-2"
        >
          <Printer className="w-4 h-4" />
          Imprimer
        </Button>
      </div>
    </div>
  );
};

// Composants utilitaires
const Info = ({ label, value }: { label: string; value?: string | number | null }) => (
  <div>
    <p className="font-medium text-gray-700">{label} :</p>
    <p>{value || "—"}</p>
  </div>
);

const Signature = ({ label }: { label: string }) => (
  <div className="text-center">
    <div className="border-t border-gray-400 pt-1 w-3/4 mx-auto mb-2"></div>
    <p className="text-sm">{label}</p>
  </div>
);

export default RegistrationFinal;