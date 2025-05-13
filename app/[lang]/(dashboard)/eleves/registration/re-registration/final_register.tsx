"use client";

import { useEffect, useRef, useState } from "react";
import { SiteLogo } from "@/components/svg";
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
import {generationNumero} from "@/lib/fonction"

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
      const pageWidth = 210 - 20;

      const canvas = await html2canvas(printRef.current, {
        scale: 1.5,
        useCORS: true,
        backgroundColor: "#ffffff",
      });

      const imgData = canvas.toDataURL("image/png");
      const { width, height } = canvas;
      const pdfHeight = (height * pageWidth) / width;

      pdf.addImage(imgData, "PNG", 10, 10, pageWidth, pdfHeight);

      if (action === "download") {
        pdf.save(`reçu_inscription_${student?.registration_number}.pdf`);
        toast.success("PDF téléchargé avec succès", { id: toastId });
      } else {
        const blob = pdf.output("blob");
        const url = URL.createObjectURL(blob);
        const win = window.open(url, "_blank");
        if (win) {
          win.onload = () => {
            win.print();
            toast.success("Impression prête", { id: toastId });
          };
        }
      }
    } catch (error) {
      toast.error("Erreur lors de la génération du PDF", { id: toastId });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="w-full flex flex-col items-center justify-center p-4 print:p-0">
      <div ref={printRef} className="bg-white p-4 space-y-6 border w-[794px] min-h-[1123px] mx-auto">
        {[1, 2].map((copy) => (
          <div key={copy} className="space-y-6 border-b last:border-none pb-8">
            <HeaderSection registrationId={registration.id.toString()} created={registration.created_at} />
            <StudentInfo student={student} registration={registration} />
            <FeeDetails finance={finance} />
            <SignatureSection />
            <Footer date={registration.registration_date} />
          </div>
        ))}
      </div>

      <div className="flex gap-4 mt-6 print:hidden">
        <Button onClick={() => generatePDF("download")} disabled={isProcessing} variant="outline" className="gap-2">
          <Download className="w-4 h-4" />
          Télécharger
        </Button>
        <Button onClick={() => generatePDF("print")} disabled={isProcessing} className="gap-2">
          <Printer className="w-4 h-4" />
          Imprimer
        </Button>
      </div>
    </div>
  );
};

// === Composants utilitaires ===

const HeaderSection = ({ registrationId , created }: { registrationId: string , created: string }) => (
  <div className="flex justify-between items-center border-b pb-3">
    <div className="flex items-center gap-3">
      <SiteLogo className="w-10 h-10 text-primary" />
      <div>
        <h1 className="text-sm font-bold text-gray-800">ÉCOLE ÉDUCTY</h1>

        <p className="text-sm text-gray-600">BP 1234 Abidjan | Tél: +225 XX XX XX XX</p>
      </div>
    </div>
    <div className="text-right">
      <h2 className="text-l font-semibold">REÇU D'INSCRIPTION</h2>
      <p className="text-sm text-gray-600">N° {generationNumero(registrationId , created, "inscription" )}</p>
    </div>
  </div>
);

const StudentInfo = ({
  student,
  registration,
}: {
  student: Student | null;
  registration: Registration;
}) => (
  <div>
    <h3 className="text-sm  font-bold mb-2">INFORMATIONS ÉLÈVE</h3>
    <div className="grid grid-cols-2 gap-2 text-xs">

      <Info label="Nom" value={student?.name} />
      <Info label="Prénom" value={student?.first_name} />
      <Info label="Sexe" value={student?.sexe} />
      <Info label="Matricule" value={student?.registration_number} />
      <Info label="Classe" value={registration.classe.label} />
    </div>
  </div>
);

const FeeDetails = ({ finance }: { finance: DataProps["finance"] }) => (
  <div>
    <h3 className="text-sm font-bold mb-2">DÉTAIL DES FRAIS</h3>
    <Table className="border text-xs leading-tight">

      <TableHeader className="bg-gray-100">
        <TableRow>
          <TableHead className="w-[70%] font-bold">Frais  </TableHead>
          <TableHead className="text-right font-bold">MONTANT (FCFA)</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {finance.fees.map((fee, index) => (
          <TableRow key={index}>
            <TableCell>{fee.label}</TableCell>
            <TableCell className="text-right">{fee.amount.toLocaleString("fr-FR")}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
    <div className="flex justify-end mt-3 font-semibold">
      <div className="w-64 border-t pt-2 flex justify-between">
        <span>Total :</span>
        <span>{finance.total.toLocaleString("fr-FR")} FCFA</span>
      </div>
    </div>
  </div>
);

const SignatureSection = () => (
  <div className="grid grid-cols-2 gap-2 mt-4">

    <Signature label="Signature du responsable" />
    <Signature label="Cachet et signature de l'école" />
  </div>
);

const Footer = ({ date }: { date: string }) => (
  <div className="text-center text-[10px] pt-2 border-t mt-3">
    <p>Reçu établi le {new Date(date).toLocaleDateString("fr-FR")}</p>
    <p className="text-gray-600 mt-1">
      Merci pour votre confiance - École Éducty © {new Date().getFullYear()}
    </p>
  </div>
);

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
