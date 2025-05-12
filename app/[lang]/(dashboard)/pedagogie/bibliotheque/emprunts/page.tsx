"use client"

import Link from "next/link";
import { CalendarIcon, PlusCircle, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function EmpruntsPage() {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <main className="flex-1 p-4 md:p-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Gestion des Emprunts</h1>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Nouvel emprunt
          </Button>
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Total des emprunts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,452</div>
              <p className="text-xs text-muted-foreground">
                Depuis la création de la bibliothèque
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Emprunts actifs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">145</div>
              <p className="text-xs text-muted-foreground">
                Livres actuellement empruntés
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Retours en retard
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">23</div>
              <p className="text-xs text-muted-foreground">
                Livres à récupérer rapidement
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Retours aujourd'hui
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">8</div>
              <p className="text-xs text-muted-foreground">
                Livres à retourner aujourd'hui
              </p>
            </CardContent>
          </Card>
        </div>
        <Card className="mt-6">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle>Emprunts en cours</CardTitle>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Rechercher..."
                    className="w-full pl-8 md:w-[300px]"
                  />
                </div>
                <Select defaultValue="all">
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filtrer par statut" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les emprunts</SelectItem>
                    <SelectItem value="active">Emprunts actifs</SelectItem>
                    <SelectItem value="late">En retard</SelectItem>
                    <SelectItem value="returned">Retournés</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Livre</TableHead>
                  <TableHead>Emprunteur</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Date d'emprunt</TableHead>
                  <TableHead>Date de retour</TableHead>
                  <TableHead>Statut</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {emprunts.map((emprunt) => (
                  <TableRow key={emprunt.id}>
                    <TableCell className="font-medium">
                      {emprunt.livre}
                    </TableCell>
                    <TableCell>{emprunt.emprunteur}</TableCell>
                    <TableCell>{emprunt.type}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                        <span>{emprunt.dateEmprunt}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                        <span>{emprunt.dateRetour}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        color={
                          emprunt.statut === "En cours"
                            ? "default"
                            : emprunt.statut === "En retard"
                            ? "destructive"
                            : "secondary"
                        }
                      >
                        {emprunt.statut}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

const emprunts = [
  {
    id: 1,
    livre: "Les Soleils des Indépendances",
    emprunteur: "Kouassi Aya",
    type: "Élève",
    dateEmprunt: "15/04/2023",
    dateRetour: "30/04/2023",
    statut: "En retard",
  },
  {
    id: 2,
    livre: "Mathématiques 3ème",
    emprunteur: "Konan Kouadio",
    type: "Élève",
    dateEmprunt: "02/05/2023",
    dateRetour: "16/05/2023",
    statut: "En cours",
  },
  {
    id: 3,
    livre: "Physique-Chimie 2nde",
    emprunteur: "Prof. Koffi Adjoua",
    type: "Enseignant",
    dateEmprunt: "28/04/2023",
    dateRetour: "28/05/2023",
    statut: "En cours",
  },
  {
    id: 4,
    livre: "Le Pagne noir",
    emprunteur: "Bamba Ibrahim",
    type: "Élève",
    dateEmprunt: "10/04/2023",
    dateRetour: "24/04/2023",
    statut: "En retard",
  },
  {
    id: 5,
    livre: "Histoire de la Côte d'Ivoire",
    emprunteur: "Prof. Yao Amlan",
    type: "Enseignant",
    dateEmprunt: "05/05/2023",
    dateRetour: "05/06/2023",
    statut: "En cours",
  },
  {
    id: 6,
    livre: "L'Enfant noir",
    emprunteur: "Touré Mariam",
    type: "Élève",
    dateEmprunt: "03/05/2023",
    dateRetour: "17/05/2023",
    statut: "En cours",
  },
  {
    id: 7,
    livre: "Géographie de la Côte d'Ivoire",
    emprunteur: "Diallo Fatou",
    type: "Élève",
    dateEmprunt: "01/05/2023",
    dateRetour: "15/05/2023",
    statut: "En cours",
  },
  {
    id: 8,
    livre: "Introduction à l'informatique",
    emprunteur: "Koffi Kouamé",
    type: "Élève",
    dateEmprunt: "20/04/2023",
    dateRetour: "04/05/2023",
    statut: "En cours",
  },
  {
    id: 9,
    livre: "Le Petit Prince",
    emprunteur: "Yao Affoué",
    type: "Élève",
    dateEmprunt: "12/04/2023",
    dateRetour: "26/04/2023",
    statut: "En cours",
  },
  {
    id: 10,
    livre: "Les Misérables",
    emprunteur: "Kouadio Adou",
    type: "Élève",
    dateEmprunt: "18/04/2023",
    dateRetour: "02/05/2023",
    statut: "En cours",
  },
  {
    id: 11,
    livre: "Le Rouge et le Noir",
    emprunteur: "Kouassi Adou",
    type: "Élève",
    dateEmprunt: "22/04/2023",
    dateRetour: "06/05/2023",
    statut: "En cours",
  },
  {
    id: 12,
    livre: "Les Fleurs du mal",
    emprunteur: "Yao Amlan",
    type: "Enseignant",
    dateEmprunt: "25/04/2023",
    dateRetour: "09/05/2023",
    statut: "En cours",
  },
  {
    id: 13,
    livre: "Le Comte de Monte-Cristo",
    emprunteur: "Koffi Adjoua",
    type: "Enseignant",
    dateEmprunt: "30/04/2023",
    dateRetour: "14/05/2023",
    statut: "En cours",
  },
  {
    id: 14,
    livre: "Germinal",
    emprunteur: "Bamba Ibrahim",
    type: "Élève",
    dateEmprunt: "05/05/2023",
    dateRetour: "19/05/2023",
    statut: "En cours",
  },
  {
    id: 15,
    livre: "Madame Bovary",
    emprunteur: "Diallo Fatou",
    type: "Élève",
    dateEmprunt: "10/05/2023",
    dateRetour: "24/05/2023",
    statut: "En cours",
  },
  {
    id: 16,
    livre: "Le Dernier Jour d'un condamné",
    emprunteur: "Koffi Kouamé",
    type: "Élève",
    dateEmprunt: "15/05/2023",
    dateRetour: "29/05/2023",
    statut: "En cours",
  },
  {
    id: 17,
    livre: "Les Trois Mousquetaires",
    emprunteur: "Yao Affoué",
    type: "Élève",
    dateEmprunt: "20/05/2023",
    dateRetour: "03/06/2023",
    statut: "En cours",
  },
  {
    id: 18,
    livre: "Le Petit Nicolas",
    emprunteur: "Kouadio Adou",
    type: "Élève",
    dateEmprunt: "25/05/2023",
    dateRetour: "08/06/2023",
    statut: "En cours",
  },
  {
    id: 19,
    livre: "Les Grandes Espérances",
    emprunteur: "Kouassi Adou",
    type: "Élève",
    dateEmprunt: "30/05/2023",
    dateRetour: "13/06/2023",
    statut: "En cours",
  },
  {
    id: 20,
    livre: "Le Vieil Homme et la Mer",
    emprunteur: "Yao Amlan",
    type: "Enseignant",
    dateEmprunt: "05/06/2023",
    dateRetour: "19/06/2023",
    statut: "En cours",
  },
  {
    id: 21,
    livre: "Le Parfum",
    emprunteur: "Koffi Adjoua",
    type: "Enseignant",
    dateEmprunt: "10/06/2023",
    dateRetour: "24/06/2023",
    statut: "En cours",
  },
  {
    id: 22,
    livre: "L'Étranger",
    emprunteur: "Bamba Ibrahim",
    type: "Élève",
    dateEmprunt: "15/06/2023",
    dateRetour: "29/06/2023",
    statut: "En cours",
  },
  {
    id: 23,
    livre: "La Peste",
    emprunteur: "Diallo Fatou",
    type: "Élève",
    dateEmprunt: "20/06/2023",
    dateRetour: "04/07/2023",
    statut: "En cours",
  },
];
