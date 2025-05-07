"use client";

import { useState } from "react";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Pencil, Trash2, User, UserCheck } from "lucide-react";
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
import { Switch } from "@/components/ui/switch";

interface Role {
  id: string;
  label: string;
  description: string;
  type: "permanent" | "vacataire";
  responsibilities: string[];
}

interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  isUser: boolean;
  role: Role | null;
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

const defaultEmployees: Employee[] = [
  {
    id: "1",
    firstName: "Jean",
    lastName: "Dupont",
    email: "jean.dupont@ecole.fr",
    phone: "0612345678",
    isUser: true,
    role: defaultRoles[0],
  },
  {
    id: "2",
    firstName: "Marie",
    lastName: "Martin",
    email: "marie.martin@ecole.fr",
    phone: "0698765432",
    isUser: true,
    role: defaultRoles[1],
  },
];

export default function EmployeesManagement() {
  const [employees, setEmployees] = useState<Employee[]>(defaultEmployees);
  const [roles] = useState<Role[]>(defaultRoles);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentEmployee, setCurrentEmployee] = useState<Employee | null>(null);
  const [newEmployee, setNewEmployee] = useState<Omit<Employee, "id">>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    isUser: false,
    role: null,
  });

  const handleSubmit = () => {
    if (currentEmployee) {
      setEmployees(employees.map(emp => 
        emp.id === currentEmployee.id ? { ...currentEmployee, ...newEmployee } : emp
      ));
    } else {
      setEmployees([...employees, { id: Date.now().toString(), ...newEmployee }]);
    }
    setIsDialogOpen(false);
    resetForm();
  };

  const handleEdit = (employee: Employee) => {
    setCurrentEmployee(employee);
    setNewEmployee({
      firstName: employee.firstName,
      lastName: employee.lastName,
      email: employee.email,
      phone: employee.phone,
      isUser: employee.isUser,
      role: employee.role,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setEmployees(employees.filter(emp => emp.id !== id));
  };

  const resetForm = () => {
    setCurrentEmployee(null);
    setNewEmployee({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      isUser: false,
      role: null,
    });
  };

  return (
    <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
      <CardHeader className="border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <CardTitle className="text-2xl font-bold text-gray-800 dark:text-white">
              Gestion des Employés
            </CardTitle>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Gérer les employés et leurs attributions de fonctions
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white"
                onClick={() => {
                  setCurrentEmployee(null);
                  resetForm();
                }}
              >
                <Plus className="mr-2 h-4 w-4" />
                Nouvel employé
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[650px]">
              <DialogHeader>
                <DialogTitle>
                  {currentEmployee ? "Modifier l'employé" : "Créer un nouvel employé"}
                </DialogTitle>
              </DialogHeader>

              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="firstName">Prénom</Label>
                    <Input
                      id="firstName"
                      value={newEmployee.firstName}
                      onChange={(e) => setNewEmployee({ ...newEmployee, firstName: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="lastName">Nom</Label>
                    <Input
                      id="lastName"
                      value={newEmployee.lastName}
                      onChange={(e) => setNewEmployee({ ...newEmployee, lastName: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={newEmployee.email}
                      onChange={(e) => setNewEmployee({ ...newEmployee, email: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="phone">Téléphone</Label>
                    <Input
                      id="phone"
                      value={newEmployee.phone}
                      onChange={(e) => setNewEmployee({ ...newEmployee, phone: e.target.value })}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Switch
                    id="isUser"
                    checked={newEmployee.isUser}
                    onCheckedChange={(checked) => setNewEmployee({ ...newEmployee, isUser: checked })}
                  />
                  <Label htmlFor="isUser">Accès utilisateur</Label>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="role">Fonction</Label>
                  <Select
                    value={newEmployee.role?.id || ""}
                    onValueChange={(value) => {
                      const selectedRole = roles.find(role => role.id === value);
                      setNewEmployee({ ...newEmployee, role: selectedRole || null });
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner une fonction" />
                    </SelectTrigger>
                    <SelectContent className="z-[9999]">
                      {roles.map((role) => (
                        <SelectItem key={role.id} value={role.id}>
                          {role.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {newEmployee.role && (
                  <div className="border rounded-lg p-4">
                    <h4 className="font-medium mb-2">Détails de la fonction</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                      {newEmployee.role.description}
                    </p>
                    <div className="space-y-1">
                      <h5 className="text-sm font-medium">Responsabilités:</h5>
                      <ul className="list-disc list-inside pl-2 text-sm text-gray-600 dark:text-gray-300">
                        {newEmployee.role.responsibilities.map((r, i) => (
                          <li key={i}>{r}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="ghost" onClick={() => setIsDialogOpen(false)}>
                  Annuler
                </Button>
                <Button onClick={handleSubmit}>
                  {currentEmployee ? "Enregistrer les modifications" : "Créer"}
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
                <TableHead className="font-semibold">Nom</TableHead>
                <TableHead className="font-semibold">Contact</TableHead>
                <TableHead className="font-semibold">Accès</TableHead>
                <TableHead className="font-semibold">Fonction</TableHead>
                <TableHead className="font-semibold">Type</TableHead>
                <TableHead className="font-semibold text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employees.map((employee) => (
                <TableRow key={employee.id} className="hover:bg-gray-50 dark:hover:bg-gray-900">
                  <TableCell>
                    <div className="font-medium">
                      {employee.firstName} {employee.lastName}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-gray-600 dark:text-gray-300">{employee.email}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{employee.phone}</div>
                  </TableCell>
                  <TableCell>
                    <Badge color={employee.isUser ? "default" : "secondary"}>
                      {employee.isUser ? (
                        <UserCheck className="h-4 w-4 mr-1" />
                      ) : (
                        <User className="h-4 w-4 mr-1" />
                      )}
                      {employee.isUser ? "Utilisateur" : "Non-utilisateur"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {employee.role ? (
                      <div>
                        <div className="font-medium">{employee.role.label}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">
                          {employee.role.description}
                        </div>
                      </div>
                    ) : (
                      <span className="text-gray-400">Non attribué</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {employee.role ? (
                      <Badge variant="outline" className="capitalize">
                        {employee.role.type}
                      </Badge>
                    ) : null}
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button size="sm" variant="ghost" onClick={() => handleEdit(employee)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => handleDelete(employee.id)}>
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