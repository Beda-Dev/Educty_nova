"use client";

import { useState, useRef, useEffect } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  CalendarIcon,
  Plus,
  Trash2,
  Printer,
  Download,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useSchoolStore } from "@/store";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/components/ui/use-toast";
import {Paiement , PricingData , InstallmentData } from "./data"
import ControlledSelectData from "./componants/SelectData";


export default function TarificationPage() {
  const router = useRouter();
  const {
    levels,
    academicYears,
    assignmentTypes,
    feeTypes,
    academicYearCurrent,
    setPricing,
  } = useSchoolStore();

  const [label, setLabel] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [selectedLevelId, setSelectedLevelId] = useState<number | null>(null);
  const [assignmentTypeId, setAssignmentTypeId] = useState<number | null>(null);
  const [academicYearId, setAcademicYearId] = useState<number | null>(null);
  const [feeTypeId, setFeeTypeId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const [useEcheancier, setUseEcheancier] = useState<boolean>(false);
  const [paiements, setPaiements] = useState<Paiement[]>([]);
  const [nouvelleDatePaiement, setNouvelleDatePaiement] = useState<
    Date | undefined
  >(undefined);
  const [nouveauMontantPaiement, setNouveauMontantPaiement] =
    useState<string>("");
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [echeancierValide, setEcheancierValide] = useState(false);
  const [isFormExpanded, setIsFormExpanded] = useState(true);
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (academicYearCurrent && academicYears.length > 0) {
      const currentYear = academicYears.find(
        (y) => y.id === academicYearCurrent.id
      );
      if (currentYear) {
        setAcademicYearId(currentYear.id);
      }
    }
  }, [academicYearCurrent, academicYears]);

  const montantRestant =
    useEcheancier && paiements.length > 0
      ? Number.parseInt(amount || "0") -
        paiements.reduce((sum, p) => sum + p.montant, 0)
      : 0;

  const ajouterPaiement = () => {
    if (
      !nouvelleDatePaiement ||
      !nouveauMontantPaiement ||
      Number.parseInt(nouveauMontantPaiement) <= 0
    ) {
      return;
    }

    const nouveauPaiement: Paiement = {
      id: Date.now().toString(),
      date: nouvelleDatePaiement,
      montant: Number.parseInt(nouveauMontantPaiement),
    };

    setPaiements([...paiements, nouveauPaiement]);
    setNouvelleDatePaiement(undefined);
    setNouveauMontantPaiement("");
    setCalendarOpen(false);
  };

  const supprimerPaiement = (id: string) => {
    setPaiements(paiements.filter((p) => p.id !== id));
  };

  const formatMontant = (montant: number) => {
    return new Intl.NumberFormat("fr-FR").format(montant) + " FCFA";
  };

  const validerEcheancier = () => {
    setEcheancierValide(true);
  };

  const retourModification = () => {
    setEcheancierValide(false);
  };

  const generatePDF = async (action: "download" | "print") => {
    if (!printRef.current) return;

    setIsProcessing(true);

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

      if (action === "download") {
        pdf.save(`echeancier_${label || "tarification"}.pdf`);
        toast({
          title: "Succès",
          description: "PDF téléchargé avec succès",
        });
      } else {
        const blob = pdf.output("blob");
        const url = URL.createObjectURL(blob);
        const printWindow = window.open(url, "_blank");
        if (printWindow) {
          printWindow.onload = () => {
            printWindow.print();
            toast({
              title: "Succès",
              description: "Impression prête",
            });
          };
        }
      }
    } catch (error) {
      toast({
        title: "Erreur lors de la génération du PDF",
        description: "Une erreur est survenue lors de la génération du PDF.",
        color: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const isFormValid = () => {
    if (
      !label.trim() ||
      !amount.trim() ||
      Number(amount) <= 0 ||
      selectedLevelId === null ||
      assignmentTypeId === null ||
      academicYearId === null ||
      feeTypeId === null
    ) {
      return false;
    }

    if (useEcheancier) {
      return paiements.length > 0 && montantRestant === 0;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!isFormValid()) {
      toast({
        title: "Erreur de validation",
        description:
          "Veuillez remplir tous les champs obligatoires correctement.",
        color: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const pricingData: PricingData = {
        assignment_type_id: assignmentTypeId!,
        academic_years_id: academicYearId!,
        level_id: selectedLevelId!,
        fee_type_id: feeTypeId!,
        label: label,
        amount: amount,
      };

      const pricingResponse = await fetch("/api/pricing", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(pricingData),
      });

      if (!pricingResponse.ok) {
        throw new Error("Erreur lors de l'ajout de la tarification");
      }

      const pricingResult = await pricingResponse.json();

      if (useEcheancier && paiements.length > 0) {
        for (let i = 0; i < paiementsTries.length; i++) {
          const paiement = paiementsTries[i];
          const installmentData: InstallmentData = {
            pricing_id: pricingResult.id,
            amount_due: paiement.montant.toString(),
            due_date: format(paiement.date, "yyyy-MM-dd"),
            status: `${i + 1}er versement`,
          };

          const installmentResponse = await fetch("/api/installment", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(installmentData),
          });

          if (!installmentResponse.ok) {
            throw new Error(`Erreur lors de l'ajout du versement ${i + 1}`);
          }
        }
      }

      setPricing(pricingResult);

      toast({
        title: "Succès",
        description: "La tarification a été enregistrée avec succès.",
      });

      if (useEcheancier) {
        setEcheancierValide(true);
      } else {
        router.back();
      }
    } catch (error) {
      console.error("Erreur:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'enregistrement.",
        color: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const paiementsTries = [...paiements].sort(
    (a, b) => a.date.getTime() - b.date.getTime()
  );

  if (echeancierValide) {
    return (
      <Card className="container mx-auto py-8 px-4 max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-3xl text-primary">
                  Échéancier de Paiement Validé
                </CardTitle>
                <CardDescription className="text-lg">
                  {label} - Montant total:{" "}
                  <span className="font-semibold">
                    {formatMontant(Number.parseInt(amount))}
                  </span>
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button color="skyblue" variant="outline" onClick={() => router.push("/parametres/scolarite/frais-scolaires/pricing")}>
                  <ArrowLeft className="mr-2 h-4 w-4" /> Retour
                </Button>
                {/* <Button variant="outline" onClick={retourModification}>
                  <ArrowLeft className="mr-2 h-4 w-4" /> Retour à la
                  modification
                </Button> */}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div ref={printRef}>
              <Table className="border rounded-lg">
                <TableHeader className="bg-secondary">
                  <TableRow>
                    <TableHead className="font-bold">N°</TableHead>
                    <TableHead className="font-bold">Date</TableHead>
                    <TableHead className="font-bold">Montant</TableHead>
                    <TableHead className="font-bold">Solde restant</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paiementsTries.map((paiement, index) => {
                    const soldeAvant =
                      Number.parseInt(amount) -
                      paiementsTries
                        .slice(0, index)
                        .reduce((sum, p) => sum + p.montant, 0);

                    const soldeApres = soldeAvant - paiement.montant;

                    return (
                      <TableRow
                        key={paiement.id}
                        className="hover:bg-secondary/50"
                      >
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>
                          {format(paiement.date, "dd/MM/yyyy")}
                        </TableCell>
                        <TableCell>{formatMontant(paiement.montant)}</TableCell>
                        <TableCell>{formatMontant(soldeApres)}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>

              <div className="mt-6 space-y-4 p-4 bg-secondary/20 rounded-lg">
                <div className="flex justify-between font-medium text-lg">
                  <span>Total payé:</span>
                  <span className="font-bold">
                    {formatMontant(
                      paiements.reduce((sum, p) => sum + p.montant, 0)
                    )}
                  </span>
                </div>
                <div className="flex justify-between font-medium text-lg">
                  <span>Reste à payer:</span>
                  <span
                    className={
                      montantRestant > 0
                        ? "text-red-500 font-bold"
                        : "text-green-500 font-bold"
                    }
                  >
                    {formatMontant(montantRestant)}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex gap-4 justify-end border-t pt-4">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    color="success"
                    variant="outline"
                    onClick={() => generatePDF("print")}
                    disabled={isProcessing}
                  >
                    <Printer className="mr-2 h-4 w-4" /> Imprimer
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Imprimer l'échéancier</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                  color="success"
                    variant="outline"
                    onClick={() => generatePDF("download")}
                    disabled={isProcessing}
                  >
                    <Download className="mr-2 h-4 w-4" /> Télécharger en PDF
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Télécharger l'échéancier au format PDF</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </CardFooter>
        </motion.div>
      </Card>
    );
  }

  return (
    <Card className="container mx-auto py-8 px-4 max-w-6xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-3xl text-primary">
              Définir une tarification
            </CardTitle>
            <Button variant="outline" onClick={() => router.back()}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Retour
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <Card className="shadow-lg mb-8">
            <CardHeader
              className="cursor-pointer hover:bg-secondary/10 transition-colors rounded-t-lg"
              onClick={() => setIsFormExpanded(!isFormExpanded)}
            >
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Informations de la tarification</CardTitle>
                  <CardDescription>
                    Définissez les détails de la tarification
                  </CardDescription>
                </div>
                {isFormExpanded ? (
                  <ChevronUp className="h-5 w-5" />
                ) : (
                  <ChevronDown className="h-5 w-5" />
                )}
              </div>
            </CardHeader>
            <AnimatePresence>
              {isFormExpanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <CardContent>
                    <ScrollArea className="h-auto max-h-[500px]">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
                        <div className="space-y-2">
                          <Label
                            htmlFor="label"
                            className="flex items-center gap-2"
                          >
                            Libellé{" "}
                            <Badge variant="outline" className="text-xs">
                              Obligatoire
                            </Badge>
                          </Label>
                          <Input
                            id="label"
                            type="text"
                            placeholder="ex : Tarification inscription"
                            value={label}
                            onChange={(e) => setLabel(e.target.value)}
                            className="focus-visible:ring-primary"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label
                            htmlFor="amount"
                            className="flex items-center gap-2"
                          >
                            Montant{" "}
                            <Badge variant="outline" className="text-xs">
                              Obligatoire
                            </Badge>
                          </Label>
                          <Input
                            id="amount"
                            type="number"
                            placeholder="ex : 100000"
                            min={1}
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="focus-visible:ring-primary"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label className="flex items-center gap-2">
                            Niveau{" "}
                            <Badge variant="outline" className="text-xs">
                              Obligatoire
                            </Badge>
                          </Label>
                          <ControlledSelectData
                            datas={levels}
                            onSelect={setSelectedLevelId}
                            placeholder="Choisir un niveau"
                          />
                          {!selectedLevelId && (
                            <p className="text-sm text-red-500">
                              Veuillez sélectionner un niveau
                            </p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label className="flex items-center gap-2">
                            Type d'affectation{" "}
                            <Badge variant="outline" className="text-xs">
                              Obligatoire
                            </Badge>
                          </Label>
                          <ControlledSelectData
                            datas={assignmentTypes}
                            onSelect={setAssignmentTypeId}
                            placeholder="Choisir un type d'affectation"
                          />
                          {!assignmentTypeId && (
                            <p className="text-sm text-red-500">
                              Veuillez sélectionner un type d'affectation
                            </p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label className="flex items-center gap-2">
                            Année académique{" "}
                            <Badge variant="outline" className="text-xs">
                              Obligatoire
                            </Badge>
                          </Label>
                          <ControlledSelectData
                            datas={academicYears}
                            onSelect={setAcademicYearId}
                            placeholder="Choisir une année académique"
                            defaultValue={academicYearCurrent?.id}
                          />
                          {!academicYearId && (
                            <p className="text-sm text-red-500">
                              Veuillez sélectionner une année académique
                            </p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label className="flex items-center gap-2">
                            Type de frais{" "}
                            <Badge variant="outline" className="text-xs">
                              Obligatoire
                            </Badge>
                          </Label>
                          <ControlledSelectData
                            datas={feeTypes}
                            onSelect={setFeeTypeId}
                            placeholder="Choisir un type de frais"
                          />
                          {!feeTypeId && (
                            <p className="text-sm text-red-500">
                              Veuillez sélectionner un type de frais
                            </p>
                          )}
                        </div>

                        <div className="flex flex-col gap-2 md:col-span-2">
                          <div className="flex items-center justify-between p-4 bg-secondary/20 rounded-lg">
                            <Label
                              htmlFor="use-echeancier"
                              className="text-lg font-medium"
                            >
                              Définir un échéancier de paiement
                            </Label>
                            <Switch
                              id="use-echeancier"
                              checked={useEcheancier}
                              onCheckedChange={setUseEcheancier}
                              className="data-[state=checked]:bg-primary"
                            />
                          </div>
                        </div>
                      </div>
                    </ScrollArea>
                  </CardContent>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>

          <AnimatePresence>
            {useEcheancier && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="grid gap-8 md:grid-cols-2 mb-8"
              >
                <Card className="shadow-lg">
                  <CardHeader>
                    <CardTitle>Ajouter un paiement</CardTitle>
                    <CardDescription>
                      Définissez les paiements échelonnés
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div className="space-y-3">
                        <Label htmlFor="date-paiement">Date du paiement</Label>
                        <Popover
                          open={calendarOpen}
                          onOpenChange={setCalendarOpen}
                        >
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full justify-start text-left font-normal",
                                !nouvelleDatePaiement && "text-muted-foreground"
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {nouvelleDatePaiement ? (
                                format(nouvelleDatePaiement, "PPP", {
                                  locale: fr,
                                })
                              ) : (
                                <span>Sélectionner une date</span>
                              )}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={nouvelleDatePaiement}
                              onSelect={setNouvelleDatePaiement}
                              initialFocus
                              locale={fr}
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                      <div className="space-y-3">
                        <Label htmlFor="montant-paiement">
                          Montant du paiement (FCFA)
                        </Label>
                        <Input
                          id="montant-paiement"
                          type="number"
                          placeholder="Ex: 100000"
                          value={nouveauMontantPaiement}
                          onChange={(e) =>
                            setNouveauMontantPaiement(e.target.value)
                          }
                          className="focus-visible:ring-primary"
                        />
                      </div>
                      <Button
                      color="indigodye"
                        onClick={ajouterPaiement}
                        disabled={
                          !nouvelleDatePaiement ||
                          !nouveauMontantPaiement ||
                          Number.parseInt(nouveauMontantPaiement) <= 0
                        }
                        className="w-full"
                      >
                        <Plus className="mr-2 h-4 w-4" /> Ajouter ce paiement
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card className="shadow-lg">
                  <CardHeader>
                    <CardTitle>Récapitulatif de l'échéancier</CardTitle>
                    <CardDescription>
                      {amount ? (
                        <>
                          Montant total:{" "}
                          <span className="font-semibold">
                            {formatMontant(Number.parseInt(amount))}
                          </span>
                        </>
                      ) : (
                        "Veuillez saisir un montant total"
                      )}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {paiements.length > 0 ? (
                      <div className="space-y-6">
                        <Table>
                          <TableHeader className="bg-secondary">
                            <TableRow>
                              <TableHead>Date</TableHead>
                              <TableHead>Montant</TableHead>
                              <TableHead className="w-[80px]"></TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {paiementsTries.map((paiement) => (
                              <motion.tr
                                key={paiement.id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="hover:bg-secondary/50"
                              >
                                <TableCell>
                                  {format(paiement.date, "dd/MM/yyyy")}
                                </TableCell>
                                <TableCell>
                                  {formatMontant(paiement.montant)}
                                </TableCell>
                                <TableCell>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() =>
                                      supprimerPaiement(paiement.id)
                                    }
                                    className="text-red-500 hover:text-red-600"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </TableCell>
                              </motion.tr>
                            ))}
                          </TableBody>
                        </Table>

                        <div className="space-y-4">
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Progression:</span>
                              <span>
                                {Math.round(
                                  (paiements.reduce(
                                    (sum, p) => sum + p.montant,
                                    0
                                  ) /
                                    Number.parseInt(amount || "1")) *
                                    100
                                )}
                                %
                              </span>
                            </div>
                            <Progress
                              value={
                                (paiements.reduce(
                                  (sum, p) => sum + p.montant,
                                  0
                                ) /
                                  Number.parseInt(amount || "1")) *
                                100
                              }
                              className="h-2"
                            />
                          </div>

                          <Separator />

                          <div className="flex justify-between font-medium text-lg">
                            <span>Total payé:</span>
                            <span className="font-bold">
                              {formatMontant(
                                paiements.reduce((sum, p) => sum + p.montant, 0)
                              )}
                            </span>
                          </div>
                          <div className="flex justify-between font-medium text-lg">
                            <span>Reste à payer:</span>
                            <span
                              className={
                                montantRestant > 0
                                  ? "text-red-500 font-bold"
                                  : "text-green-500 font-bold"
                              }
                            >
                              {formatMontant(montantRestant)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <p className="mb-4">Aucun paiement défini.</p>
                        <p>
                          Utilisez le formulaire pour ajouter des paiements à
                          votre échéancier.
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex justify-end gap-4"
          >
            <Button variant="outline" onClick={() => router.back()}>
              Annuler
            </Button>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    className="w-full md:w-auto px-8 py-6 text-lg"
                    onClick={handleSubmit}
                    disabled={!isFormValid() || isSubmitting}
                  >
                    {isSubmitting
                      ? "Enregistrement..."
                      : useEcheancier
                      ? "Valider l'échéancier"
                      : "Enregistrer la tarification"}
                  </Button>
                </TooltipTrigger>
                {!isFormValid() && (
                  <TooltipContent side="top">
                    <p>Veuillez remplir tous les champs obligatoires</p>
                    {useEcheancier && montantRestant !== 0 && (
                      <p>
                        Le montant total des paiements doit correspondre au
                        montant défini
                      </p>
                    )}
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
          </motion.div>
        </CardContent>
      </motion.div>
    </Card>
  );
}
