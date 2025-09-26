"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import {
  CheckCircle2,
  Mail,
  Key,
  UserIcon,
  Shield,
  ChevronRight,
  Calendar,
  Clock,
  AlertCircle,
  Settings,
} from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import type { User, Permission } from "@/lib/interface"
import { Button } from "@/components/ui/button"
import { useState, useMemo, useCallback } from "react"
import { EditEmailForm } from "./EditEmailForm"
import { EditPasswordForm } from "./EditPasswordForm"
import { EditDialog } from "./EditDialog"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { useSchoolStore } from "@/store/index"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { ProxiedImage } from "@/components/ImagesLogO/imageProxy"

interface UserDetailsProps {
  user: User
  isLoading?: boolean
  showActions?: boolean
  compact?: boolean
}

// Utilitaires
const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) return "Non disponible"

  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return "Date invalide"

    return new Intl.DateTimeFormat("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  } catch {
    return "Date invalide"
  }
}

const getInitials = (name: string | null | undefined): string => {
  if (!name || typeof name !== "string") return "US"

  return name
    .trim()
    .split(" ")
    .filter((part) => part.length > 0)
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

const groupPermissionsByCategory = (permissions: Permission[]): Record<string, Permission[]> => {
  if (!Array.isArray(permissions)) return {}

  const categories: Record<string, Permission[]> = {}

  permissions.forEach((permission) => {
    if (!permission?.name) return

    const parts = permission.name.toLowerCase().split(" ")
    const category = parts.length >= 2 ? parts[1] : "autres"

    if (!categories[category]) {
      categories[category] = []
    }
    categories[category].push(permission)
  })

  return categories
}

// Hook pour vérifier les permissions en utilisant le store
const usePermissionCheck = () => {
  const { userOnline, roles, permissions } = useSchoolStore()

  const getUserPermissions = useCallback(
    (user: User): Permission[] => {
      if (!user?.roles || !Array.isArray(user.roles)) return []

      const userPermissions: Permission[] = []

      // Pour chaque rôle de l'utilisateur
      user.roles.forEach((userRole) => {
        // Trouver le rôle complet dans le store
        const fullRole = roles.find((storeRole) => storeRole.id === userRole.id)

        if (fullRole?.permissions && Array.isArray(fullRole.permissions)) {
          // Ajouter les permissions de ce rôle
          fullRole.permissions.forEach((rolePermission) => {
            // Trouver la permission complète dans le store
            const fullPermission = permissions.find(
              (storePermission) =>
                storePermission.id === rolePermission.id || storePermission.name === rolePermission.name,
            )

            if (fullPermission && !userPermissions.some((p) => p.id === fullPermission.id)) {
              userPermissions.push(fullPermission)
            }
          })
        }
      })

      // Ajouter les permissions directes de l'utilisateur s'il en a
      if (user.permissions && Array.isArray(user.permissions)) {
        user.permissions.forEach((userPermission) => {
          if (!userPermissions.some((p) => p.id === userPermission.id)) {
            userPermissions.push(userPermission)
          }
        })
      }

      return userPermissions
    },
    [roles, permissions],
  )

  const hasPermission = useCallback(
    (permissionName: string): boolean => {
      if (!userOnline || !permissionName) return false

      const userPermissions = getUserPermissions(userOnline)
      return userPermissions.some((p) => p.name.toLowerCase() === permissionName.toLowerCase())
    },
    [userOnline, getUserPermissions],
  )

  const hasRole = useCallback(
    (roleName: string): boolean => {
      if (!userOnline || !roleName) return false

      const userRoles = userOnline.roles || []
      return userRoles.some((role) => role.name.toLowerCase() === roleName.toLowerCase())
    },
    [userOnline],
  )

  const getUserRolesWithPermissions = useCallback(
    (user: User) => {
      if (!user?.roles || !Array.isArray(user.roles)) return []

      return user.roles.map((userRole) => {
        // Trouver le rôle complet dans le store
        const fullRole = roles.find((storeRole) => storeRole.id === userRole.id)

        if (!fullRole) return { ...userRole, permissions: [] }

        // Récupérer les permissions complètes pour ce rôle
        const rolePermissions = (fullRole.permissions || []).map((rolePermission) => {
          const fullPermission = permissions.find(
            (storePermission) =>
              storePermission.id === rolePermission.id || storePermission.name === rolePermission.name,
          )
          return fullPermission || rolePermission
        })

        return {
          ...userRole,
          permissions: rolePermissions,
        }
      })
    },
    [roles, permissions],
  )

  return { hasPermission, hasRole, getUserPermissions, getUserRolesWithPermissions }
}

// Animations
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const slideIn = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.2 } },
}

