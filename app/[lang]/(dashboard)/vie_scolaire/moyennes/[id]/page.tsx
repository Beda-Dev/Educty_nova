import Link from "next/link"
import { ArrowLeft, Download, Printer, Star, Trophy, AlertCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getStudentById } from "../data"

export default function StudentPage({ params }: { params: { id: string } }) {
  const student = getStudentById(params.id)

  if (!student) {
    return (
      <div className="container mx-auto py-10 text-center">
        <h1 className="text-3xl font-bold mb-6">Élève non trouvé</h1>
        <p className="mb-6">L'élève avec l'identifiant {params.id} n'existe pas.</p>
        <Link href="/vie_scolaire/moyennes">
          <Button>Retour à la liste des élèves</Button>
        </Link>
      </div>
    )
  }

  // Calculer la moyenne générale avec toutes les matières
  const grades = Object.values(student.grades)
  const generalAverage = (grades.reduce((sum, grade) => sum + grade, 0) / grades.length).toFixed(2)
  const numericAverage = Number.parseFloat(generalAverage)

  // Fonction pour obtenir l'appréciation
  const getAppreciation = (average: number) => {
    if (average >= 16) return "Excellent"
    if (average >= 14) return "Très bien"
    if (average >= 12) return "Bien"
    if (average >= 10) return "Assez bien"
    if (average >= 8) return "Passable"
    return "Insuffisant"
  }

  // Couleur en fonction de la note
  const getGradeColor = (grade: number) => {
    if (grade >= 16) return "text-emerald-600 dark:text-emerald-400"
    if (grade >= 12) return "text-green-600 dark:text-green-400"
    if (grade >= 10) return "text-amber-600 dark:text-amber-400"
    return "text-red-600 dark:text-red-400"
  }

  // Commentaires personnalisés par matière
  const comments = {
    math: {
      text: student.grades.math >= 12
        ? "Bonne maîtrise des concepts mathématiques."
        : "Des efforts à fournir en mathématiques.",
      icon: student.grades.math >= 12 ? <Star className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />
    },
    french: {
      text: student.grades.french >= 12 ? "Bonne expression écrite et orale." : "Doit améliorer son expression écrite.",
      icon: student.grades.french >= 12 ? <Star className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />
    },
    history: {
      text: student.grades.history >= 12
        ? "Bonne connaissance des événements historiques."
        : "Manque de précision dans les connaissances historiques.",
      icon: student.grades.history >= 12 ? <Star className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />
    },
    science: {
      text: student.grades.science >= 12
        ? "Bonne compréhension des concepts scientifiques."
        : "Doit approfondir sa compréhension des concepts scientifiques.",
      icon: student.grades.science >= 12 ? <Star className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />
    },
    english: {
      text: student.grades.english >= 12
        ? "Bon niveau de compréhension et d'expression."
        : "Doit pratiquer davantage la langue.",
      icon: student.grades.english >= 12 ? <Star className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />
    },
    physicalEducation: {
      text: student.grades.physicalEducation >= 12
        ? "Bon engagement physique et sportif."
        : "Doit participer plus activement.",
      icon: student.grades.physicalEducation >= 12 ? <Star className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />
    },
    arts: {
      text: student.grades.arts >= 12
        ? "Créativité et sens artistique développés."
        : "Doit explorer davantage sa créativité.",
      icon: student.grades.arts >= 12 ? <Star className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />
    },
    geography: {
      text: student.grades.geography >= 12
        ? "Bonne compréhension des concepts géographiques."
        : "Doit renforcer ses connaissances géographiques.",
      icon: student.grades.geography >= 12 ? <Star className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />
    }
  }

  // Données pour le graphique de progression
  const subjects = [
    { name: "Maths", value: student.grades.math },
    { name: "Français", value: student.grades.french },
    { name: "Histoire", value: student.grades.history },
    { name: "Sciences", value: student.grades.science },
    { name: "Anglais", value: student.grades.english },
    { name: "EPS", value: student.grades.physicalEducation },
    { name: "Arts", value: student.grades.arts },
    { name: "Géo", value: student.grades.geography }
  ]

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/vie_scolaire/moyennes">
          <Button variant="outline" size="sm" className="flex items-center gap-1">
            <ArrowLeft className="h-4 w-4" /> Retour
          </Button>
        </Link>
        <h1 className="text-3xl font-bold tracking-tight">Bulletin de {student.name}</h1>
      </div>

      <div className="grid gap-6">
        <Card className="overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-primary/5 to-muted/5 border-b">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Avatar className="h-12 w-12 border-2 border-primary">
                    <AvatarImage src={`/avatars/${student.id}.jpg`} />
                    <AvatarFallback>{student.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div>Bulletin Scolaire - Trimestre 2</div>
                    <CardDescription className="mt-1">Année scolaire 2023-2024</CardDescription>
                  </div>
                </CardTitle>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex items-center gap-1">
                  <Printer className="h-4 w-4" /> Imprimer
                </Button>
                <Button variant="outline" size="sm" className="flex items-center gap-1">
                  <Download className="h-4 w-4" /> PDF
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid gap-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-muted-foreground">Élève</h3>
                  <p className="font-medium">{student.name}</p>
                  <p className="text-sm text-muted-foreground">Classe: 3ème A</p>
                </div>
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-muted-foreground">Établissement</h3>
                  <p className="font-medium">Collège Numérique</p>
                  <p className="text-sm text-muted-foreground">123 Rue de l'Éducation, 75001 Paris</p>
                </div>
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-muted-foreground">Informations</h3>
                  <p className="text-sm text-muted-foreground">ID: {student.id}</p>
                  <p className="text-sm text-muted-foreground">Date de génération: {new Date().toLocaleDateString()}</p>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <h3 className="text-lg font-semibold mb-4">Notes par matière</h3>
                  <div className="border rounded-lg">
                    <Table>
                      <TableHeader className="bg-muted/50">
                        <TableRow>
                          <TableHead className="w-[200px]">Matière</TableHead>
                          <TableHead className="text-center">Note</TableHead>
                          <TableHead className="text-center">Moy. classe</TableHead>
                          <TableHead>Appréciation</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {Object.entries(student.grades).map(([subject, grade]) => (
                          <TableRow key={subject}>
                            <TableCell className="font-medium capitalize">
                              {subject === 'physicalEducation' ? 'EPS' : subject}
                            </TableCell>
                            <TableCell className={`text-center font-semibold ${getGradeColor(grade)}`}>
                              {grade}/20
                            </TableCell>
                            <TableCell className="text-center text-muted-foreground">
                              {(Math.random() * 4 + 10).toFixed(1)}/20
                            </TableCell>
                            <TableCell className="flex items-center gap-2">
                              {comments[subject as keyof typeof comments].icon}
                              {comments[subject as keyof typeof comments].text}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="rounded-lg border p-4">
                    <h3 className="font-semibold mb-4">Résumé du trimestre</h3>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-medium">Moyenne générale</span>
                          <span className="font-bold text-lg">{generalAverage}/20</span>
                        </div>
                        <Progress value={(numericAverage / 20) * 100} className="h-2" />
                      </div>
                      <div className="flex items-center gap-2">
                        <Trophy className="h-5 w-5 text-amber-500" />
                        <div>
                          <p className="font-medium">{getAppreciation(numericAverage)}</p>
                          <p className="text-sm text-muted-foreground">
                            {numericAverage >= 12
                              ? `Classement: ${Math.floor(Math.random() * 5) + 1}ère/${Math.floor(Math.random() * 10) + 20}`
                              : "Classement: Non communiqué"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-lg border p-4">
                    <h3 className="font-semibold mb-2">Commentaire du professeur principal</h3>
                    <p className="text-sm">
                      {numericAverage >= 14 ? (
                        <span>
                          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 mr-2">
                            Excellent
                          </Badge>
                          {student.name} a fourni un travail exemplaire ce trimestre. Ses résultats sont excellents et son attitude en classe est irréprochable. Continuez ainsi !
                        </span>
                      ) : numericAverage >= 12 ? (
                        <span>
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 mr-2">
                            Satisfaisant
                          </Badge>
                          {student.name} a fait preuve de sérieux et de régularité dans son travail. Nous encourageons à poursuivre dans cette voie pour progresser encore.
                        </span>
                      ) : numericAverage >= 10 ? (
                        <span>
                          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 mr-2">
                            Encouragements
                          </Badge>
                          {student.name} a montré des efforts ce trimestre. Il/elle doit cependant les intensifier pour atteindre son plein potentiel.
                        </span>
                      ) : (
                        <span>
                          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 mr-2">
                            Avertissement
                          </Badge>
                          {student.name} doit fournir plus d'efforts et être plus régulier dans son travail. Des progrès significatifs sont nécessaires pour le prochain trimestre.
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-semibold mb-4">Progression par matière</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {subjects.map((subject) => (
                    <div key={subject.name} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-sm font-medium">{subject.name}</span>
                        <span className={`text-sm font-semibold ${getGradeColor(subject.value)}`}>
                          {subject.value}/20
                        </span>
                      </div>
                      <Progress value={(subject.value / 20) * 100} className="h-2" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="bg-muted/50 border-t py-3 px-6 flex justify-between">
            <div className="text-sm text-muted-foreground">Signature du professeur principal: _________________</div>
            <div className="text-sm text-muted-foreground">Page 1/1</div>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}