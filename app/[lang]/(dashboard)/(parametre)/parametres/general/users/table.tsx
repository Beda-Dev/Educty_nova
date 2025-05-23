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
import { Icon } from "@iconify/react";
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

  return (
    <Card title="Utilisateurs">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-xl">Utilisateurs</CardTitle>
        <Badge variant="outline">Total utilisateurs : {users.length}</Badge>
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
          {hasAdminAccessCreer && (
            <div>
              <AddUserDialog roles={roles} />
            </div>
          )}
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="font-semibold">Utilisateur</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Rôle(s)</TableHead>
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
                        <AvatarFallback>
                          {item.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
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
                  <TableCell className="flex justify-end">
                    <div className="flex gap-3">
                      {true ? (
                        <EditingDialog user={item} roles={roles} />
                      ) : null}
                      {hasAdminAccessSupprimer ? (
                        <DeleteUserButton userId={item.id} users={users} />
                      ) : null}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>

        <Pagination className="mt-4">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                className={page === 1 ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>
            <PaginationItem>
              <span className="text-sm px-2">
                Page {page} sur {Math.ceil(filteredUsers.length / itemsPerPage)}
              </span>
            </PaginationItem>
            <PaginationItem>
              <PaginationNext
                onClick={() =>
                  setPage((prev) =>
                    prev < Math.ceil(filteredUsers.length / itemsPerPage)
                      ? prev + 1
                      : prev
                  )
                }
                className={
                  page >= Math.ceil(filteredUsers.length / itemsPerPage)
                    ? "pointer-events-none opacity-50"
                    : ""
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </CardContent>
    </Card>
  );
};

export default TableUser;

const EditingDialog = ({ user, roles }: { user: User; roles: Role[] }) => {
  const { setUsers } = useSchoolStore();
  const [selectedRoles, setSelectedRoles] = useState<
    { value: string; label: string }[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const animatedComponents = makeAnimated();

  // Convert roles to options format
  const roleOptions = roles.map((role) => ({
    value: role.name,
    label: role.name,
  }));

  // Initialize selected roles
  useEffect(() => {
    if (user.roles) {
      setSelectedRoles(
        user.roles.map((role) => ({
          value: role.name,
          label: role.name,
        }))
      );
    }
  }, [user]);

  const updateUserRoles = async (userId: number, roles: string[]) => {
    setIsLoading(true);
    try {
      // First remove all existing roles
      await Promise.all(
        user.roles.map(async (role) => {
          const response = await fetch(
            `https://educty.digifaz.com/api/users/${userId}/remove-role`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ role: role.name }),
            }
          );
          if (!response.ok) throw new Error("Failed to remove role");
        })
      );

      // Then add new roles
      await Promise.all(
        roles.map(async (roleName) => {
          const response = await fetch(
            `https://educty.digifaz.com/api/users/${userId}/assign-role`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ role: roleName }),
            }
          );
          if (!response.ok) throw new Error("Failed to assign role");
        })
      );

      // Refresh user data
      const updatedUser: User[] = await fetchUsers();
      setUsers(updatedUser);

      toast.success("Rôles mis à jour avec succès !");
    } catch (error) {
      console.error("Error updating roles:", error);
      toast.error("Erreur lors de la mise à jour des rôles");
    } finally {
      setIsLoading(false);
    }
  };

  const CustomOption = (props: any) => {
    return (
      <components.Option {...props}>
        <div className="flex items-center gap-2">
          <Icon icon="heroicons:user-circle" className="h-4 w-4" />
          {props.data.label}
        </div>
      </components.Option>
    );
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="icon" color="tyrian" className="h-7 w-7">
          <Icon icon="heroicons:pencil" className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Modifier l'utilisateur</DialogTitle>
          <form
            className="space-y-5 pt-4"
            onSubmit={async (e) => {
              e.preventDefault();
              const rolesToAssign = selectedRoles.map((role) => role.value);
              await updateUserRoles(user.id, rolesToAssign);
            }}
          >
            <div>
              <Label>Nom</Label>
              <Input name="name" defaultValue={user.name} required disabled />
            </div>
            <div>
              <Label>Email</Label>
              <Input
                name="email"
                type="email"
                defaultValue={user.email}
                required
                disabled
              />
            </div>
            <div>
              <Label>Rôles</Label>
              <Select
                isMulti
                options={roleOptions}
                value={selectedRoles}
                onChange={(selected: any) => setSelectedRoles(selected)}
                components={{
                  ...animatedComponents,
                  Option: CustomOption,
                }}
                className="react-select"
                classNamePrefix="select"
                placeholder="Sélectionner des rôles..."
                noOptionsMessage={() => "Aucun rôle disponible"}
                closeMenuOnSelect={false}
              />
            </div>
            <div className="flex justify-end space-x-3">
              <DialogClose asChild>
                <Button type="button" color="destructive" disabled={isLoading}>
                  Annuler
                </Button>
              </DialogClose>
              <Button type="submit" color="tyrian" disabled={isLoading}>
                {isLoading ? "Enregistrement..." : "Sauvegarder"}
              </Button>
            </div>
          </form>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

const DeleteUserButton = ({
  userId,
  users,
}: {
  userId: number;
  users: User[];
}) => {
  const { setUsers } = useSchoolStore();
  const [isDeleting, setIsDeleting] = useState(false);

  const deleteUser = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/user?id=${userId}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Échec de la suppression");

      setUsers(users.filter((use: User) => use.id !== userId));
      toast.success("Utilisateur supprimé !");
    } catch (error) {
      toast.error("Erreur lors de la suppression");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button size="icon" color="bittersweet" className="h-7 w-7">
          <Icon icon="heroicons:trash" className="h-4 w-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
          <p>Cette action est irréversible.</p>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel variant={"outline"} >Annuler</AlertDialogCancel>
          <AlertDialogAction
            onClick={deleteUser}
            className="bg-red-600 hover:bg-red-700"
            disabled={isDeleting}
          >
            {isDeleting ? "Suppression..." : "Supprimer"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

const AddUserDialog = ({ roles }: { roles: Role[] }) => {
  const { setUsers } = useSchoolStore();
  const [selectedRoles, setSelectedRoles] = useState<
    { value: string; label: string }[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const animatedComponents = makeAnimated();

  const roleOptions = roles.map((role) => ({
    value: role.name,
    label: role.name,
  }));

  const addUser = async (newUser: {
    name: string;
    email: string;
    password: string;
    roles: string[];
  }) => {
    setIsLoading(true);
    try {
      // console.log("nouvelle utilisateur a creer : ", newUser);
      // First create the user
      const response = await fetch("/api/user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: newUser.name,
          email: newUser.email,
          password: newUser.password,
        }),
      });

      if (!response.ok)
        throw new Error("Échec de la création de l'utilisateur");

      const createdUser = await response.json();

      // console.log("utilisateur creer : ", createdUser);

      // Then assign roles
      await Promise.all(
        newUser.roles.map(async (roleName) => {
          const roleResponse = await fetch(
            `https://educty.digifaz.com/api/users/${createdUser.id}/assign-role`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ role: roleName }),
            }
          );
          if (!roleResponse.ok)
            throw new Error("Échec de l'attribution du rôle");
        })
      );

      // Refresh user list
      const usersData: User[] = await fetchUsers();
      setUsers(usersData);

      toast.success("Utilisateur ajouté avec succès !");
    } catch (error) {
      console.error("Error adding user:", error);
      toast.error("Erreur lors de l'ajout de l'utilisateur");
    } finally {
      setIsLoading(false);
    }
  };

  const CustomOption = (props: any) => {
    return (
      <components.Option {...props}>
        <div className="flex items-center gap-2">
          <Icon icon="heroicons:user-circle" className="h-4 w-4" />
          {props.data.label}
        </div>
      </components.Option>
    );
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button color="indigodye">Ajouter un utilisateur</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ajouter un utilisateur</DialogTitle>
          <form
            className="space-y-5 pt-4"
            onSubmit={async (e) => {
              e.preventDefault();
              const formData = new FormData(e.target as HTMLFormElement);
              await addUser({
                name: formData.get("name") as string,
                email: formData.get("email") as string,
                password: formData.get("password") as string,
                roles: selectedRoles.map((role) => role.value),
              });
            }}
          >
            <Input name="name" placeholder="Nom" required />
            <Input name="email" placeholder="Email" type="email" required />
            <Input
              name="password"
              placeholder="Mot de passe"
              type="password"
              required
            />
            <div>
              <Label>Rôles</Label>
              <Select
                isMulti
                options={roleOptions}
                value={selectedRoles}
                onChange={(selected: any) => setSelectedRoles(selected)}
                components={{
                  ...animatedComponents,
                  Option: CustomOption,
                }}
                className="react-select"
                classNamePrefix="select"
                placeholder="Sélectionner des rôles..."
                noOptionsMessage={() => "Aucun rôle disponible"}
                closeMenuOnSelect={false}
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <DialogClose asChild>
                <Button type="reset" color="bittersweet" disabled={isLoading}>
                  Annuler
                </Button>
              </DialogClose>

              <Button type="submit" color="indigodye" disabled={isLoading}>
                {isLoading ? "Création..." : "Ajouter"}
              </Button>
            </div>
          </form>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};
