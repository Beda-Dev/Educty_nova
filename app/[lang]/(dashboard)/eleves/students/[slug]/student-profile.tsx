import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { BadgeCheck, Calendar, FileText, Phone, User, Eye } from "lucide-react";
import Image from "next/image";
import { toast } from "react-hot-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Student,
  AcademicYear,
  AssignmentType,
  Document,
  Payment,
} from "@/lib/interface";
import { useSchoolStore } from "@/store";
import {
  findStudentByMatricule,
  getCompleteStudentData,
  obtenirDonneesCompletesEtudiant,
  DonneesEtudiantFusionnees,
} from "./fonction";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface StudentProfileProps {
  data: Student;
  pay: DonneesEtudiantFusionnees;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "XOF",
    maximumFractionDigits: 0,
  }).format(amount);
};

export default function StudentProfile({ data, pay }: StudentProfileProps) {
  const { academicYearCurrent, pricing } = useSchoolStore();
  const router = useRouter();

  // Formatage de la date de naissance
  const formattedBirthDate = format(new Date(data.birth_date), "dd MMMM yyyy", {
    locale: fr,
  });

  // Obtenir les initiales pour l'avatar fallback
  const initials = `${data.name.charAt(0)}${data.first_name.charAt(
    0
  )}`.toUpperCase();

  // Calculer les informations financières

  const totalPayments = pay.resumePaiements?.montantTotalPaye || 0;
  const totalAmountDue = pay.resumePaiements?.montantTotalDu || 0;
  const paymentCurrent = pay.detailsFrais || [];

  const paymentProgress = pay.resumePaiements?.pourcentageRecouvrement || 0;

  const hasDocuments = data.documents.length > 0;
  const hasPayments = data.payments.length > 0;
  const hasRegistrations = data.registrations.length > 0;

  // fonction pour telecharger le document

  const handleDownload = async (filePath: string | null, fileName: string) => {
    if (!filePath) return;

    // Vérifier si le chemin est absolu ou relatif
    const isAbsolutePath =
      filePath.startsWith("http://") || filePath.startsWith("https://");
    const downloadUrl = isAbsolutePath
      ? filePath
      : `${process.env.NEXT_PUBLIC_API_BASE_URL}${filePath}`;

    // Créer un lien temporaire pour le téléchargement
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = fileName;
    link.target = "_blank"; // Ouvre dans un nouvel onglet
    link.rel = "noopener noreferrer";

    // Afficher un toast de confirmation
    toast.promise(
      new Promise<void>((resolve, reject) => {
        try {
          // Simuler le clic pour déclencher le téléchargement
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          resolve();
        } catch (error) {
          reject(error);
        }
      }),
      {
        loading: "Préparation du téléchargement...",
        success: "Téléchargement démarré dans une nouvelle fenêtre",
        error: "Erreur lors du démarrage du téléchargement",
      }
    );
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Section principale avec informations personnelles et résumé financier */}
      <div className="flex flex-col md:flex-row gap-6">
        {/* Informations personnelles */}
        <Card className="flex-1">
          <CardHeader className="pb-2">
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-2xl font-bold">
                  {data.first_name} {data.name}
                </CardTitle>
                <CardDescription>
                  Matricule: {data.registration_number}
                </CardDescription>
              </div>
              <Badge
                variant="soft"
                color={data.active ? "default" : "destructive"}
                className="ml-auto"
              >
                {data.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-shrink-0">
                <Avatar className="h-24 w-24">
                  {data.photo ? (
                    <Image
                      src={typeof data.photo === 'string' ? data.photo : ''}
                      alt={`${data.name} ${data.first_name}`}
                      width={80}
                      height={80}
                      className="school-logo"
                    />
                  ) : (
                    <AvatarFallback className="text-lg font-semibold">
                      {initials}
                    </AvatarFallback>
                  )}
                </Avatar>
              </div>

              <div className="space-y-3 flex-1">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Sexe:</span>
                  <span className="capitalize">{data.sexe}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    Date de naissance:
                  </span>
                  <span>{formattedBirthDate}</span>
                </div>

                <div className="flex items-center gap-2">
                  <BadgeCheck className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    Type d'affectation:
                  </span>
                  <span>{data.assignment_type.label}</span>
                </div>

                <Separator className="my-3" />

              </div>
            </div>
          </CardContent>
        </Card>

        {/* Résumé financier */}
        <Card className="w-full md:w-96 bg-white shadow-sm rounded-xl border border-gray-100">
          <CardHeader className="border-b border-gray-100 px-6 py-4">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-lg font-semibold text-gray-900">
                  Résumé financier
                </CardTitle>
                <CardDescription className="text-sm text-gray-500 mt-1">
                  Année académique {academicYearCurrent.label}
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="text-skyblue-600 border-primary-300 "
                onClick={() =>
                  router.push(`/caisse_comptabilite/resume_financie/${data.id}`)
                }
              >
                Voir le résumé financier
              </Button>
            </div>
          </CardHeader>

          <CardContent className="p-6 space-y-6">
            {/* Progress Section */}
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Total dû</span>
                <span className="font-medium text-gray-900">
                  {formatCurrency(totalAmountDue)}
                </span>
              </div>
              <div className="relative pt-1">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-skyblue-600 bg-primary-100">
                      Progression
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-semibold inline-block text-skyblue-600">
                      {Math.min(paymentProgress, 100)}%
                    </span>
                  </div>
                </div>
                <div className="overflow-hidden h-2 mt-2 rounded-full bg-gray-200">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-primary-500 to-primary-300 transition-all duration-500 ease-in-out"
                    style={{ width: `${Math.min(paymentProgress, 100)}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm font-medium text-gray-500">Total payé</p>
                <p className="text-xl font-bold text-gray-900 mt-1">
                  {formatCurrency(totalPayments)}
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm font-medium text-gray-500">Paiements</p>
                <p className="text-xl font-bold text-gray-900 mt-1">
                  {paymentCurrent.length}
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm font-medium text-gray-500">Documents</p>
                <p className="text-xl font-bold text-gray-900 mt-1">
                  {data.documents.length}
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm font-medium text-gray-500">
                  Solde restant
                </p>
                <p className="text-xl font-bold text-gray-900 mt-1">
                  {formatCurrency(totalAmountDue - totalPayments)}
                </p>
              </div>
            </div>

            {/* Additional Info */}
            <div className="text-center pt-2">
              <p className="text-xs text-gray-500">
                Dernière mise à jour: {new Date().toLocaleDateString("fr-FR")}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Onglets pour les différentes sections */}
      <Tabs defaultValue="documents" className="w-full ">
        <TabsList className="grid grid-cols-3 w-full md:w-[400px]">
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="payments">Paiements</TabsTrigger>
          <TabsTrigger value="registrations">Inscriptions</TabsTrigger>
        </TabsList>

        {/* Documents */}
        <TabsContent value="documents" className="transition-all duration-500 ease-in-out opacity-100 transform translate-y-0" >
          <Card>
            <CardHeader>
              <CardTitle>Documents</CardTitle>
              <CardDescription>
                Liste des documents fournis par l'élève
              </CardDescription>
            </CardHeader>
            <CardContent>
              {hasDocuments ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {data.documents.map((doc: Document) => (
                    <Card
                      key={doc.id}
                      className="hover:shadow-md transition-shadow"
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          <div className="rounded-lg bg-muted p-2">
                            <FileText className="h-6 w-6" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium truncate">
                              {doc.label}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              {format(new Date(doc.created_at), "dd/MM/yyyy")}
                            </p>
                            <button
                              onClick={() =>
                                handleDownload(doc.path, doc.label)
                              }
                              className="mt-2 text-sm text-blue-600 hover:underline"
                            >
                              voir le document
                            </button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mb-2" />
                  <p>Aucun document disponible</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Paiements */}
        <TabsContent value="payments" className="transition-all duration-500 ease-in-out opacity-100 transform translate-y-0" >
          <Card>
            <CardHeader>
              <CardTitle>Historique des paiements</CardTitle>
              <CardDescription>
                Tous les paiements effectués par l'élève
              </CardDescription>
            </CardHeader>
            <CardContent>
              {hasPayments ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>frais</TableHead>
                        <TableHead>Montant payé</TableHead>
                        <TableHead>Caissier(ère)</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.payments.map((payment) => {
                        const tarif = pricing.find(
                          (p) => p.id === payment.installment.pricing_id
                        );
                        const feeType = tarif
                          ? tarif.fee_type.label
                          : "Non spécifié";

                        return (
                          <TableRow
                            key={payment.id}
                            className="hover:bg-muted/50"
                          >
                            <TableCell className="font-medium">
                              {payment.id}
                            </TableCell>
                            {/* <TableCell>{formatCurrency(Number(payment.installment.amount_due))}</TableCell> */}
                            <TableCell>{feeType}</TableCell>
                            <TableCell className="font-medium">
                              {formatCurrency(Number(payment.amount))}
                            </TableCell>
                            <TableCell>{payment.cashier.name}</TableCell>
                            <TableCell>
                              {format(
                                new Date(payment.created_at),
                                "dd/MM/yyyy HH:mm"
                              )}
                            </TableCell>
                            <TableCell>
                            <Button
                              variant="outline"
                              className="p-2"
                              onClick={() =>
                                router.push(`/caisse_comptabilite/encaissement/historique_paiement/${payment.id}`)
                              }
                            >
                              <Eye className="h-5 w-5" />
                            </Button>
                          </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mb-2" />
                  <p>Aucun paiement disponible</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Inscriptions */}
        <TabsContent value="registrations" className="transition-all duration-500 ease-in-out opacity-100 transform translate-y-0"   >
          <Card>
            <CardHeader>
              <CardTitle>Historique des inscriptions</CardTitle>
              <CardDescription>
                Toutes les inscriptions de l'élève
              </CardDescription>
            </CardHeader>
            <CardContent>
              {hasRegistrations ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Année académique</TableHead>
                        <TableHead>Classe</TableHead>
                        <TableHead>Date d'inscription</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead>action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.registrations.map((registration) => (
                        <TableRow
                          key={registration.id}
                          className="hover:bg-muted/50"
                        >
                          <TableCell>
                            {registration.academic_year?.label ||
                              "Non spécifiée"}
                          </TableCell>
                          <TableCell>
                            {registration.classe?.label || "Non spécifiée"}
                          </TableCell>
                          <TableCell>
                            {format(
                              new Date(registration.registration_date),
                              "dd/MM/yyyy"
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="soft"
                              color={
                                registration.academic_year_id ===
                                academicYearCurrent.id
                                  ? "default"
                                  : "secondary"
                              }
                            >
                              {registration.academic_year_id ===
                              academicYearCurrent.id
                                ? "Active"
                                : "Inactive"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="outline"
                              className="p-2"
                              onClick={() =>
                                router.push(`/eleves/historique/${registration.id}`)
                              }
                            >
                              <Eye className="h-5 w-5" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mb-2" />
                  <p>Aucune inscription disponible</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
