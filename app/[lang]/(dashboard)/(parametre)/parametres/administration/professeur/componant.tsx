"use client";

import { useState, useMemo } from "react";
import { useSchoolStore } from "@/store";
import ProfessorForm from "./professorFom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  UserPlus, 
  FileSpreadsheet, 
  Eye, 
  Search,
  Phone,
  Mail,
  IdCard,
  GraduationCap,
  Users,
  UserCheck,
  Calendar,
  Filter
} from "lucide-react";
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
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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
      ? "bg-emerald-100 text-emerald-800 border-emerald-200"
      : "bg-blue-100 text-blue-800 border-blue-200";
  };

  const getTypeIcon = (type: string) => {
    return type === "permanent" ? (
      <UserCheck className="w-3 h-3 mr-1" />
    ) : (
      <Calendar className="w-3 h-3 mr-1" />
    );
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
          (p.user?.email?.toLowerCase().includes(search.toLowerCase()) ?? false) ||
          (p.matricule?.toLowerCase().includes(search.toLowerCase()) ?? false)
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
          "Numéro de téléphone": p.number,
          Type: p.type === "permanent" ? "Permanent" : "Vacataire",
          Email: p.user?.email || "",
          CNI: p.cni || "",
          Sexe: p.sexe ? p.sexe.charAt(0).toUpperCase() + p.sexe.slice(1) : ""
        }),
      },
      fileName: "professeurs.xlsx",
    });
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  // Fonction utilitaire pour obtenir l'URL de l'avatar
  const getAvatarUrl = (professor: any) => {
    const url = professor.user?.avatar;
    // console.log("[getAvatarUrl] url récupérée:", url);
    if (!url) {
      // console.log("[getAvatarUrl] Pas d'avatar, retourne undefined");
      return undefined;
    }
    if (url.startsWith("http://") || url.startsWith("https://")) {
      // console.log("[getAvatarUrl] URL complète détectée, retourne:", url);
      return url;
    }
    if (process.env.NEXT_PUBLIC_API_BASE_URL_2) {
      const base = process.env.NEXT_PUBLIC_API_BASE_URL_2.replace(/\/+$/, "");
      const path = url.replace(/^\/+/, "");
      const fullUrl = `${base}/${path}`;
      // console.log("[getAvatarUrl] URL relative, retourne avec base:", fullUrl);
      return fullUrl;
    }
    // console.log("[getAvatarUrl] URL relative sans base, retourne:", url);
    return url;
  };

  return (
    <Card className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
              <GraduationCap className="h-10 w-10 text-blue-600" />
              Gestion des Enseignants
            </h1>
            <p className="text-gray-600 text-lg">
              Gérez et consultez les informations de votre corps enseignant
            </p>
          </div>
          <div className="mt-4 md:mt-0 flex gap-3">
            <Button
              onClick={handleExport}
              variant="outline"
              color="success"
            >
              <FileSpreadsheet className="w-5 h-5 mr-2" />
              Exporter Excel
            </Button>
            <Button
              onClick={() => setShowForm(true)}
              color="indigodye"
              className=""
            >
              <UserPlus className="h-5 w-5 mr-2" />
              Ajouter un professeur
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Professeurs</p>
                  <p className="text-3xl font-bold text-gray-900">{professors.length}</p>
                  <p className="text-xs text-gray-500 mt-1">Corps enseignant</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Permanents</p>
                  <p className="text-3xl font-bold text-emerald-600">
                    {professors.filter((p) => p.type === "permanent").length}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Titulaires</p>
                </div>
                <div className="p-3 bg-emerald-100 rounded-full">
                  <UserCheck className="h-8 w-8 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Vacataires</p>
                  <p className="text-3xl font-bold text-blue-600">
                    {professors.filter((p) => p.type === "vacataire").length}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Contractuels</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <Calendar className="h-8 w-8 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="bg-white shadow-lg border-0">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Rechercher par nom, prénom, téléphone, email ou matricule..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <Select
                  value={typeFilter}
                  onValueChange={v => setTypeFilter(v as "all" | "permanent" | "vacataire")}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filtrer par type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les types</SelectItem>
                    <SelectItem value="permanent">Permanents</SelectItem>
                    <SelectItem value="vacataire">Vacataires</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Professors List */}
        <Card className="bg-white shadow-lg border-0">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <Users className="h-6 w-6 text-blue-600" />
              Liste des Enseignants ({filteredProfessors.length})
            </CardTitle>
            <CardDescription>
              Consultez et gérez les informations de vos enseignants
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="w-full">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="font-semibold">Professeur</TableHead>
                    <TableHead className="font-semibold">Contact</TableHead>
                    <TableHead className="font-semibold">Type</TableHead>
                    <TableHead className="font-semibold">Informations</TableHead>
                    <TableHead className="font-semibold">Statut</TableHead>
                    <TableHead className="font-semibold text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedProfessors.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="py-16 text-center">
                        <div className="flex flex-col items-center justify-center space-y-4">
                          <div className="p-4 bg-gray-100 rounded-full">
                            <GraduationCap className="h-12 w-12 text-gray-400" />
                          </div>
                          <div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                              Aucun professeur trouvé
                            </h3>
                            <p className="text-gray-600 mb-4">
                              {search || typeFilter !== "all" 
                                ? "Aucun professeur ne correspond à vos critères de recherche"
                                : "Commencez par ajouter votre premier professeur"
                              }
                            </p>
                            <Button
                              onClick={() => setShowForm(true)}
                              className="bg-blue-600 hover:bg-blue-700"
                            >
                              <UserPlus className="h-4 w-4 mr-2" />
                              Ajouter un professeur
                            </Button>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedProfessors.map((professor) => (
                      <TableRow
                        key={professor.id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-12 w-12">
                              {getAvatarUrl(professor) ? (
                                <img
                                  src={getAvatarUrl(professor)}
                                  alt={`${professor.first_name} ${professor.name}`}
                                  width={48}
                                  height={48}
                                  className="rounded-full object-cover w-12 h-12"
                                />
                              ) : (
                                <AvatarFallback className="bg-blue-100 text-blue-600 font-semibold">
                                  {getInitials(professor.first_name, professor.name)}
                                </AvatarFallback>
                              )}
                            </Avatar>
                            <div>
                              <div className="font-semibold text-gray-900">
                                {professor.first_name} {professor.name}
                              </div>
                              {professor.matricule && (
                                <div className="text-sm text-gray-500 flex items-center gap-1">
                                  <IdCard className="h-3 w-3" />
                                  {professor.matricule}
                                </div>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm">
                              <Phone className="h-3 w-3 text-gray-400" />
                              <span className="font-medium">{professor.number}</span>
                            </div>
                            {professor.user?.email && (
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Mail className="h-3 w-3 text-gray-400" />
                                <span className="truncate max-w-[200px]">{professor.user.email}</span>
                              </div>
                            )}
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <Badge
                            className={cn(
                              "text-xs px-3 py-1 rounded-full font-medium border flex items-center w-fit",
                              getTypeColor(professor.type)
                            )}
                          >
                            {getTypeIcon(professor.type)}
                            {professor.type === "permanent" ? "Permanent" : "Vacataire"}
                          </Badge>
                        </TableCell>
                        
                        <TableCell>
                          <div className="space-y-1 text-sm">
                            {professor.sexe && (
                              <div className="text-gray-600">
                                <span className="font-medium">Sexe:</span> {professor.sexe.charAt(0).toUpperCase() + professor.sexe.slice(1)}
                              </div>
                            )}
                            {professor.cni && (
                              <div className="text-gray-600">
                                <span className="font-medium">CNI:</span> {professor.cni}
                              </div>
                            )}
                            {!professor.sexe && !professor.cni && (
                              <span className="text-gray-400 italic">Non renseigné</span>
                            )}
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className={cn(
                              "w-2 h-2 rounded-full",
                              professor.user?.active ? "bg-green-500" : "bg-red-500"
                            )} />
                            <span className={cn(
                              "text-xs font-medium",
                              professor.user?.active ? "text-green-700" : "text-red-700"
                            )}>
                              {professor.user?.active ? "Actif" : "Inactif"}
                            </span>
                          </div>
                        </TableCell>
                        
                        <TableCell className="text-center">
                          <Button
                            onClick={() => router.push(`/parametres/administration/professeur/${professor.id}`)}
                            size="sm"
                            variant="outline"
                            className=" transition-colors"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Voir
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
              <div className="mt-6 flex justify-center">
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
                            : "hover:bg-blue-50"
                        }
                      />
                    </PaginationItem>

                    {Array.from({ length: totalPages }, (_, i) => (
                      <PaginationItem key={i + 1}>
                        <Button
                          variant={currentPage === i + 1 ? "ghost" : "outline"}
                          onClick={() => setCurrentPage(i + 1)}
                          className={currentPage === i + 1 ? "bg-blue-600 hover:bg-blue-700" : "hover:bg-blue-50"}
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
                            ? "pointer-events-none opacity-50"
                            : "hover:bg-blue-50"
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
      </div>
    </Card>
  );
}