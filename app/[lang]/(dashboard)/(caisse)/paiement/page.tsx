"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { useSchoolStore } from "@/store";
import {
  Payment,
  Student,
  Registration,
  Installment,
  Pricing,
  FeeType,
} from "@/lib/interface";
import { verificationPermission, envoiSms } from "@/lib/fonction";
import { obtenirDonneesCompletesEtudiant } from "./fonction";
import {
  fetchStudents,
  fetchpricing,
  fetchRegistration,
  fetchPayment,
  fetchInstallment,
} from "@/store/schoolservice";
import ErrorPage from "@/app/[lang]/non-Autoriser";

// Components imports
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Loading from "./loading"; // Ensure this is a valid React component
import { DonneesEtudiantFusionnees } from "./fonction";
import {
  CheckIcon,
  InfoIcon,
  Loader2Icon,
  PhoneIcon,
  SearchIcon,
  SquareIcon,
  UserIcon,
  WalletIcon,
} from "lucide-react";

interface PaiementData {
  student_id: number;
  installment_id: number;
  cash_register_id: number;
  cashier_id: number;
  amount: string;
}

const InvoicePage = () => {
  // Hooks and state initialization
  const router = useRouter();
  const {
    academicYearCurrent,
    registrations,
    pricing,
    students,
    installements,
    payments,
    userOnline,
    cashRegisters,
    setPayments,
    setInstallments,
    setStudents,
    setPricing,
    setRegistration,
  } = useSchoolStore();

  const [donneesEtudiant, setDonneesEtudiant] =
    useState<DonneesEtudiantFusionnees | null>(null);
  const [loading, setLoading] = useState(false);
  const [matricule, setMatricule] = useState("");
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [montantsPaiement, setMontantsPaiement] = useState<
    Record<number, string>
  >({});
  const [caisseSelectionnee, setCaisseSelectionnee] = useState<string>("");

  // Permissions check
  const requiredPermissions = {
    view: ["voir paiement"],
    validate: ["valider paiement"],
  };

  const hasViewAccess = verificationPermission(
    { permissionNames: userOnline?.permissionNames || [] },
    requiredPermissions.view
  );

  const hasValidateAccess = verificationPermission(
    { permissionNames: userOnline?.permissionNames || [] },
    requiredPermissions.validate
  );

  // Early return if no permissions
  if (!hasViewAccess && !hasValidateAccess) {
    return (
      <Card className="w-full h-full flex items-center justify-center">
        <ErrorPage />
      </Card>
    );
  }

  // Handler functions
  const handleRecherche = async () => {
    if (!matricule.trim()) {
      toast.error("Veuillez entrer un matricule");
      return;
    }
    const etudiantInscrit = registrations.some(
      (registration) => registration.student.registration_number === matricule
    );

    const etudiantInscritCetteAnnee = registrations.filter((re) => re.academic_year_id === academicYearCurrent.id  ).some(
      (registration) => registration.student.registration_number === matricule
    );

    if (!etudiantInscrit) {
      toast.error("Cet étudiant n'est pas inscrit");
      return;
    }
    if (!etudiantInscritCetteAnnee) {
      toast.error("Cet étudiant n'est pas inscrit cette année");
      return;
    }

    setLoading(true);
    try {
      const resultat = obtenirDonneesCompletesEtudiant(
        academicYearCurrent,
        registrations,
        pricing,
        students,
        installements,
        payments,
        matricule
      );

      if (resultat) {
        setDonneesEtudiant(resultat);
        // Initialize payment amounts
        const initialMontants: Record<number, string> = {};
        resultat.detailsFrais?.forEach((_, index) => {
          initialMontants[index] = "";
        });
        setMontantsPaiement(initialMontants);
        toast.success("Étudiant trouvé");
      } else {
        toast.error("Aucun étudiant trouvé avec ce matricule");
      }
    } catch (error) {
      console.error("Erreur lors de la recherche:", error);
      toast.error("Une erreur est survenue lors de la recherche");
    } finally {
      setLoading(false);
    }
  };

  const handleChangeMontant = (index: number, value: string) => {
    if (!donneesEtudiant) return;

    const resteAPayer = donneesEtudiant.detailsFrais?.[index]?.resteAPayer ?? 0;
    if (value && Number(value) > resteAPayer) {
      toast.error(
        `Le montant ne peut pas dépasser ${resteAPayer.toLocaleString()} CFA`
      );
      return;
    }

    setMontantsPaiement((prev) => ({ ...prev, [index]: value }));
  };

  const calculerTotalPaiement = () => {
    return Object.values(montantsPaiement).reduce((total, montant) => {
      return total + (montant ? Number(montant) : 0);
    }, 0);
  };

  const validerFormulaire = () => {
    const errors: Record<string, string> = {};
    const totalPaiement = calculerTotalPaiement();

    if (totalPaiement <= 0) {
      errors.montant = "Veuillez saisir au moins un montant à payer";
    }

    if (!caisseSelectionnee) {
      errors.caisse = "Veuillez sélectionner une caisse";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePaiement = async () => {
    if (!validerFormulaire() || !donneesEtudiant || !userOnline) return;

    if (!hasValidateAccess) {
      toast.error(
        "vous n'avez pas les autorisations necessaire pour effetuer cette action"
      );
      return;
    }

    try {
      setLoading(true);
      const paiementsAEnvoyer = Object.entries(montantsPaiement)
        .filter(([_, montant]) => montant && Number(montant) > 0)
        .map(([indexStr, montant]) => ({
          student_id: donneesEtudiant.informationsEtudiant.id,
          installment_id:
            donneesEtudiant.detailsFrais?.[Number(indexStr)]?.echeanceIds[0] ??
            0,
          cash_register_id: Number(caisseSelectionnee),
          cashier_id: userOnline.id,
          amount: montant,
        }));

      // Process payments
      await Promise.all(
        paiementsAEnvoyer.map((p) =>
          fetch("/api/payment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(p),
          })
        )
      );

      // Refresh all data
      const [
        newPayments,
        newInstallments,
        newStudents,
        newPricing,
        newRegistrations,
      ] = await Promise.all([
        fetchPayment(),
        fetchInstallment(),
        fetchStudents(),
        fetchpricing(),
        fetchRegistration(),
      ]);

      // Update store
      useSchoolStore.setState({
        payments: newPayments,
        installements: newInstallments,
        students: newStudents,
        pricing: newPricing,
        registrations: newRegistrations,
      });

      // Update student data
      const updatedData = obtenirDonneesCompletesEtudiant(
        academicYearCurrent,
        newRegistrations,
        newPricing,
        newStudents,
        newInstallments,
        newPayments,
        matricule
      );
      setDonneesEtudiant(updatedData);

      // Envoi du SMS de confirmation
      // if (donneesEtudiant.informationsEtudiant.tutors.) {
      //   const messageToSend = `Bonjour ${
      //     donneesEtudiant.informationsEtudiant.tutor_name
      //   } ${
      //     donneesEtudiant.informationsEtudiant.tutor_first_name
      //   } , un paiement de ${calculerTotalPaiement().toLocaleString()} CFA a été enregistré pour l'élève ${
      //     donneesEtudiant.informationsEtudiant.name
      //   }. Le montant restant dû est de ${
      //     updatedData?.resumePaiements?.soldeRestant?.toLocaleString() ||
      //     "inconnu"
      //   } CFA. Merci pour votre confiance.`;
      //   const smsResult = await envoiSms({
      //     phoneNumber: donneesEtudiant.informationsEtudiant.tutor_number,
      //     message: messageToSend,
      //     sender: "Educty Nova",
      //   });

      //   if (!smsResult.success) {
      //     console.error("Échec envoi SMS:", smsResult.error);
      //   }
      // }

      // Reset form
      setMontantsPaiement((prev) =>
        Object.keys(prev).reduce((acc, key) => ({ ...acc, [key]: "" }), {})
      );
      setCaisseSelectionnee("");

      toast.success("Paiement enregistré avec succès !");
      router.push(
        `/paiement/${donneesEtudiant.informationsEtudiant.registration_number}`
      );
    } catch (error) {
      console.error("Erreur:", error);
      toast.error("Échec de l'enregistrement");
    } finally {
      setLoading(false);
    }
  };

  // Loading state
  // Remplacer le loading actuel par :
  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center space-x-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-4 w-[200px]" />
          </div>
        </div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </div>
    );
  }

  // Main render
  return (
    <div className="invoice-wrapper mt-6">
      <div className="grid grid-cols-12 gap-6">
        {/* Student Payment Section */}
        <Card className="col-span-12 xl:col-span-8">
          <CardHeader className="sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex-1">
              <div className="relative max-w-md">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Entrez le matricule de l'étudiant"
                  value={matricule}
                  onChange={(e) => setMatricule(e.target.value)}
                  className="pl-9"
                  onKeyDown={(e) => e.key === "Enter" && handleRecherche()}
                />
              </div>
            </div>
            <Button onClick={handleRecherche} className="gap-2">
              <SearchIcon className="h-4 w-4" />
              Rechercher
            </Button>
          </CardHeader>
          {!donneesEtudiant ? (
            <CardContent>
              <Alert>
                <AlertDescription>
                  Entrez un matricule et cliquez sur Rechercher pour afficher
                  les données.
                </AlertDescription>
              </Alert>
            </CardContent>
          ) : (
            <>
              <CardContent>
                <PaymentDetailsTable donneesEtudiant={donneesEtudiant} />
              </CardContent>

              <CardFooter className="flex-wrap justify-end gap-4">
                <PaymentDialog
                  donneesEtudiant={donneesEtudiant}
                  montantsPaiement={montantsPaiement}
                  handleChangeMontant={handleChangeMontant}
                  calculerTotalPaiement={calculerTotalPaiement}
                  cashRegisters={cashRegisters}
                  caisseSelectionnee={caisseSelectionnee}
                  setCaisseSelectionnee={setCaisseSelectionnee}
                  formErrors={formErrors}
                  handlePaiement={handlePaiement}
                  loading={loading}
                  totalRestant={
                    donneesEtudiant.resumePaiements?.soldeRestant || 0
                  }
                />
              </CardFooter>
            </>
          )}
        </Card>

        {/* Student Information Section */}
        <div className="col-span-12 xl:col-span-4">
          <StudentInfoCard donneesEtudiant={donneesEtudiant} />
        </div>
      </div>
    </div>
  );
};

