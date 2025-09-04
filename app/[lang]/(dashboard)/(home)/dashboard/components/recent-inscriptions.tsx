"use client"

import { useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  Users,
  Search,
  Filter,
  Calendar,
  MapPin,
  Phone,
  Eye,
  Edit,
  UserPlus,
  Clock,
  TrendingUp,
  School,
  User,
  ChevronRight,
  Star,
  AlertCircle,
} from "lucide-react"
import { formatDistanceToNow, format, isToday, isYesterday, isThisWeek } from "date-fns"
import { fr } from "date-fns/locale"
import { cn } from "@/lib/utils"
import type { Registration, AcademicYear } from "@/lib/interface"
import {useRouter} from "next/navigation"

interface Props {
  inscriptions: Registration[]
  academicYear: AcademicYear
}

const RecentInscriptions = ({ inscriptions, academicYear }: Props) => {
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState<"date" | "name" | "class">("date")
  const [filterBy, setFilterBy] = useState<"all" | "today" | "week" | "month">("all")
  const [genderFilter, setGenderFilter] = useState<"all" | "male" | "female">("all")
  const [selectedInscription, setSelectedInscription] = useState<Registration | null>(null)
  const router = useRouter()

  // Filtrer et trier les inscriptions
  const processedInscriptions = useMemo(() => {
    let filtered = inscriptions.filter((inscription) => inscription.academic_year_id === academicYear?.id)

    // Filtrage par recherche
    if (searchTerm) {
      filtered = filtered.filter(
        (inscription) =>
          inscription.student.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          inscription.student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          inscription.classe.label.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Filtrage par période
    const now = new Date()
    if (filterBy !== "all") {
      filtered = filtered.filter((inscription) => {
        const regDate = new Date(inscription.registration_date)
        switch (filterBy) {
          case "today":
            return isToday(regDate)
          case "week":
            return isThisWeek(regDate, { locale: fr })
          case "month":
            return regDate.getMonth() === now.getMonth() && regDate.getFullYear() === now.getFullYear()
          default:
            return true
        }
      })
    }

    // Filtrage par sexe
    if (genderFilter !== "all") {
      filtered = filtered.filter((inscription) => {
        const sexe = inscription.student.sexe?.toLowerCase()
        if (genderFilter === "female") {
          return ["f", "féminin", "feminin", "female"].includes(sexe)
        } else {
          return ["m", "masculin", "male"].includes(sexe)
        }
      })
    }

    // Tri
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return `${a.student.first_name} ${a.student.name}`.localeCompare(`${b.student.first_name} ${b.student.name}`)
        case "class":
          return a.classe.label.localeCompare(b.classe.label)
        case "date":
        default:
          return new Date(b.registration_date).getTime() - new Date(a.registration_date).getTime()
      }
    })

    return filtered.slice(0, 20) // Limiter à 20 résultats
  }, [inscriptions, academicYear, searchTerm, sortBy, filterBy, genderFilter])

  // Statistiques
  const stats = useMemo(() => {
    const today = processedInscriptions.filter((reg) => isToday(new Date(reg.registration_date))).length
    const thisWeek = processedInscriptions.filter((reg) =>
      isThisWeek(new Date(reg.registration_date), { locale: fr }),
    ).length
    const femaleCount = processedInscriptions.filter((reg) =>
      ["f", "féminin", "feminin", "female"].includes(reg.student?.sexe?.toLowerCase()),
    ).length
    const maleCount = processedInscriptions.length - femaleCount

    return { today, thisWeek, femaleCount, maleCount, total: processedInscriptions.length }
  }, [processedInscriptions])

  // Grouper par période pour l'affichage
  const groupedInscriptions = useMemo(() => {
    const groups: { [key: string]: Registration[] } = {}

    processedInscriptions.forEach((inscription) => {
      const regDate = new Date(inscription.registration_date)
      let groupKey = ""

      if (isToday(regDate)) {
        groupKey = "Aujourd'hui"
      } else if (isYesterday(regDate)) {
        groupKey = "Hier"
      } else if (isThisWeek(regDate, { locale: fr })) {
        groupKey = "Cette semaine"
      } else {
        groupKey = format(regDate, "MMMM yyyy", { locale: fr })
      }

      if (!groups[groupKey]) {
        groups[groupKey] = []
      }
      groups[groupKey].push(inscription)
    })

    return groups
  }, [processedInscriptions])

  const getTimeAgo = (date: Date) => {
    return formatDistanceToNow(date, { addSuffix: true, locale: fr })
  }

  const getGenderInfo = (sexe: string) => {
    const isFemale = ["f", "féminin", "feminin", "female"].includes(sexe?.toLowerCase())
    return {
      isFemale,
      icon: isFemale ? "👩" : "👨",
      color: isFemale ? "text-pink-600 bg-pink-50 border-pink-200" : "text-blue-600 bg-blue-50 border-blue-200",
      label: isFemale ? "F" : "M",
    }
  }

  const getRegistrationPriority = (registration: Registration) => {
    const regDate = new Date(registration.registration_date)
    if (isToday(regDate)) return "high"
    if (isThisWeek(regDate, { locale: fr })) return "medium"
    return "low"
  }

  if (!processedInscriptions.length && !searchTerm && filterBy === "all") {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Inscriptions récentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32 text-muted-foreground">
            <div className="text-center space-y-2">
              <UserPlus className="h-8 w-8 mx-auto opacity-50" />
              <p className="text-sm">Aucune inscription récente</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-2">
      {/* En-tête avec statistiques */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="text-center p-3 bg-primary/10 rounded-lg">
          <div className="text-lg font-bold text-primary">{stats.total}</div>
          <div className="text-xs text-muted-foreground">Total</div>
        </div>
        <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
          <div className="text-lg font-bold text-green-600">{stats.today}</div>
          <div className="text-xs text-green-700">Aujourd'hui</div>
        </div>
        <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="text-lg font-bold text-blue-600">{stats.thisWeek}</div>
          <div className="text-xs text-blue-700">Cette semaine</div>
        </div>
        <div className="text-center p-3 bg-purple-50 rounded-lg border border-purple-200">
          <div className="text-lg font-bold text-purple-600">
            {stats.femaleCount}/{stats.maleCount}
          </div>
          <div className="text-xs text-purple-700">F/M</div>
        </div>
      </div>

      {/* Contrôles de filtrage */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher par nom ou classe..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline" size="sm" className="gap-2 bg-transparent">
            <Filter className="h-4 w-4" />
            Filtres
          </Button>
        </div>

        <div className="flex flex-wrap gap-2">
          <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date">Par date</SelectItem>
              <SelectItem value="name">Par nom</SelectItem>
              <SelectItem value="class">Par classe</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterBy} onValueChange={(value: any) => setFilterBy(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes</SelectItem>
              <SelectItem value="today">Aujourd'hui</SelectItem>
              <SelectItem value="week">Cette semaine</SelectItem>
              <SelectItem value="month">Ce mois</SelectItem>
            </SelectContent>
          </Select>

          <Select value={genderFilter} onValueChange={(value: any) => setGenderFilter(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous</SelectItem>
              <SelectItem value="female">Filles</SelectItem>
              <SelectItem value="male">Garçons</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Liste des inscriptions */}
      <ScrollArea className="h-full">
        <div className="space-y-4">
          <AnimatePresence>
            {Object.entries(groupedInscriptions).map(([groupName, groupInscriptions]) => (
              <motion.div
                key={groupName}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-2"
              >
                <div className="flex items-center gap-2 px-2">
                  <h4 className="font-medium text-sm text-muted-foreground">{groupName}</h4>
                  <Badge variant="outline" className="text-xs">
                    {groupInscriptions.length}
                  </Badge>
                  <Separator className="flex-1" />
                </div>

                <div className="space-y-2">
                  {groupInscriptions.map((inscription, index) => {
                    const genderInfo = getGenderInfo(inscription.student.sexe)
                    const priority = getRegistrationPriority(inscription)
                    const regDate = new Date(inscription.registration_date)

                    return (
                      <motion.div
                        key={inscription.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={cn(
                          "group relative p-3 rounded-lg border transition-all duration-200 hover:shadow-md hover:border-primary/30 cursor-pointer",
                          priority === "high" && "border-l-4 border-l-green-500 bg-green-50/30",
                          priority === "medium" && "border-l-4 border-l-blue-500 bg-blue-50/30",
                          "hover:scale-[1.02]",
                        )}
                        onClick={() => setSelectedInscription(inscription)}
                      >
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <Avatar className="h-12 w-12 border-2 border-background shadow-sm">
                              {inscription.student.photo && typeof inscription.student.photo === "string" ? (
                                <img
                                  src={`${process.env.NEXT_PUBLIC_API_BASE_URL_2}/${inscription.student.photo}`}
                                  alt={`${inscription.student.first_name} ${inscription.student.name}`}
                                  className="rounded-full object-cover w-12 h-12"
                                />
                              ) : (
                                <AvatarFallback className="bg-primary/10 text-primary font-medium text-sm">
                                  {inscription.student.first_name.charAt(0).toUpperCase()}
                                  {inscription.student.name.charAt(0).toUpperCase()}
                                </AvatarFallback>
                              )}
                            </Avatar>
                            {priority === "high" && (
                              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                                <Star className="h-2 w-2 text-white" />
                              </div>
                            )}
                          </div>

                          <div className="flex-1 min-w-0 space-y-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium text-sm truncate">
                                {inscription.student.first_name} {inscription.student.name}
                              </h4>
                              <Badge variant="outline" className={cn("text-xs border", genderInfo.color)}>
                                {genderInfo.icon} {genderInfo.label}
                              </Badge>
                              {isToday(regDate) && (
                                <Badge variant="soft" className="text-xs bg-green-500">
                                  Nouveau
                                </Badge>
                              )}
                            </div>

                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <School className="h-3 w-3" />
                                <span className="font-medium text-primary">{inscription.classe.label}</span>
                              </div>

                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                <span>{format(regDate, "dd/MM/yyyy", { locale: fr })}</span>
                              </div>

                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                <span>{getTimeAgo(regDate)}</span>
                              </div>
                            </div>

                            {/* Informations supplémentaires */}
                            <div className="flex items-center gap-4 text-xs">
                              {/* {inscription.student.phone && (
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger>
                                      <div className="flex items-center gap-1 text-muted-foreground hover:text-primary">
                                        <Phone className="h-3 w-3" />
                                        <span className="truncate max-w-20">{inscription.student.phone}</span>
                                      </div>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>{inscription.student.phone}</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              )} */}

                              {/* {inscription.student.address && (
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger>
                                      <div className="flex items-center gap-1 text-muted-foreground hover:text-primary">
                                        <MapPin className="h-3 w-3" />
                                        <span className="truncate max-w-24">{inscription.student.address}</span>
                                      </div>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>{inscription.student.address}</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              )} */}

                              {inscription.student.birth_date && (
                                <div className="flex items-center gap-1 text-muted-foreground">
                                  <User className="h-3 w-3" />
                                  <span>
                                    {new Date().getFullYear() - new Date(inscription.student.birth_date).getFullYear()}{" "}
                                    ans
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Actions rapides */}
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button onClick={()=> router.push(`/eleves/students/${inscription.student.registration_number}`)}  variant="ghost" size="sm" className="h-8 w-8 p-0">
                                    <Eye className="h-3 w-3" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Voir le profil</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>

                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                          </div>
                        </div>

                        {/* Indicateur de priorité */}
                        {priority === "high" && (
                          <div className="absolute top-2 right-2 w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        )}
                      </motion.div>
                    )
                  })}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {processedInscriptions.length === 0 && (searchTerm || filterBy !== "all" || genderFilter !== "all") && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-8 text-muted-foreground"
            >
              <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Aucune inscription trouvée</p>
              <p className="text-xs">Essayez de modifier vos filtres</p>
            </motion.div>
          )}
        </div>
      </ScrollArea>

      {/* Résumé en bas */}
      {processedInscriptions.length > 0 && (
        <div className="flex items-center justify-between text-xs text-muted-foreground bg-muted/30 p-3 rounded-lg">
          <span>
            Affichage de <strong>{processedInscriptions.length}</strong> inscription
            {processedInscriptions.length > 1 ? "s" : ""}
          </span>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-green-600" />
              {stats.thisWeek} cette semaine
            </span>
            <span className="flex items-center gap-1">
              <Users className="h-3 w-3 text-blue-600" />
              {stats.femaleCount}F / {stats.maleCount}M
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

export default RecentInscriptions
