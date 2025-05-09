"use client"

import { useState } from "react"
import { Mail, Clock, AlertCircle, CheckCircle, Calendar, User, Search, Filter } from "lucide-react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu"
import type { CorrespondenceEntry } from "../student"

interface CorrespondenceListProps {
  entries: CorrespondenceEntry[]
}

export default function CorrespondenceList({ entries }: CorrespondenceListProps) {
  const [filter, setFilter] = useState<string>("tous")
  const [searchQuery, setSearchQuery] = useState<string>("")

  const filteredEntries = entries.filter((entry) => {
    const matchesFilter = filter === "tous" || entry.type === filter
    const matchesSearch = entry.titre.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         entry.contenu.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesFilter && matchesSearch
  })

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("fr-FR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    }).format(date)
  }

  const getBadgeConfig = (type: string) => {
    switch (type) {
      case "absence":
        return {
          color: "bg-amber-100 text-amber-800 hover:bg-amber-100",
          icon: <AlertCircle className="h-4 w-4 mr-1" />
        }
      case "retard":
        return {
          color: "bg-orange-100 text-orange-800 hover:bg-orange-100",
          icon: <Clock className="h-4 w-4 mr-1" />
        }
      case "note":
        return {
          color: "bg-emerald-100 text-emerald-800 hover:bg-emerald-100",
          icon: <CheckCircle className="h-4 w-4 mr-1" />
        }
      default:
        return {
          color: "bg-slate-100 text-slate-800 hover:bg-slate-100",
          icon: <Mail className="h-4 w-4 mr-1" />
        }
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="relative w-full sm:w-[300px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher une correspondance..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex gap-2 w-full sm:w-auto">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                <span>Filtres</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={() => setFilter("tous")}>
                Tous les types
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setFilter("absence")}>
                Absences
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setFilter("retard")}>
                Retards
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setFilter("note")}>
                Notes
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filtrer par type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="tous">Tous les types</SelectItem>
              <SelectItem value="absence">Absences</SelectItem>
              <SelectItem value="retard">Retards</SelectItem>
              <SelectItem value="note">Notes</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {filteredEntries.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 gap-4 text-center">
          <Mail className="h-12 w-12 text-muted-foreground" />
          <h3 className="text-lg font-medium">Aucune correspondance trouvée</h3>
          <p className="text-sm text-muted-foreground">
            {searchQuery ? "Essayez avec d'autres termes de recherche" : "Aucune entrée pour ce filtre"}
          </p>
          <Button variant="outline" onClick={() => {
            setFilter("tous")
            setSearchQuery("")
          }}>
            Réinitialiser les filtres
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">
              {filteredEntries.length} correspondance{filteredEntries.length > 1 ? "s" : ""}
            </h3>
            <Badge variant="outline" className="text-muted-foreground">
              {filter === "tous" ? "Tous types" : filter.charAt(0).toUpperCase() + filter.slice(1)}
            </Badge>
          </div>

          {filteredEntries.map((entry) => {
            const badgeConfig = getBadgeConfig(entry.type)
            
            return (
              <Card key={entry.id} className="overflow-hidden hover:shadow-md transition-shadow">
                <CardHeader className="bg-gradient-to-r from-primary/5 to-muted/5 py-4 border-b">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <CardTitle className="text-lg flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={`/avatars/${entry.auteur}.jpg`} />
                        <AvatarFallback>{entry.auteur.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span>{entry.titre}</span>
                    </CardTitle>
                    <Badge className={`${badgeConfig.color} flex items-center`}>
                      {badgeConfig.icon}
                      {entry.type.charAt(0).toUpperCase() + entry.type.slice(1)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-4 pb-2">
                  <p className="whitespace-pre-line">{entry.contenu}</p>
                </CardContent>
                <CardFooter className="bg-muted/50 py-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(entry.date)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      <span>Par {entry.auteur}</span>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="text-primary">
                    Voir les détails
                  </Button>
                </CardFooter>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}