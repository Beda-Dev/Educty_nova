"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { CheckCircle2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { User, Permission, Role } from "@/lib/interface";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { EditEmailForm } from "./EditEmailForm";
import { EditPasswordForm } from "./EditPasswordForm";
import { EditDialog } from "./EditDialog";
import { useRouter } from "next/navigation";

// Définition des types

export interface RoleWithPermissions extends Role {
  permissions: Permission[];
}

interface UserDetailsProps {
  user: User;
  isLoading?: boolean;
}

// Fonction pour formater la date
function formatDate(dateString: string) {
  if (!dateString) return "Non disponible";
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

// Fonction pour obtenir les initiales d'un nom
function getInitials(name: string) {
  if (!name) return "US";
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

// Fonction pour grouper les permissions par catégorie
function groupPermissionsByCategory(permissions: Permission[]) {
  const categories: Record<string, Permission[]> = {};

  permissions?.forEach((permission) => {
    const parts = permission.name.split(" ");
    if (parts.length >= 2) {
      const category = parts[1];
      if (!categories[category]) {
        categories[category] = [];
      }
      categories[category].push(permission);
    } else {
      // Pour les permissions sans catégorie claire
      if (!categories["autres"]) {
        categories["autres"] = [];
      }
      categories["autres"].push(permission);
    }
  });

  return categories;
}

export function UserDetails({ user, isLoading = false }: UserDetailsProps) {
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const router = useRouter();

  const handleEmailUpdateSuccess = () => {
    // Optionnel: Rafraîchir les données ou afficher un toast
    setEmailModalOpen(false);
  };

  const handlePasswordUpdateSuccess = () => {
    // Optionnel: Rafraîchir les données ou afficher un toast
    setPasswordModalOpen(false);
  };

  // Vérification des permissions de l'utilisateur

  const allPermissions = [
    ...(user?.roles?.flatMap((role) => role.permissions) || []),
    ...(user?.permissions || []),
  ];

  const uniquePermissions = Array.from(
    new Map(
      allPermissions
        .filter((p): p is Permission => p !== undefined)
        .map((p) => [p.id, p])
    ).values()
  );
  const permissionCategories = groupPermissionsByCategory(
    uniquePermissions.filter((p): p is Permission => p !== undefined)
  );

  if (isLoading) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <Card>
          <CardHeader className="flex flex-row items-center gap-4">
            <Skeleton className="h-16 w-16 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-64" />
              <div className="flex gap-2">
                <Skeleton className="h-5 w-20" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-32" />
              </div>
            ))}
          </CardContent>
        </Card>

        <Tabs defaultValue="permissions">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="permissions">
              <Skeleton className="h-5 w-24" />
            </TabsTrigger>
            <TabsTrigger value="roles">
              <Skeleton className="h-5 w-24" />
            </TabsTrigger>
          </TabsList>
          <TabsContent value="permissions">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-64" />
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[...Array(3)].map((_, i) => (
                    <Card key={i}>
                      <CardHeader>
                        <Skeleton className="h-5 w-24" />
                      </CardHeader>
                      <CardContent className="space-y-2">
                        {[...Array(5)].map((_, j) => (
                          <Skeleton key={j} className="h-4 w-full" />
                        ))}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Carte d'information utilisateur */}
      <Card>
        <CardHeader className="flex flex-row items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarFallback className="text-lg bg-primary text-primary-foreground">
              {getInitials(user?.name)}
            </AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-2xl">
              {user?.name || "Utilisateur inconnu"}
            </CardTitle>
            <CardDescription>
              {user?.email || "Email non disponible"}
            </CardDescription>
            <div className="flex mt-2 gap-2 flex-wrap">
              {user?.roles?.length ? (
                user.roles.map((role) => (
                  <Badge key={role.id} className="bg-primary">
                    {role.name}
                  </Badge>
                ))
              ) : (
                <Badge variant="outline">Aucun rôle</Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">ID</p>
              <p>{user?.id || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Créé le</p>
              <p>
                {user?.created_at
                  ? formatDate(user.created_at)
                  : "Non disponible"}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                Dernière mise à jour
              </p>
              <p>
                {user?.updated_at
                  ? formatDate(user.updated_at)
                  : "Non disponible"}
              </p>
            </div>
            {/* <div>
              <p className="text-sm text-muted-foreground">Email vérifié</p>
              <p>
                {user?.email_verified_at ? (
                  <span className="text-green-600">
                    {formatDate(user.email_verified_at)}
                  </span>
                ) : (
                  <span className="text-orange-600">Non vérifié</span>
                )}
              </p>
            </div> */}
          </div>

          <div className="flex gap-2 mt-6">
        <Button 
          variant="outline" 
          // onClick={() => setEmailModalOpen(true)}
          onClick={() => router.push("/profil/modifier_email")}
        >
          Modifier l'email
        </Button>

        <Button 
          variant="outline" 
          onClick={() => setPasswordModalOpen(true)}
        >
          Modifier le mot de passe
        </Button>
      </div>

            {/* Modale Email */}
            <EditDialog
        title="Modifier l'email"
        open={emailModalOpen}
        onOpenChangeAction={setEmailModalOpen}
      >
        <EditEmailForm
          user={user}
          onCloseAction={() => setEmailModalOpen(false)}
          onSuccess={handleEmailUpdateSuccess}
        />
      </EditDialog>

      {/* Modale Password */}
      <EditDialog
        title="Modifier le mot de passe"
        open={passwordModalOpen}
        onOpenChangeAction={setPasswordModalOpen}
      >
        <EditPasswordForm
          user={user}
          onCloseAction={() => setPasswordModalOpen(false)}
          onSuccess={handlePasswordUpdateSuccess}
        />
      </EditDialog>

        </CardContent>
      </Card>

      {/* Onglets pour les rôles et permissions */}
      <Tabs defaultValue="permissions" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="permissions">Permissions</TabsTrigger>
          <TabsTrigger value="roles">Rôles</TabsTrigger>
        </TabsList>

        {/* Contenu de l'onglet Permissions */}
        <TabsContent value="permissions">
          <Card>
            <CardHeader>
              <CardTitle>Permissions</CardTitle>
              <CardDescription>
                {uniquePermissions.length > 0
                  ? `L'utilisateur a ${uniquePermissions.length} permissions`
                  : "Aucune permission attribuée"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {uniquePermissions.length > 0 ? (
                <ScrollArea className="h-[500px] pr-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Object.entries(permissionCategories).map(
                      ([category, permissions]) => (
                        <Card key={category} className="border shadow-sm">
                          <CardHeader className="py-3">
                            <CardTitle className="text-lg capitalize">
                              {category.replace(/_/g, " ")}
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="py-2">
                            <div className="space-y-2">
                              {permissions.map((permission) => (
                                <div
                                  key={permission.id}
                                  className="flex items-center gap-2 p-2 hover:bg-muted/50 rounded"
                                >
                                  <CheckCircle2 className="h-4 w-4 text-primary" />
                                  <span className="text-sm capitalize">
                                    {permission.name.replace(/_/g, " ")}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      )
                    )}
                  </div>
                </ScrollArea>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Aucune permission trouvée
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Contenu de l'onglet Rôles */}
        <TabsContent value="roles">
          <Card>
            <CardHeader>
              <CardTitle>Rôles</CardTitle>
              <CardDescription>
                {user?.roles?.length
                  ? `L'utilisateur a ${user.roles.length} rôle(s)`
                  : "Aucun rôle attribué"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {user?.roles?.length ? (
                <div className="space-y-6">
                  {user.roles.map((role) => (
                    <div key={role.id} className="space-y-4">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold capitalize">
                          {role.name}
                        </h3>
                        <Badge variant="outline">{role.guard_name}</Badge>
                      </div>
                      <div className="flex gap-4 text-sm text-muted-foreground">
                        <p>Créé le: {formatDate(role.created_at)}</p>
                        <p>Mis à jour: {formatDate(role.updated_at)}</p>
                      </div>
                      <Separator />
                      <div>
                        <h4 className="font-medium mb-2">
                          Permissions du rôle ({(role.permissions ?? []).length}
                          )
                        </h4>
                        {(role.permissions ?? []).length > 0 ? (
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                            {(role.permissions ?? []).map((permission) => (
                              <Badge
                                key={permission.id}
                                color="secondary"
                                className="justify-start text-left truncate"
                                title={permission.name}
                              >
                                <span className="truncate capitalize">
                                  {permission.name.replace(/_/g, " ")}
                                </span>
                              </Badge>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">
                            Ce rôle n'a aucune permission
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Aucun rôle attribué à cet utilisateur
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
