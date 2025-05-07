"use client";

import { useState } from "react";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Pencil, Trash2 } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface Role {
  id: string;
  label: string;
  description: string;
  type: "permanent" | "vacataire";
  responsibilities: string[];
}

const defaultRoles: Role[] = [
  {
    id: "1",
    label: "Directeur",
    description: "Responsable de la gestion globale de l'établissement, de la supervision du personnel et de la représentation officielle.",
    type: "permanent",
    responsibilities: [
      "Direction pédagogique et administrative",
      "Représentation de l'établissement",
      "Gestion des ressources humaines"
    ],
  },
  {
    id: "2",
    label: "Professeur titulaire",
    description: "Enseignant permanent responsable d'une classe ou d'une matière spécifique.",
    type: "permanent",
    responsibilities: [
      "Enseignement de la matière",
      "Évaluation des élèves",
      "Participation aux conseils de classe"
    ],
  },
];

export default function RolesManagement() {
  const [roles, setRoles] = useState<Role[]>(defaultRoles);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentRole, setCurrentRole] = useState<Role | null>(null);
  const [newRole, setNewRole] = useState<Omit<Role, "id">>({
    label: "",
    description: "",
    type: "permanent",
    responsibilities: [],
  });
  const [newResponsibility, setNewResponsibility] = useState("");

  const handleAddResponsibility = () => {
    const trimmed = newResponsibility.trim();
    if (trimmed && !newRole.responsibilities.includes(trimmed)) {
      setNewRole({
        ...newRole,
        responsibilities: [...newRole.responsibilities, trimmed],
      });
      setNewResponsibility("");
    }
  };

  const handleRemoveResponsibility = (r: string) => {
    setNewRole({
      ...newRole,
      responsibilities: newRole.responsibilities.filter(item => item !== r),
    });
  };

  const handleSubmit = () => {
    if (currentRole) {
      setRoles(roles.map(role => role.id === currentRole.id ? { ...currentRole, ...newRole } : role));
    } else {
      setRoles([...roles, { id: Date.now().toString(), ...newRole }]);
    }
    setIsDialogOpen(false);
    resetForm();
  };

  const handleEdit = (role: Role) => {
    setCurrentRole(role);
    setNewRole({
      label: role.label,
      description: role.description,
      type: role.type,
      responsibilities: [...role.responsibilities],
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setRoles(roles.filter(role => role.id !== id));
  };

  const resetForm = () => {
    setCurrentRole(null);
    setNewRole({
      label: "",
      description: "",
      type: "permanent",
      responsibilities: [],
    });
    setNewResponsibility("");
  };

  return (
    <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
      <CardHeader className="border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <CardTitle className="text-2xl font-bold text-gray-800 dark:text-white">
              Gestion des Fonctions
            </CardTitle>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Définissez les différents postes et responsabilités du personnel
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white"
                onClick={() => {
                  setCurrentRole(null);
                  resetForm();
                }}
              >
                <Plus className="mr-2 h-4 w-4" />
                Nouvelle fonction
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[650px]">
              <DialogHeader>
                <DialogTitle>
                  {currentRole ? "Modifier la fonction" : "Créer une nouvelle fonction"}
                </DialogTitle>
              </DialogHeader>

              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="label">Intitulé</Label>
                  <Input
                    id="label"
                    value={newRole.label}
                    onChange={(e) => setNewRole({ ...newRole, label: e.target.value })}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="type">Type</Label>
                  <Select
                    value={newRole.type}
                    onValueChange={(value: "permanent" | "vacataire") =>
                      setNewRole({ ...newRole, type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choisir un type" />
                    </SelectTrigger>
                    <SelectContent className="z-[9999]">
                      <SelectItem value="permanent">Permanent</SelectItem>
                      <SelectItem value="vacataire">Vacataire</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newRole.description}
                    onChange={(e) => setNewRole({ ...newRole, description: e.target.value })}
                  />
                </div>

                <div className="grid gap-2">
                  <Label>Responsabilités</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Ajouter une responsabilité"
                      value={newResponsibility}
                      onChange={(e) => setNewResponsibility(e.target.value)}
                    />
                    <Button type="button" onClick={handleAddResponsibility}>
                      Ajouter
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {newRole.responsibilities.map((r, idx) => (
                      <Badge
                        key={idx}
                        variant="outline"
                        className="cursor-pointer"
                        onClick={() => handleRemoveResponsibility(r)}
                      >
                        {r} ✕
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="ghost" onClick={() => setIsDialogOpen(false)}>
                  Annuler
                </Button>
                <Button onClick={handleSubmit}>
                  {currentRole ? "Enregistrer les modifications" : "Créer"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto rounded-lg shadow mt-6">
          <Table className="min-w-full text-sm text-gray-700 dark:text-gray-300">
            <TableHeader>
              <TableRow className="bg-gray-100 dark:bg-gray-800">
                <TableHead className="font-semibold">Intitulé</TableHead>
                <TableHead className="font-semibold">Type</TableHead>
                <TableHead className="font-semibold">Description</TableHead>
                <TableHead className="font-semibold">Responsabilités</TableHead>
                <TableHead className="font-semibold text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {roles.map((role) => (
                <TableRow key={role.id} className="hover:bg-gray-50 dark:hover:bg-gray-900">
                  <TableCell>{role.label}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">{role.type}</Badge>
                  </TableCell>
                  <TableCell className="max-w-xs truncate text-wrap">
                    {role.description}
                  </TableCell>
                  <TableCell className="max-w-xs">
                    <ul className="list-disc list-inside space-y-1">
                      {role.responsibilities.map((r, i) => (
                        <li key={i}>{r}</li>
                      ))}
                    </ul>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button size="sm" variant="ghost" onClick={() => handleEdit(role)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => handleDelete(role.id)}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
