"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Download, Printer, FileSpreadsheet } from "lucide-react";
import { PaymentSchedule } from "./payment-schedule";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import * as XLSX from "xlsx";
import { Separator } from "@/components/ui/separator";
import { FeeType, Pricing, Level } from "@/lib/interface";
import { useSchoolStore } from "@/store";
import { motion, AnimatePresence } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "./fonction";
import { toast } from "sonner";

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export default function LevelInstallement({
  params,
}: {
  params: { id: string };
}) {
  const { levels, feeTypes, assignmentTypes, pricing, installements } =
    useSchoolStore();
  const router = useRouter();
  const printRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const [pricingData, setPricingData] = useState<Pricing[]>([]);
  const [levelInfo, setLevelInfo] = useState<Level | null>(null);
  const [activeAssignmentType, setActiveAssignmentType] = useState("affecté");
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const levelId = Number(params.id);
    const level = levels.find((l) => l.id === levelId);

    if (level) setLevelInfo(level);

    const enrichedPricing = pricing
      .filter((p) => p.level_id === levelId)
      .map((p) => ({
        ...p,
        installments: installements.filter((i) => i.pricing_id === p.id),
      }));

    setPricingData(enrichedPricing);
    setIsLoading(false);
  }, [levels, pricing, installements, params.id]);

  const handlePrint = async (assignmentType: string, feeTypeId: number) => {
    const id = `schedule-${assignmentType}-${feeTypeId}`;
    const content = printRefs.current[id];

    if (!content) return;

    setIsProcessing(true);
    const toastId = toast.loading("Préparation de l'impression...");

    try {
      const pdf = new jsPDF("p", "mm", "a4");
      const canvas = await html2canvas(content, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
      });

      const imgData = canvas.toDataURL("image/png");
      const { height, width } = canvas;
      const pdfHeight = (height * 190) / width;

      pdf.addImage(imgData, "PNG", 10, 10, 190, pdfHeight);

      const blob = pdf.output("blob");
      const url = URL.createObjectURL(blob);
      const printWindow = window.open(url, "_blank");

      if (printWindow) {
        printWindow.onload = () => {
          printWindow.print();
          toast.success("Impression prête", { id: toastId });
        };
      }
    } catch (error) {
      toast.error("Erreur lors de la préparation de l'impression", {
        id: toastId,
      });
      console.error("Erreur impression:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownloadPDF = async (
    assignmentType: string,
    feeTypeId: number
  ) => {
    const id = `schedule-${assignmentType}-${feeTypeId}`;
    const content = printRefs.current[id];

    if (!content) return;

    setIsProcessing(true);
    const toastId = toast.loading("Génération du PDF...");

    try {
      const pdf = new jsPDF("p", "mm", "a4");
      const canvas = await html2canvas(content, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
      });

      const imgData = canvas.toDataURL("image/png");
      const { height, width } = canvas;
      const pdfHeight = (height * 190) / width;

      pdf.addImage(imgData, "PNG", 10, 10, 190, pdfHeight);

      const feeType = feeTypes.find((ft) => ft.id === feeTypeId);
      pdf.save(
        `echeancier-${levelInfo?.label}-${assignmentType}-${feeType?.slug}.pdf`
      );
      toast.success("PDF généré avec succès", { id: toastId });
    } catch (error) {
      toast.error("Erreur lors de la génération du PDF", { id: toastId });
      console.error("Erreur PDF:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExportExcel = (assignmentType: string, feeTypeId: number) => {
    const data = pricingData.find(
      (p) =>
        p.assignment_type.label === assignmentType &&
        p.fee_type_id === feeTypeId
    );

    if (!data || !data.installments) return;

    setIsProcessing(true);
    const toastId = toast.loading("Génération du fichier Excel...");

    try {
      // Helper to generate a label for each installment
      const installmentLabel = (index: number) => `Échéance ${index + 1}`;

      const excelData = data.installments.map((installment, index) => ({
        "N°": index + 1,
        Libellé: installmentLabel(index),
        "Type de frais": data.fee_type.label,
        "Montant dû": `${Number(installment.amount_due).toLocaleString(
          "fr-FR"
        )} FCFA`,
        "Date d'échéance": new Date(installment.due_date).toLocaleDateString(
          "fr-FR"
        ),
      }));

      const worksheet = XLSX.utils.json_to_sheet(excelData);

      // Style des en-têtes
      const headerStyle = {
        font: { bold: true, color: { rgb: "FFFFFF" } },
        fill: { fgColor: { rgb: "3B82F6" } },
        alignment: { horizontal: "center" },
      };

      // Appliquer le style aux en-têtes
      for (let i = 0; i < Object.keys(excelData[0]).length; i++) {
        const cellRef = XLSX.utils.encode_cell({ r: 0, c: i });
        if (!worksheet[cellRef].s) worksheet[cellRef].s = {};
        Object.assign(worksheet[cellRef].s, headerStyle);
      }

      // Largeurs de colonnes automatiques
      const colWidths = Object.keys(excelData[0]).map((key) => ({
        wch: Math.max(
          key.length,
          ...excelData.map((row) => String(row[key as keyof typeof row]).length)
        ),
      }));
      worksheet["!cols"] = colWidths;

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Échéancier");

      const feeType = feeTypes.find((ft) => ft.id === feeTypeId);
      XLSX.writeFile(
        workbook,
        `echeancier-${levelInfo?.label}-${assignmentType}-${feeType?.slug}.xlsx`
      );
      toast.success("Fichier Excel généré", { id: toastId });
    } catch (error) {
      toast.error("Erreur lors de la génération du fichier Excel", {
        id: toastId,
      });
      console.error("Erreur Excel:", error);
    } finally {
      setIsProcessing(false);
    }
  };
  const calculateTotalByAssignmentType = (assignmentType: string) => {
    return pricingData
      .filter((p) => p.assignment_type.label === assignmentType)
      .reduce((total, pricing) => total + Number(pricing.amount), 0);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-10 space-y-8">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-full" />
          <Skeleton className="h-9 w-64" />
        </div>

        <Tabs defaultValue="affecté">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </TabsList>
        </Tabs>

        <div className="space-y-6">
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-80 w-full" />
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
      className="container mx-auto py-10"
    >
      <motion.div variants={fadeIn} className="flex items-center mb-8 gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => router.push("/parametres/caisse/echeanciers_paiement")}
          className="rounded-full"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-3xl font-bold">
          Échéanciers de paiements -{" "}
          <span className="text-skyblue">{levelInfo?.label || "Niveau"}</span>
        </h1>
      </motion.div>

      <motion.div variants={fadeIn}>
        <Tabs
          defaultValue="affecté"
          className="w-full"
          onValueChange={setActiveAssignmentType}
        >
          <TabsList className="grid w-full max-w-md grid-cols-2 bg-muted/50">
            <TabsTrigger
              value="affecté"
              className="data-[state=active]:bg-primary"
            >
              Affecté
            </TabsTrigger>
            <TabsTrigger
              value="non-affecté"
              className="data-[state=active]:bg-primary"
            >
              Non-affecté
            </TabsTrigger>
          </TabsList>

          <AnimatePresence mode="wait">
            {["affecté", "non-affecté"].map((assignmentType) => (
              <TabsContent
                key={assignmentType}
                value={assignmentType}
                className="mt-6 space-y-8"
              >
                {/* Résumé des montants totaux */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="border-border/50 shadow-sm">
                    <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10">
                      <CardTitle className="flex items-center gap-2">
                        <span className="bg-primary/10 p-2 rounded-lg">
                          <FileSpreadsheet className="h-5 w-5 text-skyblue" />
                        </span>
                        Résumé des frais - {assignmentType}
                      </CardTitle>
                      <CardDescription>
                        Montant total à payer pour tous les types de frais
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {feeTypes.map((feeType) => {
                          const pricing = pricingData.find(
                            (p) =>
                              p.assignment_type.label === assignmentType &&
                              p.fee_type_id === feeType.id
                          );
                          return (
                            <motion.div key={feeType.id} whileHover={{ y: -2 }}>
                              <Card className="border-border/50 hover:shadow-md transition-shadow">
                                <CardContent className="p-4">
                                  <div className="flex items-center justify-between">
                                    <div className="font-medium">
                                      {feeType.label}
                                    </div>
                                    <div className="text-xl font-bold text-skyblue">
                                      {pricing
                                        ? formatCurrency(Number(pricing.amount))
                                        : 0}
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            </motion.div>
                          );
                        })}
                      </div>

                      <Separator className="my-6 bg-border/50" />

                      <div className="flex justify-between items-center bg-muted/30 p-4 rounded-lg">
                        <div className="text-lg font-medium">Montant total</div>
                        <div className="text-2xl font-bold text-skyblue">
                          {formatCurrency(
                            calculateTotalByAssignmentType(assignmentType)
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Échéanciers par type de frais */}
                <AnimatePresence>
                  {feeTypes.map((feeType) => {
                    const pricing = pricingData.find(
                      (p) =>
                        p.assignment_type.label === assignmentType &&
                        p.fee_type_id === feeType.id
                    );

                    if (!pricing) return null;

                    return (
                      <motion.div
                        key={feeType.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        exit={{ opacity: 0 }}
                      >
                        <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow">
                          <CardHeader className="flex flex-row items-center justify-between bg-gradient-to-r from-primary/5 to-primary/10">
                            <div>
                              <CardTitle className="flex items-center gap-2">
                                {feeType.label} - {assignmentType}
                              </CardTitle>
                              <CardDescription>
                                Échéancier de paiement pour {feeType.label}
                              </CardDescription>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  handlePrint(assignmentType, feeType.id)
                                }
                                className="gap-1"
                              >
                                <Printer className="h-4 w-4" />
                                Imprimer
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  handleDownloadPDF(assignmentType, feeType.id)
                                }
                                className="gap-1"
                              >
                                <Download className="h-4 w-4" />
                                PDF
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                color="success"
                                onClick={() =>
                                  handleExportExcel(assignmentType, feeType.id)
                                }
                                className="gap-1"
                              >
                                <FileSpreadsheet className="h-4 w-4" />
                                Excel
                              </Button>
                            </div>
                          </CardHeader>
                          <CardContent className="p-6">
                            <div
                              id={`schedule-${assignmentType}-${feeType.id}`}
                              ref={(el) => {
                                printRefs.current[
                                  `schedule-${assignmentType}-${feeType.id}`
                                ] = el;
                              }}
                            >
                              <PaymentSchedule pricing={pricing} />
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </TabsContent>
            ))}
          </AnimatePresence>
        </Tabs>
      </motion.div>
    </motion.div>
  );
}
