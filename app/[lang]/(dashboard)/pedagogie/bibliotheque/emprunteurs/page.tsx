"use client"

import Link from "next/link"
import { Search, UserPlus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function UtilisateursPage() {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <main className="flex-1 p-4 md:p-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Gestion des Utilisateurs</h1>
          <Button color="indigodye" >
            <UserPlus className="mr-2 h-4 w-4" />
            Ajouter un utilisateur
          </Button>
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total des utilisateurs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">615</div>
              <p className="text-xs text-muted-foreground">Élèves et enseignants confondus</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Élèves</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">573</div>
              <p className="text-xs text-muted-foreground">Inscrits à la bibliothèque</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Enseignants</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">42</div>
              <p className="text-xs text-muted-foreground">Inscrits à la bibliothèque</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Emprunteurs actifs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">128</div>
              <p className="text-xs text-muted-foreground">Ayant des emprunts en cours</p>
            </CardContent>
          </Card>
        </div>
        <Card className="mt-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Liste des utilisateurs</CardTitle>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input type="search" placeholder="Rechercher un utilisateur..." className="w-full pl-8 md:w-[300px]" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="eleves">
              <TabsList className="mb-4">
                <TabsTrigger value="eleves">Élèves</TabsTrigger>
                <TabsTrigger value="enseignants">Enseignants</TabsTrigger>
              </TabsList>
              <TabsContent value="eleves">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Matricule</TableHead>
                      <TableHead>Nom</TableHead>
                      <TableHead>Prénom</TableHead>
                      <TableHead>Classe</TableHead>
                      <TableHead>Emprunts actifs</TableHead>
                      <TableHead>Statut</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {eleves.map((eleve) => (
                      <TableRow key={eleve.id}>
                        <TableCell className="font-medium">{eleve.matricule}</TableCell>
                        <TableCell>{eleve.nom}</TableCell>
                        <TableCell>{eleve.prenom}</TableCell>
                        <TableCell>{eleve.classe}</TableCell>
                        <TableCell>{eleve.empruntsActifs}</TableCell>
                        <TableCell>
                          <Badge
                            color={
                              eleve.statut === "Actif"
                                ? "default"
                                : eleve.statut === "En retard"
                                  ? "destructive"
                                  : "secondary"
                            }
                          >
                            {eleve.statut}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TabsContent>
              <TabsContent value="enseignants">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Matricule</TableHead>
                      <TableHead>Nom</TableHead>
                      <TableHead>Prénom</TableHead>
                      <TableHead>Matière</TableHead>
                      <TableHead>Emprunts actifs</TableHead>
                      <TableHead>Statut</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {enseignants.map((enseignant) => (
                      <TableRow key={enseignant.id}>
                        <TableCell className="font-medium">{enseignant.matricule}</TableCell>
                        <TableCell>{enseignant.nom}</TableCell>
                        <TableCell>{enseignant.prenom}</TableCell>
                        <TableCell>{enseignant.matiere}</TableCell>
                        <TableCell>{enseignant.empruntsActifs}</TableCell>
                        <TableCell>
                          <Badge
                            color={
                              enseignant.statut === "Actif"
                                ? "default"
                                : enseignant.statut === "En retard"
                                  ? "destructive"
                                  : "secondary"
                            }
                          >
                            {enseignant.statut}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

const eleves = [
  {
    id: 1,
    matricule: "EL-2023-001",
    nom: "Kouassi",
    prenom: "Aya",
    classe: "3ème A",
    empruntsActifs: 2,
    statut: "En retard",
  },
  {
    id: 2,
    matricule: "EL-2023-042",
    nom: "Konan",
    prenom: "Kouadio",
    classe: "3ème B",
    empruntsActifs: 1,
    statut: "Actif",
  },
  {
    id: 3,
    matricule: "EL-2023-078",
    nom: "Bamba",
    prenom: "Ibrahim",
    classe: "2nde C",
    empruntsActifs: 1,
    statut: "En retard",
  },
  {
    id: 4,
    matricule: "EL-2023-125",
    nom: "Touré",
    prenom: "Mariam",
    classe: "1ère D",
    empruntsActifs: 1,
    statut: "Actif",
  },
  {
    id: 5,
    matricule: "EL-2023-156",
    nom: "Diallo",
    prenom: "Fatou",
    classe: "Tle A",
    empruntsActifs: 1,
    statut: "Actif",
  },
  {
    id: 6,
    matricule: "EL-2023-189",
    nom: "Koffi",
    prenom: "Kouamé",
    classe: "4ème B",
    empruntsActifs: 0,
    statut: "Inactif",
  },
  {
    id: 7,
    matricule: "EL-2023-201",
    nom: "Yao",
    prenom: "Affoué",
    classe: "5ème A",
    empruntsActifs: 0,
    statut: "Inactif",
  },
]

const enseignants = [
  {
    id: 1,
    matricule: "EN-2023-001",
    nom: "Koffi",
    prenom: "Adjoua",
    matiere: "Physique-Chimie",
    empruntsActifs: 1,
    statut: "Actif",
  },
  {
    id: 2,
    matricule: "EN-2023-008",
    nom: "Yao",
    prenom: "Amlan",
    matiere: "Histoire-Géographie",
    empruntsActifs: 1,
    statut: "Actif",
  },
  {
    id: 3,
    matricule: "EN-2023-012",
    nom: "Koné",
    prenom: "Bakary",
    matiere: "Mathématiques",
    empruntsActifs: 3,
    statut: "Actif",
  },
  {
    id: 4,
    matricule: "EN-2023-015",
    nom: "Aka",
    prenom: "N'Guessan",
    matiere: "Français",
    empruntsActifs: 0,
    statut: "Inactif",
  },
  {
    id: 5,
    matricule: "EN-2023-021",
    nom: "Coulibaly",
    prenom: "Siaka",
    matiere: "SVT",
    empruntsActifs: 2,
    statut: "En retard",
  },

  {
    id: 6,
    matricule: "EN-2023-032",
    nom: "Brou",
    prenom: "Moussa",
    matiere: "Anglais",
    empruntsActifs: 0,
    statut: "Inactif",
  },
  {
    id: 7,
    matricule: "EN-2023-045",
    nom: "Diomandé",
    prenom: "Aissatou",
    matiere: "Espagnol",
    empruntsActifs: 0,
    statut: "Inactif",
  },
  
]