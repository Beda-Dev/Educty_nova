"use client"

import { useState } from "react"
import { ChevronLeft, Edit, Package, Plus, Trash } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"

// Types pour les produits
interface Produit {
  id: number
  nom: string
  categorie: string
  quantite: number
  entrepot: string
  seuil: number
  description: string
}

export default function ProduitsPage() {
  // Données d'exemple pour les produits
  const [produits, setProduits] = useState<Produit[]>([
    {
      id: 1,
      nom: "Cahiers",
      categorie: "Fournitures",
      quantite: 250,
      entrepot: "Entrepôt Principal",
      seuil: 50,
      description: "Cahiers de 100 pages, grands carreaux",
    },
    {
      id: 2,
      nom: "Stylos",
      categorie: "Fournitures",
      quantite: 500,
      entrepot: "Entrepôt Principal",
      seuil: 100,
      description: "Stylos à bille bleus",
    },
    {
      id: 3,
      nom: "Livres de Mathématiques",
      categorie: "Manuels",
      quantite: 15,
      entrepot: "Bibliothèque",
      seuil: 20,
      description: "Manuels de mathématiques pour la classe de 3ème",
    },
    {
      id: 4,
      nom: "Craies",
      categorie: "Fournitures",
      quantite: 0,
      entrepot: "Entrepôt Secondaire",
      seuil: 50,
      description: "Craies blanches pour tableaux",
    },
  ])

  const [newProduit, setNewProduit] = useState<Omit<Produit, "id">>({
    nom: "",
    categorie: "Fournitures",
    quantite: 0,
    entrepot: "Entrepôt Principal",
    seuil: 0,
    description: "",
  })

  const [isOpen, setIsOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)

  const handleAddProduit = () => {
    if (editingId) {
      // Mode édition
      setProduits(produits.map((p) => (p.id === editingId ? { ...p, ...newProduit } : p)))
      setEditingId(null)
    } else {
      // Mode ajout
      setProduits([...produits, { id: Date.now(), ...newProduit }])
    }

    setNewProduit({
      nom: "",
      categorie: "Fournitures",
      quantite: 0,
      entrepot: "Entrepôt Principal",
      seuil: 0,
      description: "",
    })
    setIsOpen(false)
  }

  const handleEdit = (produit: Produit) => {
    setNewProduit({
      nom: produit.nom,
      categorie: produit.categorie,
      quantite: produit.quantite,
      entrepot: produit.entrepot,
      seuil: produit.seuil,
      description: produit.description,
    })
    setEditingId(produit.id)
    setIsOpen(true)
  }

  const handleDelete = (id: number) => {
    setProduits(produits.filter((p) => p.id !== id))
  }

  const getStatusBadge = (quantite: number, seuil: number) => {
    if (quantite === 0) {
      return (
        <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">
          Rupture
        </span>
      )
    } else if (quantite < seuil) {
      return (
        <span className="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800">
          Stock faible
        </span>
      )
    } else {
      return (
        <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
          En stock
        </span>
      )
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 border-b bg-background px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold">Gestion des Produits</h1>
          </div>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Ajouter un produit
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingId ? "Modifier le produit" : "Ajouter un nouveau produit"}</DialogTitle>
                <DialogDescription>
                  Remplissez les informations pour {editingId ? "modifier" : "ajouter"} un produit.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="nom">Nom du produit</Label>
                  <Input
                    id="nom"
                    value={newProduit.nom}
                    onChange={(e) => setNewProduit({ ...newProduit, nom: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="categorie">Catégorie</Label>
                  <Select
                    value={newProduit.categorie}
                    onValueChange={(value) => setNewProduit({ ...newProduit, categorie: value })}
                  >
                    <SelectTrigger id="categorie">
                      <SelectValue placeholder="Sélectionner une catégorie" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Fournitures">Fournitures</SelectItem>
                      <SelectItem value="Manuels">Manuels</SelectItem>
                      <SelectItem value="Équipements">Équipements</SelectItem>
                      <SelectItem value="Mobilier">Mobilier</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="quantite">Quantité</Label>
                  <Input
                    id="quantite"
                    type="number"
                    value={newProduit.quantite}
                    onChange={(e) => setNewProduit({ ...newProduit, quantite: Number.parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="entrepot">Entrepôt</Label>
                  <Select
                    value={newProduit.entrepot}
                    onValueChange={(value) => setNewProduit({ ...newProduit, entrepot: value })}
                  >
                    <SelectTrigger id="entrepot">
                      <SelectValue placeholder="Sélectionner un entrepôt" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Entrepôt Principal">Entrepôt Principal</SelectItem>
                      <SelectItem value="Bibliothèque">Bibliothèque</SelectItem>
                      <SelectItem value="Entrepôt Secondaire">Entrepôt Secondaire</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="seuil">Seuil d&apos;alerte</Label>
                  <Input
                    id="seuil"
                    type="number"
                    value={newProduit.seuil}
                    onChange={(e) => setNewProduit({ ...newProduit, seuil: Number.parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newProduit.description}
                    onChange={(e) => setNewProduit({ ...newProduit, description: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsOpen(false)}>
                  Annuler
                </Button>
                <Button onClick={handleAddProduit}>{editingId ? "Enregistrer" : "Ajouter"}</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </header>
      <main className="flex-1 p-4 md:p-6">
        <div className="rounded-lg border bg-card shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]"></TableHead>
                <TableHead>Nom</TableHead>
                <TableHead>Catégorie</TableHead>
                <TableHead>Quantité</TableHead>
                <TableHead>Entrepôt</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {produits.map((produit) => (
                <TableRow key={produit.id}>
                  <TableCell>
                    <Package className="h-5 w-5 text-green-500" />
                  </TableCell>
                  <TableCell className="font-medium">{produit.nom}</TableCell>
                  <TableCell>{produit.categorie}</TableCell>
                  <TableCell>{produit.quantite}</TableCell>
                  <TableCell>{produit.entrepot}</TableCell>
                  <TableCell>{getStatusBadge(produit.quantite, produit.seuil)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(produit)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(produit.id)}>
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </main>
    </div>
  )
}