export function UserDetails({ user, isLoading = false, showActions = true, compact = false }: UserDetailsProps) {
  const [emailModalOpen, setEmailModalOpen] = useState(false)
  const [passwordModalOpen, setPasswordModalOpen] = useState(false)
  const [showAllPermissions, setShowAllPermissions] = useState(false)
  const [activeTab, setActiveTab] = useState("permissions")
  const url = process.env.NEXT_PUBLIC_API_BASE_URL_2 as string

  const router = useRouter()
  const { userOnline } = useSchoolStore()
  const { hasPermission, hasRole, getUserPermissions, getUserRolesWithPermissions } = usePermissionCheck()

  // Vérifications de permissions
  // const canEditUser = hasPermission("modifier utilisateur") || hasRole("Administarteur") || hasRole("Directeur")
  // const canViewUserDetails = hasPermission("voir utilisateur") || hasRole("Administarteur")  || hasRole("Directeur")

  // Calculs mémorisés - utilisation du store pour récupérer les permissions
  const userPermissions = useMemo(() => getUserPermissions(user), [user, getUserPermissions])
  const userRolesWithPermissions = useMemo(() => getUserRolesWithPermissions(user), [user, getUserRolesWithPermissions])

  const permissionCategories = useMemo(() => groupPermissionsByCategory(userPermissions), [userPermissions])

  // Handlers
  const handleEmailUpdateSuccess = useCallback(() => {
    setEmailModalOpen(false)
  }, [])

  const handlePasswordUpdateSuccess = useCallback(() => {
    setPasswordModalOpen(false)
  }, [])

  // // Vérification des accès
  // if (!canViewUserDetails) {
  //   return (
  //     <Alert className="max-w-md mx-auto mt-8">
  //       <AlertCircle className="h-4 w-4" />
  //       <AlertDescription>Vous n'avez pas les permissions nécessaires pour voir ces détails.</AlertDescription>
  //     </Alert>
  //   )
  // }

  // Loading state
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
                <Skeleton className="h-5 w-24" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-32" />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Vérification de la validité de l'utilisateur
  if (!user || !user.id) {
    return (
      <Alert className="max-w-md mx-auto mt-8" color="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>Utilisateur non trouvé ou données invalides.</AlertDescription>
      </Alert>
    )
  }

  return (
    <TooltipProvider>
      <div className={cn("container mx-auto py-6 space-y-6", compact && "py-4 space-y-4")}>
        {/* Carte d'information utilisateur */}
        <motion.div initial="hidden" animate="visible" variants={fadeIn}>
          <Card className="shadow-sm hover:shadow-md transition-all duration-200 border-l-4 border-l-primary">
            <CardHeader className="flex flex-row items-start gap-4 pb-3">
              <div className="relative">
                <Avatar className={cn("h-16 w-16", compact && "h-12 w-12")}>
                  {user.avatar ? (
                    (() => {
                      const raw = String(user.avatar);
                      const src = /^https?:\/\//i.test(raw) ? raw : `${url}/${raw}`;
                      return (
                        <ProxiedImage
                          src={src}
                          alt={user.name || "Avatar"}
                          className="h-full w-full rounded-full object-cover"
                        />
                      );
                    })()
                  ) : (
                    <AvatarFallback className="text-lg bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
                      {getInitials(user.name)}
                    </AvatarFallback>
                  )}

                </Avatar>
                {user.active ? (
                  <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-green-500 border-2 border-background rounded-full" />
                ) : (
                  <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-red-500 border-2 border-background rounded-full" />
                )}
              </div>

              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <CardTitle className={cn("text-2xl", compact && "text-xl")}>
                    {user.name || "Utilisateur inconnu"}
                  </CardTitle>
                  {/* <Badge variant="outline" className="h-5">
                    ID: {user.id}
                  </Badge> */}
                  {user.hierarchical_id && (
                    <Badge color="secondary" className="h-5">
                      Supérieur Hiérarchique: {user.superior?.name}
                    </Badge>
                  )}
                </div>

                <CardDescription className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  {user.email || "Email non disponible"}
                  {user.email_verified_at && (
                    <Tooltip>
                      <TooltipTrigger>
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      </TooltipTrigger>
                      <TooltipContent>Email vérifié le {formatDate(user.email_verified_at)}</TooltipContent>
                    </Tooltip>
                  )}
                </CardDescription>

                <div className="flex mt-2 gap-2 flex-wrap">
                  {user.roles && user.roles.length > 0 ? (
                    user.roles.map((role) => (
                      <motion.div key={role.id} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Badge className="bg-gradient-to-r from-primary/90 to-primary/70 text-primary-foreground hover:from-primary/80 hover:to-primary/60 transition-colors">
                          <Shield className="h-3 w-3 mr-1" />
                          {role.name}
                        </Badge>
                      </motion.div>
                    ))
                  ) : (
                    <Badge variant="outline">Aucun rôle</Badge>
                  )}

                  <Badge color={user.active ? "success" : "destructive"}>{user.active ? "Actif" : "Inactif"}</Badge>
                </div>

              </div>
            </CardHeader>

            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <motion.div
                  variants={slideIn}
                  className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg hover:bg-muted/70 transition-colors"
                >
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Créé le</p>
                    <p className="font-medium">{formatDate(user.created_at)}</p>
                  </div>
                </motion.div>

                <motion.div
                  variants={slideIn}
                  className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg hover:bg-muted/70 transition-colors"
                >
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Dernière mise à jour</p>
                    <p className="font-medium">{formatDate(user.updated_at)}</p>
                  </div>
                </motion.div>

                {user.superior && (
                  <motion.div
                    variants={slideIn}
                    className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg hover:bg-muted/70 transition-colors"
                  >
                    <UserIcon className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Supérieur</p>
                      <p className="font-medium">{user.superior.name}</p>
                    </div>
                  </motion.div>
                )}
              </div>

              {showActions && (
                <div className="flex gap-2 mt-6 flex-wrap">
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button variant="outline" className="gap-2 bg-transparent" onClick={() => setEmailModalOpen(true)}>
                      <Mail className="h-4 w-4" />
                      Modifier l'email
                    </Button>
                  </motion.div>

                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      variant="outline"
                      className="gap-2 bg-transparent"
                      onClick={() => setPasswordModalOpen(true)}
                    >
                      <Key className="h-4 w-4" />
                      Modifier le mot de passe
                    </Button>
                  </motion.div>

                  {/* <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      variant="outline"
                      className="gap-2 bg-transparent"
                      onClick={() => router.push(`/users/${user.id}/edit`)}
                    >
                      <Settings className="h-4 w-4" />
                      Paramètres
                    </Button>
                  </motion.div> */}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Onglets pour les rôles et permissions */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="permissions" className="gap-2">
              <Shield className="h-4 w-4" />
              Permissions ({userPermissions.length})
            </TabsTrigger>
            <TabsTrigger value="roles" className="gap-2">
              <UserIcon className="h-4 w-4" />
              Rôles ({user.roles?.length || 0})
            </TabsTrigger>
          </TabsList>

          {/* Contenu de l'onglet Permissions */}
          <TabsContent value="permissions">
            <motion.div initial="hidden" animate="visible" variants={fadeIn}>
              <Card className="shadow-sm">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5" />
                        Permissions
                      </CardTitle>
                      <CardDescription>
                        {userPermissions.length > 0
                          ? `L'utilisateur a ${userPermissions.length} permission(s) via ses rôles`
                          : "Aucune permission attribuée"}
                      </CardDescription>
                    </div>

                    {userPermissions.length > 12 && (
                      <div className="flex items-center space-x-2">
                        <Label htmlFor="show-all" className="text-sm">
                          Tout afficher
                        </Label>
                        <Switch id="show-all" checked={showAllPermissions} onCheckedChange={setShowAllPermissions} />
                      </div>
                    )}
                  </div>
                </CardHeader>

                <CardContent>
                  {userPermissions.length > 0 ? (
                    <ScrollArea className={cn("pr-4", compact ? "h-[300px]" : "h-[500px]")}>
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={showAllPermissions ? "all" : "limited"}
                          variants={staggerContainer}
                          initial="hidden"
                          animate="visible"
                          exit="hidden"
                          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                        >
                          {Object.entries(permissionCategories).map(([category, permissions]) => (
                            <motion.div key={category} variants={fadeIn} whileHover={{ y: -2 }} className="group">
                              <Card className="border shadow-sm hover:shadow-md transition-all duration-200 group-hover:border-primary/30">
                                <CardHeader className="py-3">
                                  <CardTitle className="text-lg capitalize flex items-center justify-between">
                                    <span className="flex items-center gap-2">
                                      <div className="h-2 w-2 bg-primary rounded-full" />
                                      {category.replace(/_/g, " ")}
                                    </span>
                                    <Badge variant="outline" className="ml-2">
                                      {permissions.length}
                                    </Badge>
                                  </CardTitle>
                                </CardHeader>
                                <CardContent className="py-2">
                                  <div className="space-y-2">
                                    {permissions.slice(0, showAllPermissions ? undefined : 5).map((permission) => (
                                      <Tooltip key={permission.id}>
                                        <TooltipTrigger asChild>
                                          <motion.div
                                            whileHover={{ x: 5 }}
                                            className="flex items-center gap-2 p-2 hover:bg-muted/50 rounded transition-colors cursor-default"
                                          >
                                            <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                                            <span className="text-sm capitalize truncate">
                                              {permission.name.replace(/_/g, " ")}
                                            </span>
                                          </motion.div>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                          <div className="space-y-1">
                                            <p className="font-medium">{permission.name}</p>
                                            <p className="text-xs text-muted-foreground">
                                              Guard: {permission.guard_name}
                                            </p>
                                          </div>
                                        </TooltipContent>
                                      </Tooltip>
                                    ))}

                                    {!showAllPermissions && permissions.length > 5 && (
                                      <div className="text-xs text-muted-foreground text-center py-1">
                                        +{permissions.length - 5} autres...
                                      </div>
                                    )}
                                  </div>
                                </CardContent>
                              </Card>
                            </motion.div>
                          ))}
                        </motion.div>
                      </AnimatePresence>
                    </ScrollArea>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center py-8 text-muted-foreground"
                    >
                      <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Aucune permission trouvée</p>
                    </motion.div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Contenu de l'onglet Rôles */}
          <TabsContent value="roles">
            <motion.div initial="hidden" animate="visible" variants={fadeIn}>
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <UserIcon className="h-5 w-5" />
                    Rôles
                  </CardTitle>
                  <CardDescription>
                    {user.roles && user.roles.length > 0
                      ? `L'utilisateur a ${user.roles.length} rôle(s)`
                      : "Aucun rôle attribué"}
                  </CardDescription>
                </CardHeader>

                <CardContent>
                  {userRolesWithPermissions && userRolesWithPermissions.length > 0 ? (
                    <ScrollArea className={cn("pr-4", compact ? "h-[300px]" : "h-[500px]")}>
                      <motion.div variants={staggerContainer} className="space-y-6">
                        {userRolesWithPermissions.map((role) => (
                          <motion.div
                            key={role.id}
                            variants={fadeIn}
                            className="space-y-4 p-4 border rounded-lg hover:border-primary/30 transition-all duration-200 hover:shadow-sm"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className="h-3 w-3 bg-primary rounded-full" />
                                <h3 className="text-lg font-semibold capitalize">{role.name}</h3>
                                <Badge color="secondary">{role.guard_name}</Badge>
                              </div>
                              <ChevronRight className="h-5 w-5 text-muted-foreground" />
                            </div>

                            <Separator />

                            <div>
                              <h4 className="font-medium mb-3 flex items-center gap-2">
                                <Shield className="h-4 w-4" />
                                Permissions du rôle ({role.permissions?.length || 0})
                              </h4>

                              {role.permissions && role.permissions.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                                  {role.permissions.map((permission) => (
                                    <motion.div key={permission.id} whileHover={{ scale: 1.02 }}>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <Badge
                                            variant="outline"
                                            className="justify-start text-left truncate w-full hover:bg-primary/5 transition-colors cursor-default"
                                          >
                                            <CheckCircle2 className="h-3 w-3 mr-2 text-green-500 flex-shrink-0" />
                                            <span className="truncate capitalize">
                                              {permission.name.replace(/_/g, " ")}
                                            </span>
                                          </Badge>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                          <div className="space-y-1">
                                            <p className="font-medium">{permission.name}</p>
                                            <p className="text-xs text-muted-foreground">
                                              Guard: {permission.guard_name}
                                            </p>
                                          </div>
                                        </TooltipContent>
                                      </Tooltip>
                                    </motion.div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-sm text-muted-foreground italic">Ce rôle n'a aucune permission</p>
                              )}
                            </div>
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
                      <UserIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Aucun rôle attribué à cet utilisateur</p>
                    </motion.div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>

        {/* Modales */}
        {true && (
          <>
            <EditDialog title="Modifier l'email" open={emailModalOpen} onOpenChangeAction={setEmailModalOpen}>
              <EditEmailForm
                user={user}
                onCloseAction={() => setEmailModalOpen(false)}
                onSuccess={handleEmailUpdateSuccess}
              />
            </EditDialog>

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
          </>
        )}
      </div>
    </TooltipProvider>
  )
}
