import { useState, useMemo } from "react";
import Head from "next/head";
import { useSchoolStore } from "@/store";
import ProfessorForm from "./professorFom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, UserPlus, FileSpreadsheet, ArrowRight, Edit , Eye } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRouter } from "next/navigation";
import { universalExportToExcel } from "@/lib/utils";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

export default function Professors() {
  const { professor: professors } = useSchoolStore();
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "permanent" | "vacataire">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const router = useRouter();

  const handleFormSuccess = () => {};

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR");
  };

  const getTypeColor = (type: string) => {
    return type === "permanent"
      ? "bg-green-100 text-green-800"
      : "bg-blue-100 text-blue-800";
  };

  // Filtrage
  const filteredProfessors = useMemo(() => {
    let filtered = professors;
    if (typeFilter !== "all") {
      filtered = filtered.filter((p) => p.type === typeFilter);
    }
    if (search.trim()) {
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(search.toLowerCase()) ||
          p.first_name.toLowerCase().includes(search.toLowerCase()) ||
          p.number.toLowerCase().includes(search.toLowerCase()) ||
          (p.user?.email?.toLowerCase().includes(search.toLowerCase()) ?? false)
      );
    }
     // Trie du plus récent au plus ancien
  return filtered.sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
  }, [professors, search, typeFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredProfessors.length / pageSize);
  const paginatedProfessors = filteredProfessors.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Export Excel
  const handleExport = () => {
    universalExportToExcel({
      source: {
        type: "array",
        data: filteredProfessors,
        formatRow: (p) => ({
          Matricule: p.matricule || "",
          Nom: p.name,
          Prénom: p.first_name,
          Numéro: p.number,
          Type: p.type === "permanent" ? "Permanent" : "Vacataire",
          Email: p.user?.email || "",
          CNI: p.cni || ""
        }),
      },
      fileName: "professeurs.xlsx",
    });
  };

  return (
    <>
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-skyblue/10 to-indigo-50 dark:from-gray-900 dark:to-gray-800 py-8">
        <Card className="w-full max-w-6xl border-none bg-white/90 dark:bg-gray-900/90">
          <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b">
            <div>
              <CardTitle className="text-3xl font-bold text-gray-900 dark:text-white">
                Gestion des Enseignants
              </CardTitle>
              <CardDescription>
                Retrouvez ici la liste complète des enseignants de votre établissement.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            {/* Filtres + Actions */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
              <div className="flex flex-col md:flex-row gap-2">
                <Input
                  placeholder="Rechercher par nom, prénom, numéro ou email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="max-w-xs"
                />
                <Select
                  value={typeFilter}
                  onValueChange={v => setTypeFilter(v as "all" | "permanent" | "vacataire")}
                >
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent className="z-[9999]">
                    <SelectItem value="all">Tous</SelectItem>
                    <SelectItem value="permanent">Permanents</SelectItem>
                    <SelectItem value="vacataire">Vacataires</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2">
                <Button
                  color="success"
                  onClick={handleExport}
                  className="gap-2"
                  
                >
                  <FileSpreadsheet className="w-5 h-5" />
                  Exporter Excel
                </Button>
                <Button
                  color="indigodye"
                  onClick={() => setShowForm(true)}
                  className="gap-2"
                  size="lg"
                >
                  <UserPlus className="h-5 w-5" />
                  Ajouter un professeur
                </Button>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <Card className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 p-6 flex items-center gap-4">
                <div className="p-3 rounded-full bg-primary-100">
                  <span className="text-2xl">👨‍🏫</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                    Total Professeurs
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {professors.length}
                  </p>
                </div>
              </Card>
              <Card className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 p-6 flex items-center gap-4">
                <div className="p-3 rounded-full bg-green-100">
                  <span className="text-2xl">✅</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Permanents</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {professors.filter((p) => p.type === "permanent").length}
                  </p>
                </div>
              </Card>
              <Card className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 p-6 flex items-center gap-4">
                <div className="p-3 rounded-full bg-blue-100">
                  <span className="text-2xl">📝</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Vacataires</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {professors.filter((p) => p.type === "vacataire").length}
                  </p>
                </div>
              </Card>
            </div>

            {/* Liste des professeurs */}
            <Card className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">
                  Liste des Enseignants
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="w-full">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Professeur</TableHead>
                        <TableHead>Numéro</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Cni</TableHead>
                        <TableHead>Sexe</TableHead>
                        <TableHead>Matricule</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedProfessors.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="py-12 text-center text-gray-500">
                            <span className="text-6xl mb-4 block">👨‍🏫</span>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                              Aucun professeur
                            </h3>
                            <p className="text-gray-600 mb-4">
                              Commencez par ajouter votre premier professeur
                            </p>
                            <Button
                              onClick={() => setShowForm(true)}
                              color="indigodye"
                              className="text-white px-6 py-2 rounded-lg transition-colors"
                            >
                              Ajouter un professeur
                            </Button>
                          </TableCell>
                        </TableRow>
                      ) : (
                        paginatedProfessors.map((professor) => (
                          <TableRow
                            key={professor.id}
                            className="hover:bg-accent/30 transition-colors"
                          >
                            <TableCell>
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10">
                                  <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                                    <span className="text-primary-600 font-medium">
                                      {professor.first_name[0]}
                                      {professor.name[0]}
                                    </span>
                                  </div>
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                                    {professor.first_name} {professor.name}
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>{professor.number}</TableCell>
                            <TableCell>
                              <Badge
                                className={cn(
                                  "text-xs px-2 py-1 rounded-full",
                                  getTypeColor(professor.type)
                                )}
                              >
                                {professor.type === "permanent"
                                  ? "Permanent"
                                  : "Vacataire"}
                              </Badge>
                            </TableCell>
                            <TableCell>{professor.user?.email || "-"}</TableCell>
                            <TableCell>{professor?.cni || "-"}</TableCell>
                            <TableCell>{professor?.sexe ? (professor.sexe.charAt(0).toUpperCase() + professor.sexe.slice(1)) : "-"}</TableCell>
                            <TableCell>{professor?.matricule || "-"}</TableCell>
                            <TableCell className="flex gap-2">
                              {/* <Button
                                color="tyrian"
                                size="sm"
                                onClick={() => console.log(`Voir le modifier de ${professor.first_name} ${professor.name}`)}
                                className="flex items-center gap-1"
                                title="modifier"
                              >
                                <Edit className="h-4 w-4" />
                                
                              </Button> */}
                              <Button
                                onClick={() => router.push(`/parametres/administration/professeur/${professor.id}`)}
                                color='skyblue'
                                size="icon"
                                aria-label="voir"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </ScrollArea>
                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-4 flex justify-center">
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious
                            onClick={
                              currentPage === 1 ? undefined : () => setCurrentPage((p) => Math.max(1, p - 1))
                            }
                            aria-disabled={currentPage === 1}
                            tabIndex={currentPage === 1 ? -1 : 0}
                            className={
                              currentPage === 1
                                ? "pointer-events-none opacity-50"
                                : ""
                            }
                          />
                        </PaginationItem>

                        {Array.from({ length: totalPages }, (_, i) => (
                          <PaginationItem key={i + 1}>
                            <Button
                              variant={currentPage === i + 1 ? "outline" : "ghost"}
                              onClick={() => setCurrentPage(i + 1)}
                            >
                              {i + 1}
                            </Button>
                          </PaginationItem>
                        ))}

                        <PaginationItem>
                          <PaginationNext
                            onClick={
                              currentPage === totalPages
                                ? undefined
                                : () => setCurrentPage((p) => Math.min(totalPages, p + 1))
                            }
                            aria-disabled={currentPage === totalPages}
                            tabIndex={currentPage === totalPages ? -1 : 0}
                            className={
                              currentPage === totalPages
                                ? "pointer-events-none opacity-50 text-muted-foreground"
                                : ""
                            }
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Formulaire modal */}
            <ProfessorForm
              open={showForm}
              onClose={() => setShowForm(false)}
              onSuccess={handleFormSuccess}
            />
          </CardContent>
        </Card>
      </div>
    </>
  );
}