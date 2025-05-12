import { CalendarIcon } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

interface RecentEmpruntsProps {
  extended?: boolean
}

export function RecentEmprunts({ extended = false }: RecentEmpruntsProps) {
  const empruntsToShow = extended ? recentEmprunts : recentEmprunts.slice(0, 5)

  return (
    <div className="space-y-4">
      {empruntsToShow.map((emprunt) => (
        <div key={emprunt.id} className="flex items-center justify-between space-x-4">
          <div className="flex items-center space-x-4">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-primary/10">{emprunt.emprunteur.substring(0, 2)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium leading-none">{emprunt.livre}</p>
              <p className="text-sm text-muted-foreground">{emprunt.emprunteur}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="flex items-center text-sm text-muted-foreground">
              <CalendarIcon className="mr-1 h-3 w-3" />
              {emprunt.dateRetour}
            </div>
            <Badge
              variant={
                emprunt.statut === "En cours" ? "default" : emprunt.statut === "En retard" ? "destructive" : "outline"
              }
            >
              {emprunt.statut}
            </Badge>
          </div>
        </div>
      ))}
    </div>
  )
}

const recentEmprunts = [
  {
    id: 1,
    livre: "Les Soleils des Indépendances",
    emprunteur: "Kouassi Aya",
    dateEmprunt: "15/04/2023",
    dateRetour: "30/04/2023",
    statut: "En retard",
  },
  {
    id: 2,
    livre: "Mathématiques 3ème",
    emprunteur: "Konan Kouadio",
    dateEmprunt: "02/05/2023",
    dateRetour: "16/05/2023",
    statut: "En cours",
  },
  {
    id: 3,
    livre: "Physique-Chimie 2nde",
    emprunteur: "Prof. Koffi Adjoua",
    dateEmprunt: "28/04/2023",
    dateRetour: "28/05/2023",
    statut: "En cours",
  },
  {
    id: 4,
    livre: "Le Pagne noir",
    emprunteur: "Bamba Ibrahim",
    dateEmprunt: "10/04/2023",
    dateRetour: "24/04/2023",
    statut: "En retard",
  },
  {
    id: 5,
    livre: "Histoire de la Côte d'Ivoire",
    emprunteur: "Prof. Yao Amlan",
    dateEmprunt: "05/05/2023",
    dateRetour: "05/06/2023",
    statut: "En cours",
  },
  {
    id: 6,
    livre: "L'Enfant noir",
    emprunteur: "Touré Mariam",
    dateEmprunt: "03/05/2023",
    dateRetour: "17/05/2023",
    statut: "En cours",
  },
  {
    id: 7,
    livre: "Géographie de la Côte d'Ivoire",
    emprunteur: "Diallo Fatou",
    dateEmprunt: "01/05/2023",
    dateRetour: "15/05/2023",
    statut: "En cours",
  },
  {
    id: 8,
    livre: "Contes et Légendes d'Afrique",
    emprunteur: "Koffi Kouamé",
    dateEmprunt: "04/05/2023",
    dateRetour: "18/05/2023",
    statut: "En cours",
  },
  {
    id: 9,
    livre: "Biologie Terminale",
    emprunteur: "Prof. Coulibaly Siaka",
    dateEmprunt: "25/04/2023",
    dateRetour: "25/05/2023",
    statut: "En retard",
  },
  {
    id: 10,
    livre: "Dictionnaire Français-Anglais",
    emprunteur: "Yao Affoué",
    dateEmprunt: "06/05/2023",
    dateRetour: "20/05/2023",
    statut: "En cours",
  },
]
