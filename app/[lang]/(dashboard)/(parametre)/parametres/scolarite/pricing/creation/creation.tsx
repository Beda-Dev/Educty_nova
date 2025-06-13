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
import { generatePDFfromRef } from '@/lib/utils'
import { Button } from "@/components/ui/button";
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/components/ui/use-toast";
import { Paiement, PricingData, InstallmentData } from "./data"
import ControlledSelectData from "./componants/SelectData";
import { fetchpricing , fetchInstallment } from "@/store/schoolservice";

export default function TarificationPage() {
  const router = useRouter();
  const {
    levels,
    academicYears,
    assignmentTypes,
    feeTypes,
    academicYearCurrent,
    setPricing,
    settings,
    setInstallments
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
  const [nouvelleDatePaiement, setNouvelleDatePaiement] = useState<Date | undefined>(undefined);
  const [nouveauMontantPaiement, setNouveauMontantPaiement] = useState<string>("");
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [echeancierValide, setEcheancierValide] = useState(false);
  const [isFormExpanded, setIsFormExpanded] = useState(true);
  const printRef = useRef<HTMLDivElement>(null);
  const InstallmentIdCreated : number[] = []

  // Format currency based on settings
  const currency = settings[0]?.currency || "FCFA";

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

  const update = async()=>{
    const Pric = await fetchpricing()
    setPricing(Pric)
    const Install = await fetchInstallment()
    setInstallments(Install) 

  }

  // Calculate remaining amount
  const montantRestant = Math.max(
    0,
    Number.parseInt(amount || "0") -
    (useEcheancier ? paiements.reduce((sum, p) => sum + p.montant, 0) : 0)
  );

  // Format amount with spaces as thousand separators
  const formatMontant = (montant: number) => {
    return new Intl.NumberFormat("fr-FR").format(montant) + ` ${currency}`;
  };

  // Format input value with spaces as thousand separators
  const formatInputAmount = (value: string) => {
    const num = value.replace(/\s/g, '');
    if (num === '') return '';
    return new Intl.NumberFormat("fr-FR").format(parseInt(num));
  };

  // Add payment to schedule
  const ajouterPaiement = () => {
    console.log("Attempting to add payment...");
    if (
      !nouvelleDatePaiement ||
      !nouveauMontantPaiement ||
      Number.parseInt(nouveauMontantPaiement.replace(/\s/g, '')) <= 0
    ) {
      console.log("Invalid payment data");
      return;
    }

    const montant = Number.parseInt(nouveauMontantPaiement.replace(/\s/g, ''));
    if (montant > montantRestant) {
      toast({
        title: "Erreur",
        description: "Le montant saisi dépasse le montant restant",
        color: "destructive",
      });
      console.log("Payment amount exceeds remaining amount");
      return;
    }

    const nouveauPaiement: Paiement = {
      id: Date.now().toString(),
      date: nouvelleDatePaiement,
      montant: montant,
    };

    setPaiements([...paiements, nouveauPaiement]);
    setNouvelleDatePaiement(undefined);
    setNouveauMontantPaiement("");
    setCalendarOpen(false);
    console.log("Payment added successfully");
  };

  // Remove payment from schedule
  const supprimerPaiement = (id: string) => {
    console.log(`Removing payment with id: ${id}`);
    setPaiements(paiements.filter((p) => p.id !== id));
  };

  // Validate payment schedule
  const validerEcheancier = () => {
    console.log("Validating payment schedule");
    setEcheancierValide(true);
  };

  // Return to modification mode
  const retourModification = () => {
    console.log("Returning to modification mode");
    setEcheancierValide(false);
  };

  // Generate PDF for print or download
  const generatePDF = async (action: "download" | "print") => {
    console.log(`Generating PDF for ${action}`);
    if (!printRef.current) {
      console.error("Print ref not available");
      return;
    }

    setIsProcessing(true);

    try {
      await generatePDFfromRef(printRef, "tarification", action);
      console.log("PDF generated successfully");
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la génération du PDF",
        color: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Check if form is valid
  const isFormValid = () => {
    const valid = (
      label.trim() &&
      amount.trim() &&
      Number(amount.replace(/\s/g, '')) > 0 &&
      selectedLevelId !== null &&
      assignmentTypeId !== null &&
      academicYearId !== null &&
      feeTypeId !== null &&
      (!useEcheancier || (paiements.length > 0 && montantRestant === 0))
    );

    console.log(`Form validation result: ${valid}`);
    return valid;
  };

  // Rollback created pricing and installments if error occurs
  const rollbackCreation = async (pricingId: number) => {
    console.log(`🔁 Starting rollback for pricing ID: ${pricingId}`);
  
    const failedInstallments: number[] = [];
  
    try {
      if (!Array.isArray(InstallmentIdCreated)) {
        throw new Error("InstallmentIdCreated must be an array");
      }
  
      // Suppression individuelle avec gestion d'erreurs par ID
      for (const id of InstallmentIdCreated) {
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/installment/${id}`, {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
            },
          });
  
          if (!response.ok) {
            console.warn(`⚠️ Failed to delete installment ID: ${id}`);
            failedInstallments.push(id);
          } else {
            console.log(`✅ Deleted installment ID: ${id}`);
          }
        } catch (err) {
          console.warn(`❌ Error deleting installment ID: ${id}`, err);
          failedInstallments.push(id);
        }
      }
  
      // Suppression du pricing uniquement si on a pu traiter tous les installments
      const deletePricingResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/pricing/${pricingId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
  
      if (!deletePricingResponse.ok) {
        throw new Error(`❌ Failed to delete pricing with ID: ${pricingId}`);
      }
  
      if (failedInstallments.length > 0) {
        console.warn(`⚠️ Rollback completed with errors. Failed installment deletions:`, failedInstallments);
      } else {
        console.log("✅ Rollback completed successfully");
      }
  
    } catch (error) {
      console.error("🚨 Critical error during rollback:", error);
      throw error;
    }
  };
  
  

  // Handle form submission
  const handleSubmit = async () => {
    console.log("Starting form submission...");
    if (!isFormValid()) {
      toast({
        title: "Erreur de validation",
        description: "Veuillez remplir tous les champs correctement.",
        color: "destructive",
      });
      console.log("Form validation failed");
      return;
    }

    setIsSubmitting(true);
    let pricingId: number | null = null;

    try {
      // Prepare pricing data
      const pricingData: PricingData = {
        assignment_type_id: assignmentTypeId!,
        academic_years_id: academicYearId!,
        level_id: selectedLevelId!,
        fee_type_id: feeTypeId!,
        label: label,
        amount: amount.replace(/\s/g, ''),
      };

      console.log("Sending pricing data:", pricingData);

      // Create pricing
      const pricingResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/pricing`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(pricingData),
      });

      if (!pricingResponse.ok) {
        const errorData = await pricingResponse.json();
        throw new Error(errorData.message || "Erreur lors de l'ajout de la tarification");
      }

      const pricingResult = await pricingResponse.json();
      pricingId = pricingResult.id;
      console.log("Pricing created successfully with ID:", pricingId);

      // If payment schedule is used, create installments sequentially
      if (useEcheancier && paiements.length > 0) {
        console.log("Creating installments...");
        
        try {
          for (let i = 0; i < paiementsTries.length; i++) {
            const paiement = paiementsTries[i];
            const installmentData: InstallmentData = {
              pricing_id: pricingResult.id,
              amount_due: paiement.montant.toString(),
              due_date: format(paiement.date, "yyyy-MM-dd"),
              status: `${i + 1}er versement`,
            };

            console.log(`Creating installment ${i + 1}:`, installmentData);
            
            const installmentResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/installment`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(installmentData),
            });
            const installmentResult = await installmentResponse.json();
            

            if (!installmentResponse.ok) {
              const errorData = await installmentResponse.json();
              throw new Error(errorData.message || `Erreur lors de l'ajout du versement ${i + 1}`);
            }

            InstallmentIdCreated.push( Number(installmentResult.id));


            console.log(`Installment ${i + 1} created successfully`);
            update()
          }
        } catch (error) {
          console.error("Error creating installment:", error);
          if (pricingId) {
            await rollbackCreation(pricingId);
          }
          throw error;
        }
      }

      setPricing(pricingResult);

      toast({
        title: "Succès",
        description: "La tarification a été enregistrée avec succès.",
      });
      console.log("Form submitted successfully");

      if (useEcheancier) {
        setEcheancierValide(true);
      } else {
        router.back();
      }
    } catch (error) {
      console.error("Error during submission:", error);
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Une erreur est survenue lors de l'enregistrement.",
        color: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Sort payments by date
  const paiementsTries = [...paiements].sort(
    (a, b) => a.date.getTime() - b.date.getTime()
  );

  // Validated payment schedule view
  if (echeancierValide) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-background rounded-lg border p-6"
        >
          <div className="mb-6">
            <h1 className="text-xl font-bold text-skyblue">
              Échéancier de Paiement Validé
            </h1>
            <p className="text-lg text-muted-foreground">
              {label} - Montant total:{" "}
              <span className="font-semibold">
                {formatMontant(Number.parseInt(amount.replace(/\s/g, '')))}
              </span>
            </p>
          </div>
          
          <div ref={printRef} className="space-y-6">
            {/* Establishment header for print */}
            <div className="hidden print:block space-y-2 border-b pb-4 mb-4">
              {settings[0]?.establishment_logo && (
                <img 
                  src={settings[0].establishment_logo} 
                  alt="Logo" 
                  className="h-16 mx-auto"
                />
              )}
              <h2 className="text-xl font-bold text-center">
                {settings[0]?.establishment_name || "Établissement"}
              </h2>
              {settings[0]?.approval_number && (
                <p className="text-sm text-center">
                  N° Approbation: {settings[0].approval_number}
                </p>
              )}
              {settings[0]?.address && (
                <p className="text-sm text-center">
                  {settings[0].address}
                </p>
              )}
              <div className="flex justify-center gap-4 text-sm">
                {settings[0]?.establishment_phone_1 && (
                  <span>Tél: {settings[0].establishment_phone_1}</span>
                )}
                {settings[0]?.email && (
                  <span>Email: {settings[0].email}</span>
                )}
              </div>
            </div>

            <Table className="border rounded-lg">
              <TableHeader className="bg-muted">
                <TableRow>
                  <TableHead className="font-bold">Date</TableHead>
                  <TableHead className="font-bold">Montant</TableHead>
                  <TableHead className="font-bold">Solde restant</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paiementsTries.map((paiement, index) => {
                  const soldeAvant =
                    Number.parseInt(amount.replace(/\s/g, '')) -
                    paiementsTries
                      .slice(0, index)
                      .reduce((sum, p) => sum + p.montant, 0);

                  const soldeApres = soldeAvant - paiement.montant;

                  return (
                    <TableRow
                      key={paiement.id}
                      className="hover:bg-muted/50"
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

            <div className="space-y-4 p-4 bg-muted/20 rounded-lg">
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
                <span className={
                  montantRestant > 0
                    ? "text-destructive font-bold"
                    : "text-success font-bold"
                }>
                  {formatMontant(montantRestant)}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex gap-4 justify-end border-t pt-4 mt-6">
          <Button variant="outline" onClick={() => router.push("/parametres/scolarite/pricing")}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Retour
            </Button>
          <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    color='indigodye'
                    onClick={retourModification}
                    disabled={isProcessing}
                  >
                   Nouvelle Tarification
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Ajouter une nouvelle tarification</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
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
          </div>
        </motion.div>
      </div>
    );
  }

  // Main form view
  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-background rounded-lg border p-6"
      >
        <div className="mb-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-skyblue">
              Définir une tarification
            </h1>

          </div>
        </div>

        <div className="space-y-8">
          {/* Pricing Information Section */}
          <div className="border rounded-lg overflow-hidden">
            <div
              className="cursor-pointer hover:bg-muted/10 transition-colors p-6"
              onClick={() => setIsFormExpanded(!isFormExpanded)}
            >
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-semibold">Informations de la tarification</h2>
                  <p className="text-muted-foreground">
                    Définissez les détails de la tarification
                  </p>
                </div>
                {isFormExpanded ? (
                  <ChevronUp className="h-5 w-5" />
                ) : (
                  <ChevronDown className="h-5 w-5" />
                )}
              </div>
            </div>
            
            <AnimatePresence>
              {isFormExpanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="p-6 pt-0">
                    <ScrollArea className="h-auto max-h-[500px]">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="label">Libellé</Label>
                          <Input
                            id="label"
                            type="text"
                            placeholder="ex : Tarification inscription"
                            value={label}
                            onChange={(e) => setLabel(e.target.value)}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="amount">Montant ({currency})</Label>
                          <Input
                            id="amount"
                            type="text"
                            placeholder="ex : 1 000 000"
                            value={formatInputAmount(amount)}
                            onChange={(e) => {
                              const value = e.target.value.replace(/\s/g, '');
                              if (value === '' || /^\d+$/.test(value)) {
                                setAmount(value);
                              }
                            }}
                            onKeyDown={(e) => {
                              if (e.key === '-' || e.key === 'e' || e.key === 'E') {
                                e.preventDefault();
                              }
                            }}
                            className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Niveau</Label>
                          <ControlledSelectData
                            datas={levels}
                            onSelect={setSelectedLevelId}
                            placeholder="Choisir un niveau"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Type d'affectation</Label>
                          <ControlledSelectData
                            datas={assignmentTypes}
                            onSelect={setAssignmentTypeId}
                            placeholder="Choisir un type d'affectation"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Année académique</Label>
                          <ControlledSelectData
                            datas={academicYears}
                            onSelect={setAcademicYearId}
                            placeholder="Choisir une année académique"
                            defaultValue={academicYearCurrent?.id}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Type de frais</Label>
                          <ControlledSelectData
                            datas={feeTypes}
                            onSelect={setFeeTypeId}
                            placeholder="Choisir un type de frais"
                          />
                        </div>

                        <div className="flex flex-col gap-2 md:col-span-2">
                          <div className="flex items-center justify-between p-4 bg-muted/20 rounded-lg">
                            <Label htmlFor="use-echeancier" className="font-medium">
                              Définir un échéancier de paiement
                            </Label>
                            <Switch
                              id="use-echeancier"
                              checked={useEcheancier}
                              onCheckedChange={setUseEcheancier}
                            />
                          </div>
                        </div>
                      </div>
                    </ScrollArea>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Payment Schedule Section */}
          <AnimatePresence>
            {useEcheancier && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="grid gap-8 md:grid-cols-2"
              >
                {/* Add Payment Form */}
                <div className="border rounded-lg p-6">
                  <div className="mb-4">
                    <h2 className="text-xl font-semibold">Ajouter un paiement</h2>
                    <p className="text-muted-foreground">
                      Définissez les paiements échelonnés
                    </p>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <Label htmlFor="date-paiement">Date du paiement</Label>
                      <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
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
                              format(nouvelleDatePaiement, "PPP", { locale: fr })
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
                        Montant du paiement ({currency})
                      </Label>
                      <Input
                        id="montant-paiement"
                        type="text"
                        placeholder={`Max: ${formatInputAmount(montantRestant.toString())}`}
                        value={formatInputAmount(nouveauMontantPaiement)}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\s/g, '');
                          if (value === '' || /^\d+$/.test(value)) {
                            setNouveauMontantPaiement(value);
                          }
                        }}
                        onKeyDown={(e) => {
                          if (e.key === '-' || e.key === 'e' || e.key === 'E') {
                            e.preventDefault();
                          }
                        }}
                        className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                    </div>
                    
                    <Button
                      onClick={ajouterPaiement}
                      disabled={
                        !nouvelleDatePaiement ||
                        !nouveauMontantPaiement ||
                        Number.parseInt(nouveauMontantPaiement.replace(/\s/g, '')) <= 0
                      }
                      className="w-full"
                    >
                      <Plus className="mr-2 h-4 w-4" /> Ajouter ce paiement
                    </Button>
                  </div>
                </div>

                {/* Payment Summary */}
                <div className="border rounded-lg p-6">
                  <div className="mb-4">
                    <h2 className="text-xl font-semibold">Récapitulatif de l'échéancier</h2>
                    <p className="text-muted-foreground">
                      {amount ? (
                        <>
                          Montant total:{" "}
                          <span className="font-semibold">
                            {formatMontant(Number.parseInt(amount.replace(/\s/g, '')))}
                          </span>
                        </>
                      ) : (
                        "Veuillez saisir un montant total"
                      )}
                    </p>
                  </div>
                  
                  {paiements.length > 0 ? (
                    <div className="space-y-6">
                      <Table>
                        <TableHeader className="bg-muted">
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
                              className="hover:bg-muted/50"
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
                                  onClick={() => supprimerPaiement(paiement.id)}
                                  className="text-destructive hover:text-destructive/80"
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
                                  Number.parseInt(amount.replace(/\s/g, '') || "1")) *
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
                                Number.parseInt(amount.replace(/\s/g, '') || "1")) *
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
                          <span className={
                            montantRestant > 0
                              ? "text-destructive font-bold"
                              : "text-success font-bold"
                          }>
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
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex justify-around gap-4 pt-6"
          >
            <Button 
              variant="outline" 
              onClick={() => router.push("/parametres/scolarite/pricing")}
            >
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
        </div>
      </motion.div>
    </div>
  );
}