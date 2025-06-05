import { User, BookOpen, Hash, Mail, Phone, Calendar, MapPin } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import type { Student } from "../student"

interface StudentInfoProps {
  student: Student
}

export default function StudentInfo({ student }: StudentInfoProps) {
  // Formatage de la date de naissance
  const formatBirthDate = (date?: Date) => {
    if (!date) {
      return "Date non renseignée"
    }
    return new Intl.DateTimeFormat("fr-FR", {
      day: "2-digit",
      month: "long",
      year: "numeric"
    }).format(date)
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-primary/5 to-muted/5 border-b p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <Avatar className="h-16 w-16 border-2 border-primary">
            <AvatarImage src={`/avatars/${student.matricule}.jpg`} />
            <AvatarFallback>
              {student.prenom.charAt(0)}{student.nom.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-2xl flex items-center gap-3">
              {student.prenom} {student.nom}
              <Badge color="skyblue" className="text-sm font-normal">
                {student.classe}
              </Badge>
            </CardTitle>
            <p className="text-muted-foreground mt-1 flex items-center gap-1">
              <Hash className="h-4 w-4" />
              <span>Matricule: {student.matricule}</span>
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="font-medium flex items-center gap-2 text-primary">
              <User className="h-5 w-5" />
              <span>Informations personnelles</span>
            </h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>Date de naissance</span>
                </p>
                <p className="font-medium mt-1 ml-6">
                  {formatBirthDate(student.dateNaissance)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  <span>Email</span>
                </p>
                <p className="font-medium mt-1 ml-6">
                  {student.email || "Non renseigné"}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  <span>Téléphone</span>
                </p>
                <p className="font-medium mt-1 ml-6">
                  {student.telephone || "Non renseigné"}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-medium flex items-center gap-2 text-primary">
              <MapPin className="h-5 w-5" />
              <span>Informations scolaires</span>
            </h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  <span>Classe</span>
                </p>
                <p className="font-medium mt-1 ml-6">
                  {student.classe}
                  <span className="text-muted-foreground ml-2">
                    ({student.niveau}ème année)
                  </span>
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <Hash className="h-4 w-4" />
                  <span>Matricule</span>
                </p>
                <p className="font-medium mt-1 ml-6">{student.matricule}</p>
              </div>

            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}