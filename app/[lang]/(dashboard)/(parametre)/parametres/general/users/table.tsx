"use client";

import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { User, Role } from "@/lib/interface";
import { Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useSchoolStore } from "@/store";
import Select, { GroupBase, components } from "react-select";
import makeAnimated from "react-select/animated";
import { fetchUsers } from "@/store/schoolservice";
import ErrorPage from "@/app/[lang]/non-Autoriser";
import { verificationPermission } from "@/lib/fonction";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { AddUserModal } from "./modals/AddUserModal";
import { EditUserModal } from "./modals/EditUserModal";
import { DeleteUserModal } from "./modals/DeleteUserModal";

const TableUser = ({ users, roles }: { users: User[]; roles: Role[] }) => {
  const { userOnline, setUsers } = useSchoolStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

  const permissionRequisCreer = ["creer utilisateur"];
  const permissionRequisSupprimer = ["supprimer utilisateur"];
  const permissionRequisModifier = ["modifier utilisateur"];
  const permissionRequisAssigner = ["assigner role"];
  const permissionRequisVoir = ["voir utilisateur"];

  const hasAdminAccessVoir = verificationPermission(
    { permissionNames: userOnline?.permissionNames || [] },
    permissionRequisVoir
  );

  const hasAdminAccessCreer = verificationPermission(
    { permissionNames: userOnline?.permissionNames || [] },
    permissionRequisCreer
  );
  const hasAdminAccessModifier = verificationPermission(
    { permissionNames: userOnline?.permissionNames || [] },
    permissionRequisModifier
  );
  const hasAdminAccessSupprimer = verificationPermission(
    { permissionNames: userOnline?.permissionNames || [] },
    permissionRequisSupprimer
  );

  const hasAdminAccessAssigner = verificationPermission(
    { permissionNames: userOnline?.permissionNames || [] },
    permissionRequisAssigner
  );

  // if (hasAdminAccessVoir === false) {
  //   return (
  //     <Card>
  //       <ErrorPage />
  //     </Card>
  //   );
  // }
  // fonction pour les filtres
  const filteredUsers = users.filter((u) => {
    const matchSearch =
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchRole = selectedRole
      ? u.roles.some((r) => r.name === selectedRole)
      : true;
    return matchSearch && matchRole;
  });

  const paginatedUsers = filteredUsers.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  const handleSuccess = async () => {
    const updatedUsers = await fetchUsers();
    if (updatedUsers) {
      setUsers(updatedUsers);
    }
  };

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  return (
    <Card title="Utilisateurs">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-xl">Utilisateurs</CardTitle>
        <Badge variant="outline">utilisateurs : {filteredUsers.length}</Badge>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
          {/* Filtres à gauche */}
          <div className="flex items-center gap-4 flex-wrap">
            <Input
              placeholder="Rechercher un nom ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-64"
            />
            <Select
              options={[
                { value: null, label: "Tous les rôles" },
                ...roles.map((r) => ({ value: r.name, label: r.name })),
              ]}
              onChange={(option) => setSelectedRole(option?.value || null)}
              placeholder="Filtrer par rôle"
              isClearable
              className="min-w-[200px]"
            />
          </div>

          {/* Bouton à droite */}
          {true && (
            <div>
              <AddUserModal roles={roles} onSuccess={handleSuccess} />
            </div>
          )}
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="font-semibold">Utilisateur</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Rôle(s)</TableHead>
              <TableHead>Supérieur</TableHead>
              <TableHead>Subordonnés</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedUsers.map((item) => {
              return (
                <TableRow key={item.email}>
                  <TableCell className="font-medium text-card-foreground/80">
                    <div className="flex gap-3 items-center">
                      <Avatar className="rounded-full">
                        {item.avatar ? (
                          <img
                            src={item.avatar.includes('http') ? item.avatar : `${process.env.NEXT_PUBLIC_API_BASE_URL || ''}${item.avatar}`}
                            alt={item.name}
                            width={40}
                            height={40}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <AvatarFallback>
                            {item.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <span className="text-sm text-card-foreground flex">
                        {item.name}{" "}
                        {item.name === userOnline?.name ? (
                          <p className="text-sm text-slate-400"> (vous)</p>
                        ) : (
                          ""
                        )}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>{item.email}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {item.roles.map((roleItem) => (
                        <Badge
                          key={roleItem.id}
                          variant="soft"
                          className="capitalize"
                        >
                          {roleItem.name}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    {item.superior ? (
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          {item.superior.avatar ? (
                            <img
                              src={item.superior.avatar.includes('http') ? item.superior.avatar : `${process.env.NEXT_PUBLIC_API_BASE_URL_2 || ''}${item.superior.avatar}`}
                              alt={item.superior.name}
                              width={24}
                              height={24}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <AvatarFallback className="text-xs">
                              {item.superior.name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          )}
                        </Avatar>
                        <span className="text-sm">{item.superior.name}</span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-sm">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>{item.subordinates?.length || 0}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className={`h-2.5 w-2.5 rounded-full ${item.active ? 'bg-green-500' : 'bg-red-500'}`} />
                      <span className="text-sm">
                        {item.active ? 'Actif' : 'Inactif'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="flex justify-end">
                    <div className="flex gap-3">
                      {true && (
                        <EditUserModal
                          user={item}
                          roles={roles}
                          onSuccess={handleSuccess}
                        />
                      )}
                      {/* {false && (
                        <DeleteUserModal
                          userId={item.id}
                          onSuccess={handleSuccess}
                        />
                      )} */}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>

        {filteredUsers.length > itemsPerPage && (
          <div className="mt-4 flex justify-center">
            <Pagination>
              <PaginationContent>
                {/* Previous */}
                <PaginationItem>
                  {page === 1 ? (
                    <PaginationPrevious className="cursor-not-allowed opacity-50" />
                  ) : (
                    <PaginationPrevious
                      onClick={() => setPage((p) => Math.max(p - 1, 1))}
                    />
                  )}
                </PaginationItem>

                {/* Pages */}
                {Array.from({ length: Math.min(3, totalPages) }, (_, i) => {
                  const pageNum = i + 1;
                  return (
                    <PaginationItem key={pageNum}>
                      <Button
                        variant={page === pageNum ? "soft" : "ghost"}
                        onClick={() => setPage(pageNum)}
                      >
                        {pageNum}
                      </Button>
                    </PaginationItem>
                  );
                })}

                {/* Ellipsis */}
                {totalPages > 3 && page < totalPages - 1 && (
                  <PaginationItem>
                    <span className="px-2 text-muted-foreground">…</span>
                  </PaginationItem>
                )}

                {/* Dernière page */}
                {totalPages > 3 && page < totalPages && (
                  <PaginationItem>
                    <Button
                      variant={page === totalPages ? "outline" : "ghost"}
                      onClick={() => setPage(totalPages)}
                    >
                      {totalPages}
                    </Button>
                  </PaginationItem>
                )}

                {/* Next */}
                <PaginationItem>
                  {page === totalPages ? (
                    <PaginationNext className="cursor-not-allowed opacity-50" />
                  ) : (
                    <PaginationNext
                      onClick={() =>
                        setPage((p) => Math.min(p + 1, totalPages))
                      }
                    />
                  )}
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TableUser;
