"use client";

import { useState } from "react";
import { Boxes, ChevronLeft, Edit, Plus, Trash, Search } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useAutoAnimate } from "@formkit/auto-animate/react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";

// Types pour les entrepôts
interface Entrepot {
  id: number;
  nom: string;
  emplacement: string;
  capacite: string;
  description: string;
  statut?: "actif" | "inactif" | "maintenance";
}

export default function EntrepotsPage() {
  // Données d'exemple pour les entrepôts
  const [entrepots, setEntrepots] = useState<Entrepot[]>([
    {
      id: 1,
      nom: "Entrepôt Principal",
      emplacement: "Bâtiment Administratif",
      capacite: "500m²",
      description: "Entrepôt principal pour les fournitures scolaires",
      statut: "actif",
    },
    {
      id: 2,
      nom: "Bibliothèque",
      emplacement: "Bâtiment B",
      capacite: "200m²",
      description: "Stockage des livres et manuels scolaires",
      statut: "actif",
    },
    {
      id: 3,
      nom: "Entrepôt Secondaire",
      emplacement: "Annexe",
      capacite: "150m²",
      description: "Stockage des équipements sportifs et matériels divers",
      statut: "maintenance",
    },
  ]);

  const [newEntrepot, setNewEntrepot] = useState<Omit<Entrepot, "id">>({
    nom: "",
    emplacement: "",
    capacite: "",
    description: "",
    statut: "actif",
  });

  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [parent] = useAutoAnimate();

  const filteredEntrepots = entrepots.filter(
    (entrepot) =>
      entrepot.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entrepot.emplacement.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddEntrepot = () => {
    if (editingId) {
      // Mode édition
      setEntrepots(
        entrepots.map((e) =>
          e.id === editingId ? { ...e, ...newEntrepot } : e
        )
      );
      setEditingId(null);
    } else {
      // Mode ajout
      setEntrepots([...entrepots, { id: Date.now(), ...newEntrepot }]);
    }

    setNewEntrepot({
      nom: "",
      emplacement: "",
      capacite: "",
      description: "",
      statut: "actif",
    });
    setIsOpen(false);
  };

  const handleEdit = (entrepot: Entrepot) => {
    setNewEntrepot({
      nom: entrepot.nom,
      emplacement: entrepot.emplacement,
      capacite: entrepot.capacite,
      description: entrepot.description,
      statut: entrepot.statut || "actif",
    });
    setEditingId(entrepot.id);
    setIsOpen(true);
  };

  const handleDelete = (id: number) => {
    setEntrepots(entrepots.filter((e) => e.id !== id));
  };

  const getStatusColor = (statut: string | undefined) => {
    switch (statut) {
      case "actif":
        return "bg-green-500";
      case "inactif":
        return "bg-gray-500";
      case "maintenance":
        return "bg-yellow-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <TooltipProvider>
      <div className="flex min-h-screen flex-col bg-muted/40">
        <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full"
                asChild
              >
                <Link href="/">
                  <ChevronLeft className="h-5 w-5" />
                </Link>
              </Button>
              <div>
                <h1 className="text-xl font-semibold">Gestion des Entrepôts</h1>
                <p className="text-sm text-muted-foreground">
                  {entrepots.length} entrepôt{entrepots.length !== 1 ? "s" : ""}{" "}
                  enregistré{entrepots.length !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <Button  color="indigodye">

                  <Plus className="mr-2 h-4 w-4" />
                  Ajouter un entrepôt
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle className="text-2xl">
                    {editingId ? "Modifier l'entrepôt" : "Nouvel entrepôt"}
                  </DialogTitle>
                  <DialogDescription>
                    {editingId
                      ? "Modifiez les informations de l'entrepôt ci-dessous."
                      : "Remplissez le formulaire pour ajouter un nouvel entrepôt."}
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="nom">Nom</Label>
                      <Input
                        id="nom"
                        placeholder="Nom de l'entrepôt"
                        value={newEntrepot.nom}
                        onChange={(e) =>
                          setNewEntrepot({
                            ...newEntrepot,
                            nom: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="emplacement">Emplacement</Label>
                      <Input
                        id="emplacement"
                        placeholder="Bâtiment, étage..."
                        value={newEntrepot.emplacement}
                        onChange={(e) =>
                          setNewEntrepot({
                            ...newEntrepot,
                            emplacement: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="capacite">Capacité</Label>
                      <Input
                        id="capacite"
                        placeholder="500m²"
                        value={newEntrepot.capacite}
                        onChange={(e) =>
                          setNewEntrepot({
                            ...newEntrepot,
                            capacite: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="statut">Statut</Label>
                      <select
                        id="statut"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        value={newEntrepot.statut}
                        onChange={(e) =>
                          setNewEntrepot({
                            ...newEntrepot,
                            statut: e.target.value as any,
                          })
                        }
                      >
                        <option value="actif">Actif</option>
                        <option value="inactif">Inactif</option>
                        <option value="maintenance">Maintenance</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Description de l'entrepôt..."
                      className="min-h-[100px]"
                      value={newEntrepot.description}
                      onChange={(e) =>
                        setNewEntrepot({
                          ...newEntrepot,
                          description: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsOpen(false)}>
                    Annuler
                  </Button>
                  <Button onClick={handleAddEntrepot}>
                    {editingId
                      ? "Enregistrer les modifications"
                      : "Créer l'entrepôt"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <CardTitle>Liste des entrepôts</CardTitle>
                  <div className="relative w-full md:w-auto">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Rechercher un entrepôt..."
                      className="pl-9 w-full md:w-[300px]"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg border overflow-hidden">
                  <Table>
                    <TableHeader className="bg-muted/50">
                      <TableRow>
                        <TableHead className="w-[50px]"></TableHead>
                        <TableHead>Nom</TableHead>
                        <TableHead>Emplacement</TableHead>
                        <TableHead>Capacité</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody ref={parent}>
                      {filteredEntrepots.length > 0 ? (
                        filteredEntrepots.map((entrepot) => (
                          <motion.tr
                            key={entrepot.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                          >
                            <TableCell>
                              <Boxes className="h-5 w-5 text-primary" />
                            </TableCell>
                            <TableCell className="font-medium">
                              <div className="flex items-center gap-2">
                                {entrepot.nom}
                                {entrepot.statut === "maintenance" && (
                                  <Tooltip>
                                    <TooltipTrigger>
                                      <span
                                        className={`h-2 w-2 rounded-full ${getStatusColor(
                                          entrepot.statut
                                        )}`}
                                      />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      En maintenance
                                    </TooltipContent>
                                  </Tooltip>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>{entrepot.emplacement}</TableCell>
                            <TableCell>{entrepot.capacite}</TableCell>
                            <TableCell>
                              <Badge
                                color={
                                  entrepot.statut === "actif"
                                    ? "default"
                                    : "secondary"
                                }
                              >
                                {entrepot.statut === "actif"
                                  ? "Actif"
                                  : entrepot.statut === "inactif"
                                  ? "Inactif"
                                  : "Maintenance"}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => handleEdit(entrepot)}
                                      className="hover:bg-muted"
                                    >
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>Modifier</TooltipContent>
                                </Tooltip>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => handleDelete(entrepot.id)}
                                      className="hover:bg-destructive/10 hover:text-destructive"
                                    >
                                      <Trash className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>Supprimer</TooltipContent>
                                </Tooltip>
                              </div>
                            </TableCell>
                          </motion.tr>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={6} className="h-24 text-center">
                            {searchTerm
                              ? "Aucun résultat trouvé"
                              : "Aucun entrepôt enregistré"}
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Entrepôts actifs
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {entrepots.filter((e) => e.statut === "actif").length}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    +2 depuis le mois dernier
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    En maintenance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {entrepots.filter((e) => e.statut === "maintenance").length}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    +1 depuis hier
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Capacité totale
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {entrepots.reduce(
                      (acc, e) => acc + parseInt(e.capacite) || 0,
                      0
                    )}
                    m²
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Capacité totale disponible
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </TooltipProvider>
  );
}