// Extracted components for better readability
const PaymentDetailsTable = ({
  donneesEtudiant,
}: {
  donneesEtudiant: DonneesEtudiantFusionnees;
}) => (
  <div className="border border-default-300 rounded-md mt-4">
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-default-600 uppercase">
              Type de Frais
            </TableHead>
            <TableHead className="text-default-600 uppercase text-end">
              Montant (CFA)
            </TableHead>
            <TableHead className="text-default-600 uppercase text-end">
              Payé (CFA)
            </TableHead>
            <TableHead className="text-default-600 uppercase text-end">
              Reste (CFA)
            </TableHead>
            <TableHead className="text-default-600 uppercase text-center">
              Statut
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {donneesEtudiant.detailsFrais?.map((frais: any, index: number) => (
            <TableRow key={index}>
              <TableCell className="font-medium">{frais.typeFrais}</TableCell>
              <TableCell className="text-end">
                {frais.montantDu.toLocaleString()} CFA
              </TableCell>
              <TableCell className="text-end">
                {frais.montantPaye.toLocaleString()} CFA
              </TableCell>
              <TableCell className="text-end">
                {frais.resteAPayer.toLocaleString()} CFA
              </TableCell>
              <TableCell className="text-center">
                {frais.resteAPayer > 0 ? (
                  <span className="text-yellow-600">Paiement en attente</span>
                ) : (
                  <span className="text-green-600">Paiement complet</span>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>

    <PaymentSummary donneesEtudiant={donneesEtudiant} />
  </div>
);

const PaymentSummary = ({
  donneesEtudiant,
}: {
  donneesEtudiant: DonneesEtudiantFusionnees;
}) => (
  <div className="flex flex-col sm:items-end gap-y-2 py-5 px-6">
    <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-3">
      <div className="text-sm font-medium text-default-600">Total:</div>
      <Input
        value={`${
          donneesEtudiant.resumePaiements?.montantTotalDu?.toLocaleString() || 0
        } CFA`}
        className="text-xs font-medium text-default-900 rounded w-full sm:w-[148px]"
        readOnly
      />
    </div>
    <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-3">
      <div className="text-sm font-medium text-default-600">Montant Payé:</div>
      <Input
        value={`${
          donneesEtudiant.resumePaiements?.montantTotalPaye?.toLocaleString() ||
          0
        } CFA`}
        className="text-xs font-medium text-default-900 rounded w-full sm:w-[148px]"
        readOnly
      />
    </div>
    <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-3">
      <div className="text-sm font-medium text-default-600">Solde Restant:</div>
      <Input
        value={`${
          donneesEtudiant.resumePaiements?.soldeRestant?.toLocaleString() || 0
        } CFA`}
        className="text-xs font-medium text-default-900 rounded w-full sm:w-[148px]"
        readOnly
      />
    </div>
  </div>
);

const PaymentDialog = ({
  donneesEtudiant,
  montantsPaiement,
  handleChangeMontant,
  calculerTotalPaiement,
  cashRegisters,
  caisseSelectionnee,
  setCaisseSelectionnee,
  formErrors,
  handlePaiement,
  loading,
  totalRestant,
}: {
  donneesEtudiant: DonneesEtudiantFusionnees;
  montantsPaiement: Record<number, string>;
  handleChangeMontant: (index: number, value: string) => void;
  calculerTotalPaiement: () => number;
  cashRegisters: any[];
  caisseSelectionnee: string;
  setCaisseSelectionnee: (value: string) => void;
  formErrors: Record<string, string>;
  handlePaiement: () => void;
  loading: boolean;
  totalRestant: number;
}) => (
  <Dialog>
    <DialogTrigger asChild>
      <Button className="gap-2">
        <WalletIcon className="h-4 w-4" />
        Enregistrer un Paiement
      </Button>
    </DialogTrigger>
    <DialogContent className="max-w-2xl">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <WalletIcon className="h-5 w-5" />
          Nouveau Paiement
        </DialogTitle>
      </DialogHeader>
      <div className="space-y-6">
        <div className="rounded-md border">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead>Type de Frais</TableHead>
                <TableHead className="text-right">Reste à Payer</TableHead>
                <TableHead className="text-right">Montant à Payer</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {donneesEtudiant.detailsFrais?.map(
                (frais: any, index: number) => (
                  <TableRow key={index}>
                    <TableCell>{frais.typeFrais}</TableCell>
                    <TableCell className="text-right font-mono">
                      {frais.resteAPayer.toLocaleString()} CFA
                    </TableCell>
                    <TableCell className="text-right">
                      <Input
                        type="number"
                        value={montantsPaiement[index] || ""}
                        onChange={(e) =>
                          handleChangeMontant(index, e.target.value)
                        }
                        className="w-32 text-right font-mono"
                        placeholder="0"
                      />
                    </TableCell>
                  </TableRow>
                )
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex justify-end items-center gap-4">
          <Label className="text-sm">Total:</Label>
          <div className="w-32 p-2 border rounded-md text-right font-mono bg-muted/50">
            {calculerTotalPaiement().toLocaleString()} CFA
          </div>
        </div>

        <div className="grid gap-4">
          <div>
            <Label>Caisse</Label>
            <Select
              value={caisseSelectionnee}
              onValueChange={setCaisseSelectionnee}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionnez une caisse" />
              </SelectTrigger>
              <SelectContent className="z-[9999]">
                {cashRegisters.map((caisse) => (
                  <SelectItem key={caisse.id} value={String(caisse.id)}>
                    <div className="flex items-center gap-2">
                      <SquareIcon className="h-4 w-4" />
                      Caisse {caisse.cash_register_number}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {formErrors.caisse && (
              <p className="text-sm text-destructive mt-1">
                {formErrors.caisse}
              </p>
            )}
          </div>
        </div>

        {formErrors.montant && (
          <Alert color="destructive">
            <AlertDescription>{formErrors.montant}</AlertDescription>
          </Alert>
        )}

        <Button
          onClick={handlePaiement}
          className="w-full gap-2"
          disabled={totalRestant <= 0 || loading}
        >
          {loading ? (
            <>
              <Loader2Icon className="h-4 w-4 animate-spin" />
              Enregistrement...
            </>
          ) : (
            <>
              <CheckIcon className="h-4 w-4" />
              Enregistrer les Paiements
            </>
          )}
        </Button>
      </div>
    </DialogContent>
  </Dialog>
);

const StudentInfoCard = ({
  donneesEtudiant,
}: {
  donneesEtudiant: DonneesEtudiantFusionnees | null;
}) => (
  <Card className="p-4 h-full">
    <CardHeader className="border-b pb-4">
      <CardTitle className="text-lg font-semibold flex items-center gap-2">
        <UserIcon className="h-5 w-5" />
        Informations de l'Étudiant
      </CardTitle>
    </CardHeader>
    <CardContent className="pt-4">
      {donneesEtudiant ? (
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20 border-2 border-primary">
              {donneesEtudiant.informationsEtudiant.photo?.startsWith(
                "http"
              ) ? (
                <AvatarImage
                  src={donneesEtudiant.informationsEtudiant.photo}
                  alt={`${donneesEtudiant.informationsEtudiant.name}`}
                />
              ) : (
                <AvatarImage
                  src={`${process.env.NEXT_PUBLIC_API_BASE_URL}${donneesEtudiant.informationsEtudiant.photo}`}
                  alt={`${donneesEtudiant.informationsEtudiant.name}`}
                />
              )}
              <AvatarFallback className="text-lg bg-primary/10">
                {donneesEtudiant.informationsEtudiant.name[0]}
                {donneesEtudiant.informationsEtudiant.first_name[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-lg font-medium">
                {donneesEtudiant.informationsEtudiant.name}{" "}
                {donneesEtudiant.informationsEtudiant.first_name}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline">
                  {donneesEtudiant.informationsEtudiant.registration_number}
                </Badge>
                <Badge color="skyblue">
                  {donneesEtudiant.informationsInscription?.classe?.label ||
                    "Non défini"}
                </Badge>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label className="text-sm text-muted-foreground">
                Date de Naissance
              </Label>
              <p className="font-medium">
                {donneesEtudiant.informationsEtudiant.birth_date || "-"}
              </p>
            </div>
            <div className="space-y-1">
              <Label className="text-sm text-muted-foreground">Genre</Label>
              <p className="font-medium">
                {donneesEtudiant.informationsEtudiant.sexe || "-"}
              </p>
            </div>
          </div>

          {/* <div className="space-y-2 pt-2">
            <Label className="text-sm text-muted-foreground">Tuteur</Label>
            <div className="p-3 bg-muted/50 rounded-md">
              <p className="font-medium">
                {donneesEtudiant.informationsEtudiant.tutor_name}{" "}
                {donneesEtudiant.informationsEtudiant.tutor_first_name}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                <PhoneIcon className="inline h-4 w-4 mr-1" />
                {donneesEtudiant.informationsEtudiant.tutor_number ||
                  "Non renseigné"}
              </p>
            </div>
          </div> */}

          {donneesEtudiant.anneeAcademiqueCourante && (
            <div className="space-y-1">
              <Label className="text-sm text-muted-foreground mr-2">
                Année academique
              </Label>
              <Badge variant="outline" className="font-normal">
                {donneesEtudiant.anneeAcademiqueCourante.label}
              </Badge>
            </div>
          )}
        </div>
      ) : (
        <Alert>
          <AlertDescription className="flex items-center gap-2">
            <InfoIcon className="h-4 w-4" />
            Aucune information à afficher. Veuillez rechercher un étudiant.
          </AlertDescription>
        </Alert>
      )}
    </CardContent>
  </Card>
);

export default InvoicePage;
