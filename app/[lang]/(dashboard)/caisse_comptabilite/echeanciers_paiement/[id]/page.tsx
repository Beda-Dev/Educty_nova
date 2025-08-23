"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Download, Printer, FileSpreadsheet, Calendar, UserCheck, UserX, Plus } from "lucide-react";
import { PaymentSchedule } from "./payment-schedule";
import { Separator } from "@/components/ui/separator";
import { FeeType, Pricing, Level } from "@/lib/interface";
import { useSchoolStore } from "@/store";
import { motion, AnimatePresence } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "./fonction";
import { generatePDFfromRef, universalExportToExcel } from "@/lib/utils";
import toast from "react-hot-toast";

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
  const { levels, feeTypes, assignmentTypes, pricing, installements, academicYears, academicYearCurrent } =
    useSchoolStore();
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
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

    // Définir l'année académique courante par défaut si disponible
    if (academicYearCurrent?.id && selectedYear === null) {
      setSelectedYear(academicYearCurrent.id);
    }
  }, [levels, params.id, academicYearCurrent, selectedYear]);

  // Filtrer les données en fonction de l'année académique sélectionnée
  useEffect(() => {
    if (!selectedYear) return;

    const levelId = Number(params.id);
    const filteredPricing = pricing
      .filter(p => p.level_id === levelId && p.academic_years_id === selectedYear)
      .map(p => ({
        ...p,
        installments: installements.filter(i => i.pricing_id === p.id),
      }));

    setPricingData(filteredPricing);
    setIsLoading(false);
  }, [pricing, installements, params.id, selectedYear]);

  // Options pour le sélecteur d'année académique
  const academicYearOptions = useMemo(() => {
    return academicYears.map(year => ({
      value: year.id.toString(),
      label: year.label,
    }));
  }, [academicYears]);

  const handleExport = async (
    type: "print" | "download" | "excel",
    assignmentType: string,
    feeTypeId: number
  ) => {
    const id = `schedule-${assignmentType}-${feeTypeId}`;
    const content = printRefs.current[id];

    if (!content) {
      console.error("Élément introuvable pour l'export:", id);
      toast.error("Élément introuvable pour l'export");
      return;
    }

    setIsProcessing(true);
    toast.loading("Préparation de l'export...");

    try {
      if (type === "print" || type === "download") {
        const feeType = feeTypes.find((ft) => ft.id === feeTypeId);
        await generatePDFfromRef(
          { current: content },
          `echeancier-${levelInfo?.label}-${assignmentType}-${feeType?.slug}`,
          type
        );
      } else if (type === "excel") {
        const pricing = pricingData.find(
          (p) =>
            p.assignment_type.label === assignmentType &&
            p.fee_type_id === feeTypeId
        );

        if (!pricing?.installments) {
          toast.error("Aucune donnée d'échéance disponible");
          return;
        }

        const excelData = pricing.installments.map((installment, index) => ({
          "N°": index + 1,
          "Libellé": `Échéance ${index + 1}`,
          "Type de frais": pricing.fee_type.label,
          "Montant dû": Number(installment.amount_due),
          "Date d'échéance": new Date(installment.due_date),
        }));

         universalExportToExcel({
          source: {
            type: "array",
            data: excelData,
          },
          fileName: `echeancier-${levelInfo?.label || 'niveau'}-${assignmentType}-${pricing.fee_type.slug || 'frais'}.xlsx`,
        });
      }
      toast.success("Export réalisé avec succès");
    } catch (error) {
      console.error("Erreur lors de l'export:", error);
      toast.error("Échec de l'export");
    } finally {
      setIsProcessing(false);
      toast.dismiss();
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
      className="container mx-auto py-6"
    >
      <div className="flex flex-col gap-6">
        {/* Header Section */}
        <Card>
          <CardHeader>




            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => router.push("/caisse_comptabilite/echeanciers_paiement")}
                    className="rounded-full h-10 w-10 hover:bg-primary/10"
                  >
                    <ArrowLeft className="h-5 w-5 text-foreground/80" />
                  </Button>
                  <div>
                    <h1 className="text-2xl font-bold tracking-tight">
                      Échéanciers de paiement -{" "}
                      <span className="text-primary">{levelInfo?.label || "Niveau"}</span>
                    </h1>
                    <p className="text-sm text-muted-foreground">
                      Gestion des plans de paiement pour les étudiants
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Select
                    value={selectedYear?.toString() || ""}
                    onValueChange={(value) => setSelectedYear(Number(value))}
                    disabled={academicYears.length === 0}
                  >
                    <SelectTrigger className="w-[280px] h-10">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <SelectValue placeholder="Sélectionnez une année" />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      {academicYearOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                </div>
              </div>

              <Separator className="my-2" />
            </div>
          </CardHeader>
          <CardContent>



            {/* Main Content */}
            <Tabs defaultValue="affecté" className="w-full">
              <TabsList className="grid w-full max-w-xs grid-cols-2 bg-muted/50">
                <TabsTrigger value="affecté" className="gap-2">
                  <UserCheck className="h-4 w-4" />
                  Affecté
                </TabsTrigger>
                <TabsTrigger value="non-affecté" className="gap-2">
                  <UserX className="h-4 w-4" />
                  Non-affecté
                </TabsTrigger>
              </TabsList>

              <div className="mt-6">
                <AnimatePresence mode="wait">
                  {["affecté", "non-affecté"].map((assignmentType) => (
                    <TabsContent key={assignmentType} value={assignmentType}>
                      {/* Summary Card */}
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="mb-8"
                      >
                        <Card className="border-0 shadow-sm">
                          <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-t-lg">
                            <CardTitle className="flex items-center gap-3">
                              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                                <FileSpreadsheet className="h-5 w-5" />
                              </div>
                              <div>
                                <div>Résumé des frais</div>
                                <CardDescription>
                                  Total des montants pour {assignmentType.toLowerCase()}s
                                </CardDescription>
                              </div>
                            </CardTitle>
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
                                  <motion.div
                                    key={feeType.id}
                                    whileHover={{ y: -2 }}
                                    className="cursor-pointer"
                                  >
                                    <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
                                      <CardContent className="p-4">
                                        <div className="flex justify-between items-center">
                                          <div>
                                            <p className="text-sm font-medium text-muted-foreground">
                                              {feeType.label}
                                            </p>
                                            <p className="text-xl font-semibold mt-1">
                                              {pricing ? formatCurrency(Number(pricing.amount)) : "0 FCFA"}
                                            </p>
                                          </div>
                                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                            {feeType.label.charAt(0)}
                                          </div>
                                        </div>
                                      </CardContent>
                                    </Card>
                                  </motion.div>
                                );
                              })}
                            </div>

                            <Separator className="my-6" />

                            <div className="bg-muted/30 p-4 rounded-lg">
                              <div className="flex justify-between items-center">
                                <div>
                                  <p className="text-sm font-medium text-muted-foreground">
                                    Montant total
                                  </p>
                                  <p className="text-2xl font-bold text-primary mt-1">
                                    {formatCurrency(calculateTotalByAssignmentType(assignmentType))}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>

                      {/* Payment Schedules */}
                      <div className="space-y-6">
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
                            >
                              <Card className="border-0 shadow-sm">
                                <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-t-lg">
                                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                    <div>
                                      <CardTitle className="flex items-center gap-2">
                                        {feeType.label}
                                      </CardTitle>
                                      <CardDescription>
                                        Plan de paiement pour les étudiants {assignmentType.toLowerCase()}s
                                      </CardDescription>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleExport("print", assignmentType, feeType.id)}
                                        className="gap-2 h-9"
                                        disabled={isProcessing}
                                      >
                                        <Printer className="h-4 w-4" />
                                        Imprimer
                                      </Button>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleExport("download", assignmentType, feeType.id)}
                                        className="gap-2 h-9"
                                        disabled={isProcessing}
                                      >
                                        <Download className="h-4 w-4" />
                                        PDF
                                      </Button>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleExport("excel", assignmentType, feeType.id)}
                                        className="gap-2 h-9"
                                        disabled={isProcessing}
                                      >
                                        <FileSpreadsheet className="h-4 w-4" />
                                        Excel
                                      </Button>
                                    </div>
                                  </div>
                                </CardHeader>
                                <CardContent className="p-0">
                                  <div
                                    id={`schedule-${assignmentType}-${feeType.id}`}
                                    ref={(el) => {
                                      printRefs.current[`schedule-${assignmentType}-${feeType.id}`] = el;
                                    }}
                                    className="p-6"
                                  >
                                    <PaymentSchedule pricing={pricing} />
                                  </div>
                                </CardContent>
                              </Card>
                            </motion.div>
                          );
                        })}
                      </div>
                    </TabsContent>
                  ))}
                </AnimatePresence>
              </div>
            </Tabs>
          </CardContent>
        </Card>
      </div>


    </motion.div>
  );
}