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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { CheckCircle2, Mail, Key, User as UserIcon, Shield, ChevronRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { User, Permission, Role } from "@/lib/interface";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { EditEmailForm } from "./EditEmailForm";
import { EditPasswordForm } from "./EditPasswordForm";
import { EditDialog } from "./EditDialog";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

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
      if (!categories["autres"]) {
        categories["autres"] = [];
      }
      categories["autres"].push(permission);
    }
  });

  return categories;
}

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

export function UserDetails({ user, isLoading = false }: UserDetailsProps) {
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const router = useRouter();

  const handleEmailUpdateSuccess = () => {
    setEmailModalOpen(false);
  };

  const handlePasswordUpdateSuccess = () => {
    setPasswordModalOpen(false);
  };

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
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeIn}
      >
        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-start gap-4 pb-3">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="text-lg bg-gradient-to-br from-skyblue to-skyblue/80 text-skyblue-foreground">
                {getInitials(user?.name)}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1.5">
              <CardTitle className="text-2xl flex items-center gap-2">
                {user?.name || "Utilisateur inconnu"}
                <Badge color="skyblue" className="h-5">
                  ID: {user?.id || "N/A"}
                </Badge>
              </CardTitle>
              <CardDescription className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                {user?.email || "Email non disponible"}
              </CardDescription>
              <div className="flex mt-2 gap-2 flex-wrap">
                {user?.roles?.length ? (
                  user.roles.map((role) => (
                    <Badge 
                      key={role.id} 
                      className="bg-gradient-to-r from-primary/90 to-primary/70 text-skyblue-foreground hover:from-primary/80 hover:to-primary/60 transition-colors"
                    >
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
              <motion.div 
                variants={fadeIn}
                className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg"
              >
                <UserIcon className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Créé le</p>
                  <p className="font-medium">
                    {user?.created_at
                      ? formatDate(user.created_at)
                      : "Non disponible"}
                  </p>
                </div>
              </motion.div>

              <motion.div 
                variants={fadeIn}
                className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg"
              >
                <Shield className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Dernière mise à jour</p>
                  <p className="font-medium">
                    {user?.updated_at
                      ? formatDate(user.updated_at)
                      : "Non disponible"}
                  </p>
                </div>
              </motion.div>
            </div>

            <div className="flex gap-2 mt-6">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button 
                  variant="outline" 
                  color="tyrian"
                  className="gap-2"
                  onClick={() => router.push("/profil/modifier_email")}
                >
                  <Mail className="h-4 w-4" />
                  Modifier l'email
                </Button>
              </motion.div>

              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button 
                  variant="outline" 
                  className="gap-2"
                  color="tyrian"
                  onClick={() => setPasswordModalOpen(true)}
                >
                  <Key className="h-4 w-4" />
                  Modifier le mot de passe
                </Button>
              </motion.div>
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
      </motion.div>

      {/* Onglets pour les rôles et permissions */}
      <Tabs defaultValue="permissions" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="permissions" className="gap-2">
            <Shield className="h-4 w-4" /> Permissions
          </TabsTrigger>
          <TabsTrigger value="roles" className="gap-2">
            <UserIcon className="h-4 w-4" /> Rôles
          </TabsTrigger>
        </TabsList>

        {/* Contenu de l'onglet Permissions */}
        <TabsContent value="permissions">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeIn}
          >
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Permissions
                </CardTitle>
                <CardDescription>
                  {uniquePermissions.length > 0
                    ? `L'utilisateur a ${uniquePermissions.length} permission(s)`
                    : "Aucune permission attribuée"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {uniquePermissions.length > 0 ? (
                  <ScrollArea className="h-[500px] pr-4">
                    <motion.div 
                      variants={staggerContainer}
                      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                    >
                      {Object.entries(permissionCategories).map(
                        ([category, permissions]) => (
                        <motion.div 
                          key={category} 
                          variants={fadeIn}
                          whileHover={{ y: -2 }}
                        >
                          <Card className="border shadow-sm hover:shadow-md transition-shadow">
                            <CardHeader className="py-3">
                              <CardTitle className="text-lg capitalize flex items-center justify-between">
                                <span>{category.replace(/_/g, " ")}</span>
                                <Badge variant="outline" className="ml-2">
                                  {permissions.length}
                                </Badge>
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="py-2">
                              <div className="space-y-2">
                                {permissions.map((permission) => (
                                  <TooltipProvider key={permission.id}>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <motion.div 
                                          whileHover={{ x: 5 }}
                                          className="flex items-center gap-2 p-2 hover:bg-muted/50 rounded transition-colors cursor-default"
                                        >
                                          <CheckCircle2 className="h-4 w-4 text-skyblue" />
                                          <span className="text-sm capitalize truncate">
                                            {permission.name.replace(/_/g, " ")}
                                          </span>
                                        </motion.div>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p>{permission.name}</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                ))}
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </motion.div>
                  </ScrollArea>
                ) : (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-8 text-muted-foreground"
                  >
                    Aucune permission trouvée
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* Contenu de l'onglet Rôles */}
        <TabsContent value="roles">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeIn}
          >
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserIcon className="h-5 w-5" />
                  Rôles
                </CardTitle>
                <CardDescription>
                  {user?.roles?.length
                    ? `L'utilisateur a ${user.roles.length} rôle(s)`
                    : "Aucun rôle attribué"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {user?.roles?.length ? (
                  <motion.div 
                    variants={staggerContainer}
                    className="space-y-6"
                  >
                    {user.roles.map((role) => (
                      <motion.div 
                        key={role.id} 
                        variants={fadeIn}
                        className="space-y-4 p-4 border rounded-lg hover:border-primary/30 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <h3 className="text-lg font-semibold capitalize">
                              {role.name}
                            </h3>
                            <Badge color="skyblue">{role.guard_name}</Badge>
                          </div>
                          <ChevronRight className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div className="flex gap-4 text-sm text-muted-foreground">
                          <p>Créé le: {formatDate(role.created_at)}</p>
                          <p>Mis à jour: {formatDate(role.updated_at)}</p>
                        </div>
                        <Separator />
                        <div>
                          <h4 className="font-medium mb-2 flex items-center gap-2">
                            <Shield className="h-4 w-4" />
                            Permissions du rôle ({(role.permissions ?? []).length})
                          </h4>
                          {(role.permissions ?? []).length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                              {(role.permissions ?? []).map((permission) => (
                                <motion.div
                                  key={permission.id}
                                  whileHover={{ scale: 1.02 }}
                                >
                                  <Badge
                                    variant="outline"
                                    className="justify-start text-left truncate w-full hover:bg-primary/5 transition-colors"
                                    title={permission.name}
                                  >
                                    <CheckCircle2 className="h-3 w-3 mr-2 text-skyblue" />
                                    <span className="truncate capitalize">
                                      {permission.name.replace(/_/g, " ")}
                                    </span>
                                  </Badge>
                                </motion.div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-muted-foreground">
                              Ce rôle n'a aucune permission
                            </p>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                ) : (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-8 text-muted-foreground"
                  >
                    Aucun rôle attribué à cet utilisateur
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
}