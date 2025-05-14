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
      setStudent(findStudentById(registration.student_id, students));
    }
  }, [registration.student_id, students]);

  const generatePDF = async (action: "download" | "print") => {
    if (!printRef.current) return;

    setIsProcessing(true);
    const toastId = toast.loading("Génération du PDF...");

    try {
      const pdf = new jsPDF("p", "mm", "a4");
      const canvas = await html2canvas(printRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
      });

      const imgData = canvas.toDataURL("image/png");
      const { height, width } = canvas;
      const pdfHeight = (height * 190) / width;

      pdf.addImage(imgData, "PNG", 10, 10, 190, pdfHeight);
      pdf.addImage(imgData, "PNG", 10, pdfHeight + 20, 190, pdfHeight);

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
    <div className="mx-auto w-full flex flex-col items-center p-4">
      <div
        ref={printRef}
        className="bg-white p-8 border"
        style={{ width: "794px", minHeight: "1123px" }}
      >
        <ReceiptBlock
          title="ORIGINAL"
          registration={registration}
          student={student}
          finance={finance}
        />
        <div className="border-t-2 border-dashed my-8" />
        <ReceiptBlock
          title="DUPLICATA"
          registration={registration}
          student={student}
          finance={finance}
        />
      </div>

      <div className="flex gap-4 mt-6">
        <Button onClick={() => generatePDF("download")} disabled={isProcessing}>
          <Download className="mr-2 h-4 w-4" /> Télécharger
        </Button>
        <Button
          variant="outline"
          onClick={() => generatePDF("print")}
          disabled={isProcessing}
        >
          <Printer className="mr-2 h-4 w-4" /> Imprimer
        </Button>
      </div>
    </div>
  );
};

export default RegistrationFinal;

interface ReceiptBlockProps {
  title: string;
  registration: Registration;
  student: Student | null;
  finance: { fees: { label: string; amount: number }[]; total: number };
}

const ReceiptBlock = ({
  title,
  registration,
  student,
  finance,
}: ReceiptBlockProps) => (
  <>
    {/* En-tête */}
    <div className="flex justify-between items-center border-b pb-4 mb-6">
      <div className="flex items-center gap-3">
        <SiteLogo className="w-10 h-10 text-primary" />
        <div>
          <h1 className="text-xl font-bold">ÉCOLE ÉDUCTY</h1>
          <p className="text-sm text-gray-600">
            BP 1234 Abidjan | Tél: +225 XX XX XX XX
          </p>
          <p className="text-sm text-gray-600">
            Année académique : {registration.academic_year.label}
          </p>
        </div>
      </div>
      <div className="text-right">
        <h2 className="text-lg font-semibold">REÇU D'INSCRIPTION</h2>
        <p className="text-sm text-gray-600">
          N°{" "}
          {generationNumero(
            registration.id,
            registration.created_at,
            "inscription"
          )}
        </p>
        {title === "ORIGINAL" && (
          <p className="text-xs font-medium mt-1">{title}</p>
        )}
      </div>
    </div>

    {/* Infos élève */}
    <div className="grid grid-cols-2 gap-y-2 text-sm mb-6">
      <Info
        label="Nom complet"
        value={`${student?.name} ${student?.first_name}`}
      />
      <Info label="Matricule" value={student?.registration_number} />
      <Info label="Sexe" value={student?.sexe} />
      <Info label="Classe" value={registration.classe.label} />
      <Info
        label="Date d'inscription"
        value={new Date(registration.registration_date).toLocaleDateString(
          "fr-FR"
        )}
      />
    </div>

    {/* Frais affichés SANS TABLE */}
    <div className="mb-6">
      <h3 className="text-base font-bold mb-3">DÉTAIL DES FRAIS</h3>
      <ul className="text-sm space-y-1">
        {finance.fees.map((fee, index) => (
          <li key={index} className="flex justify-between border-b py-1">
            <span>{fee.label}</span>
            <span>{fee.amount.toLocaleString("fr-FR")} FCFA</span>
          </li>
        ))}
      </ul>
      <div className="flex justify-end mt-4 text-base font-bold">
        <div className="border-t w-64 pt-2 flex justify-between">
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
    <div className="text-center text-xs  pt-4 border-t">
      <p>
        Reçu établi le{" "}
        {new Date(registration.registration_date).toLocaleDateString("fr-FR")}
      </p>
      <p className="text-gray-600 mt-1">
        Merci pour votre confiance - Éducty © {new Date().getFullYear()}
      </p>
    </div>
  </>
);

const Info = ({
  label,
  value,
}: {
  label: string;
  value?: string | number | null;
}) => (
  <p>
    <span className="font-semibold">{label} :</span>{" "}
    <span className="text-gray-800">{value || "N/A"}</span>
  </p>
);

const Signature = ({ label }: { label: string }) => (
  <div className="text-sm text-gray-700 text-center mt-4">
    <div className="border-t border-gray-400 h-12 w-56 mx-auto mb-1" />
    <span>{label}</span>
  </div>
);
