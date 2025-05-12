"use client"

import Link from "next/link"
import { PlusCircle, Search, SlidersHorizontal } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"

export default function LivresPage() {
  return (
    <Card>
      
    <div className="flex min-h-screen w-full flex-col">
      <main className="flex-1 p-4 md:p-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Inventaire des Livres</h1>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Ajouter un livre
          </Button>
        </div>
        <div className="mt-4 flex flex-col gap-4 md:flex-row">
          <Card className="w-full md:w-2/3">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle>Tous les livres</CardTitle>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input type="search" placeholder="Rechercher..." className="w-full pl-8 md:w-[300px]" />
                  </div>
                  <Button variant="outline" size="icon">
                    <SlidersHorizontal className="h-4 w-4" />
                    <span className="sr-only">Filtrer</span>
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Titre</TableHead>
                    <TableHead>Auteur</TableHead>
                    <TableHead>Catégorie</TableHead>
                    <TableHead>ISBN</TableHead>
                    <TableHead>Statut</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {livres.map((livre) => (
                    <TableRow key={livre.id}>
                      <TableCell className="font-medium">{livre.titre}</TableCell>
                      <TableCell>{livre.auteur}</TableCell>
                      <TableCell>{livre.categorie}</TableCell>
                      <TableCell className="text-muted-foreground">{livre.isbn}</TableCell>
                      <TableCell>
                        <Badge color={livre.statut === "Disponible" ? "default" : "destructive"}>
                          {livre.statut}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          <Card className="w-full md:w-1/3">
            <CardHeader>
              <CardTitle>Filtrer par catégorie</CardTitle>
              <CardDescription>Sélectionnez une catégorie pour filtrer les livres</CardDescription>
            </CardHeader>
            <CardContent>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Toutes les catégories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les catégories</SelectItem>
                  <SelectItem value="litterature">Littérature</SelectItem>
                  <SelectItem value="sciences">Sciences</SelectItem>
                  <SelectItem value="histoire">Histoire</SelectItem>
                  <SelectItem value="mathematiques">Mathématiques</SelectItem>
                  <SelectItem value="geographie">Géographie</SelectItem>
                  <SelectItem value="langues">Langues</SelectItem>
                  <SelectItem value="arts">Arts</SelectItem>
                  <SelectItem value="informatique">Informatique</SelectItem>
                </SelectContent>
              </Select>
              <div className="mt-6 space-y-4">
                <h3 className="text-sm font-medium">Statistiques</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-lg border p-3">
                    <div className="text-sm font-medium text-muted-foreground">Total</div>
                    <div className="text-2xl font-bold">1,248</div>
                  </div>
                  <div className="rounded-lg border p-3">
                    <div className="text-sm font-medium text-muted-foreground">Disponibles</div>
                    <div className="text-2xl font-bold">1,103</div>
                  </div>
                  <div className="rounded-lg border p-3">
                    <div className="text-sm font-medium text-muted-foreground">Empruntés</div>
                    <div className="text-2xl font-bold">145</div>
                  </div>
                  <div className="rounded-lg border p-3">
                    <div className="text-sm font-medium text-muted-foreground">En retard</div>
                    <div className="text-2xl font-bold text-destructive">23</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
    </Card>
  )
}

const livres = [
  {
    id: 1,
    titre: "Les Soleils des Indépendances",
    auteur: "Ahmadou Kourouma",
    categorie: "Littérature",
    isbn: "978-2020238113",
    statut: "Disponible",
  },
  {
    id: 2,
    titre: "Le Pagne noir",
    auteur: "Bernard Dadié",
    categorie: "Littérature",
    isbn: "978-2708704121",
    statut: "Emprunté",
  },
  {
    id: 3,
    titre: "Mathématiques 3ème",
    auteur: "Collection CIAM",
    categorie: "Mathématiques",
    isbn: "978-2841292837",
    statut: "Disponible",
  },
  {
    id: 4,
    titre: "Histoire de la Côte d'Ivoire",
    auteur: "Henriette Diabaté",
    categorie: "Histoire",
    isbn: "978-2708707214",
    statut: "Disponible",
  },
  {
    id: 5,
    titre: "Physique-Chimie 2nde",
    auteur: "Collection AREX",
    categorie: "Sciences",
    isbn: "978-2841293544",
    statut: "Emprunté",
  },
  {
    id: 6,
    titre: "L'Enfant noir",
    auteur: "Camara Laye",
    categorie: "Littérature",
    isbn: "978-2266230100",
    statut: "Disponible",
  },
  {
    id: 7,
    titre: "Géographie de la Côte d'Ivoire",
    auteur: "Aké Assi Laurent",
    categorie: "Géographie",
    isbn: "978-2708708211",
    statut: "Disponible",
  },
  {
    id: 8,
    titre: "Introduction à l'informatique",
    auteur: "Jean-Pierre Serre",
    categorie: "Informatique",
    isbn: "978-2841294565",
    statut: "Emprunté",
  },
  {
    id: 9,
    titre: "Le Petit Prince",
    auteur: "Antoine de Saint-Exupéry",
    categorie: "Littérature",
    isbn: "978-2070612758",
    statut: "Disponible",
  },
  {
    id: 10,
    titre: "Les Misérables",
    auteur: "Victor Hugo",
    categorie: "Littérature",
    isbn: "978-2070612758",
    statut: "Emprunté",
  },
  {
    id: 11,
    titre: "Les Fleurs du mal",
    auteur: "Charles Baudelaire",
    categorie: "Littérature",
    isbn: "978-2070612758",
    statut: "Disponible",
  },
  {
    id: 12,
    titre: "Le Rouge et le Noir",
    auteur: "Stendhal",
    categorie: "Littérature",
    isbn: "978-2070612758",
    statut: "Emprunté",
  },
  {
    id: 13,
    titre: "Le Comte de Monte-Cristo",
    auteur: "Alexandre Dumas",
    categorie: "Littérature",
    isbn: "978-2070612758",
    statut: "Disponible",
  },
  {
    id: 14,
    titre: "Germinal",
    auteur: "Émile Zola",
    categorie: "Littérature",
    isbn: "978-2070612758",
    statut: "Emprunté",
  },
]