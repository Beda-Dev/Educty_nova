"use client"

import { useState } from "react"
import { BarChart3, ChevronLeft, Edit, Plus, Trash } from "lucide-react"
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

// Types pour les opérations
interface Operation {
  id: number
  date: string
  type: "Entrée" | "Sortie" | "Transfert"
  produit: string
  quantite: number
  entrepot: string
  destinataire?: string
  motif: string
}

export default function OperationsPage() {
  // Données d'exemple pour les opérations
  const [operations, setOperations] = useState<Operation[]>([
    {
      id: 1,
      date: "2025-05-10",
      type: "Entrée",
      produit: "Cahiers",
      quantite: 100,
      entrepot: "Entrepôt Principal",
      motif: "Livraison fournisseur",
    },
    {
      id: 2,
      date: "2025-05-11",
      type: "Sortie",
      produit: "Stylos",
      quantite: 50,
      entrepot: "Entrepôt Principal",
      destinataire: "Classe de 6ème A",
      motif: "Distribution aux élèves",
    },
    {
      id: 3,
      date: "2025-05-11",
      type: "Transfert",
      produit: "Livres de Mathématiques",
      quantite: 15,
      entrepot: "Entrepôt Principal",
      destinataire: "Bibliothèque",
      motif: "Réorganisation des stocks",
    },
  ])

  const [newOperation, setNewOperation] = useState<Omit<Operation, "id">>({
    date: new Date().toISOString().split("T")[0],
    type: "Entrée",
    produit: "",
    quantite: 0,
    entrepot: "Entrepôt Principal",
    destinataire: "",
    motif: "",
  })

  const [isOpen, setIsOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)

  const handleAddOperation = () => {
    if (editingId) {
      // Mode édition
      setOperations(operations.map((o) => (o.id === editingId ? { ...o, ...newOperation } : o)))
      setEditingId(null)
    } else {
      // Mode ajout
      setOperations([...operations, { id: Date.now(), ...newOperation }])
    }

    setNewOperation({
      date: new Date().toISOString().split("T")[0],
      type: "Entrée",
      produit: "",
      quantite: 0,
      entrepot: "Entrepôt Principal",
      destinataire: "",
      motif: "",
    })
    setIsOpen(false)
  }

  const handleEdit = (operation: Operation) => {
    setNewOperation({
      date: operation.date,
      type: operation.type,
      produit: operation.produit,
      quantite: operation.quantite,
      entrepot: operation.entrepot,
      destinataire: operation.destinataire,
      motif: operation.motif,
    })
    setEditingId(operation.id)
    setIsOpen(true)
  }

  const handleDelete = (id: number) => {
    setOperations(operations.filter((o) => o.id !== id))
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 border-b bg-background px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold">Gestion des Opérations</h1>
          </div>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Nouvelle opération
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingId ? "Modifier l'opération" : "Ajouter une nouvelle opération"}</DialogTitle>
                <DialogDescription>
                  Remplissez les informations pour {editingId ? "modifier" : "ajouter"} une opération.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={newOperation.date}
                    onChange={(e) => setNewOperation({ ...newOperation, date: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="type">Type d&apos;opération</Label>
                  <Select
                    value={newOperation.type}
                    onValueChange={(value: "Entrée" | "Sortie" | "Transfert") =>
                      setNewOperation({ ...newOperation, type: value })
                    }
                  >
                    <SelectTrigger id="type">
                      <SelectValue placeholder="Sélectionner un type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Entrée">Entrée</SelectItem>
                      <SelectItem value="Sortie">Sortie</SelectItem>
                      <SelectItem value="Transfert">Transfert</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="produit">Produit</Label>
                  <Select
                    value={newOperation.produit}
                    onValueChange={(value) => setNewOperation({ ...newOperation, produit: value })}
                  >
                    <SelectTrigger id="produit">
                      <SelectValue placeholder="Sélectionner un produit" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Cahiers">Cahiers</SelectItem>
                      <SelectItem value="Stylos">Stylos</SelectItem>
                      <SelectItem value="Livres de Mathématiques">Livres de Mathématiques</SelectItem>
                      <SelectItem value="Craies">Craies</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="quantite">Quantité</Label>
                  <Input
                    id="quantite"
                    type="number"
                    value={newOperation.quantite}
                    onChange={(e) =>
                      setNewOperation({ ...newOperation, quantite: Number.parseInt(e.target.value) || 0 })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="entrepot">Entrepôt</Label>
                  <Select
                    value={newOperation.entrepot}
                    onValueChange={(value) => setNewOperation({ ...newOperation, entrepot: value })}
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
                {(newOperation.type === "Sortie" || newOperation.type === "Transfert") && (
                  <div className="grid gap-2">
                    <Label htmlFor="destinataire">Destinataire</Label>
                    <Input
                      id="destinataire"
                      value={newOperation.destinataire || ""}
                      onChange={(e) => setNewOperation({ ...newOperation, destinataire: e.target.value })}
                    />
                  </div>
                )}
                <div className="grid gap-2">
                  <Label htmlFor="motif">Motif</Label>
                  <Textarea
                    id="motif"
                    value={newOperation.motif}
                    onChange={(e) => setNewOperation({ ...newOperation, motif: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsOpen(false)}>
                  Annuler
                </Button>
                <Button onClick={handleAddOperation}>{editingId ? "Enregistrer" : "Ajouter"}</Button>
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
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Produit</TableHead>
                <TableHead>Quantité</TableHead>
                <TableHead>Entrepôt</TableHead>
                <TableHead>Destinataire</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {operations.map((operation) => (
                <TableRow key={operation.id}>
                  <TableCell>
                    <BarChart3 className="h-5 w-5 text-blue-500" />
                  </TableCell>
                  <TableCell>{formatDate(operation.date)}</TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        operation.type === "Entrée"
                          ? "bg-green-100 text-green-800"
                          : operation.type === "Sortie"
                            ? "bg-red-100 text-red-800"
                            : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {operation.type}
                    </span>
                  </TableCell>
                  <TableCell className="font-medium">{operation.produit}</TableCell>
                  <TableCell>{operation.quantite}</TableCell>
                  <TableCell>{operation.entrepot}</TableCell>
                  <TableCell>{operation.destinataire || "-"}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(operation)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(operation.id)}>
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
