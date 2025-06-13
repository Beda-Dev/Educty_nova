import Link from "next/link"
import { ArrowUpDown, ChevronRight, Star, Search, Filter } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { getStudents } from "./data"

export default function Home() {
  const students = getStudents()

  // Fonction pour calculer la moyenne générale avec toutes les matières
  const calculateGeneralAverage = (grades: any) => {
    const values = Object.values(grades) as number[]
    return (values.reduce((sum, grade) => sum + grade, 0) / values.length).toFixed(2)
  }

  // Fonction pour déterminer la couleur de la cellule
  const getCellColor = (grade: number) => {
    if (grade >= 16) return "bg-green-100/80 dark:bg-green-900/50"
    if (grade >= 14) return "bg-emerald-100/80 dark:bg-emerald-900/50"
    if (grade >= 12) return "bg-teal-100/80 dark:bg-teal-900/50"
    if (grade >= 10) return "bg-amber-100/80 dark:bg-amber-900/50"
    return "bg-red-100/80 dark:bg-red-900/50"
  }

  // Fonction pour obtenir l'appréciation
  const getAppreciation = (average: number) => {
    if (average >= 16) return "Excellent"
    if (average >= 14) return "Très bien"
    if (average >= 12) return "Bien"
    if (average >= 10) return "Assez bien"
    if (average >= 8) return "Passable"
    return "Insuffisant"
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tableau des Moyennes</h1>
          <p className="text-muted-foreground mt-2">
            Vue d'ensemble des performances des élèves - Trimestre 2 - 2023/2024
          </p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <div className="relative max-w-[300px]">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher un élève..."
              className="pl-10"
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                <span>Filtrer</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Par classe</DropdownMenuItem>
              <DropdownMenuItem>Par niveau</DropdownMenuItem>
              <DropdownMenuItem>Par matière</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <Card className="overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-muted/5 border-b">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle>Moyennes des Élèves</CardTitle>
              <CardDescription>
                {students.length} élèves - Moyenne générale de la classe : 12.8/20
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                Exporter (CSV)
              </Button>
              <Button variant="outline" size="sm">
                Imprimer
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table className="min-w-[1000px] lg:min-w-full">
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="w-[220px]">
                    <Button variant="ghost" className="flex items-center gap-1 px-0 hover:bg-transparent">
                      <span>Élève</span>
                      <ArrowUpDown className="h-4 w-4 opacity-50" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button variant="ghost" className="flex items-center gap-1 px-0 hover:bg-transparent">
                      <span>Maths</span>
                      <ArrowUpDown className="h-4 w-4 opacity-50" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button variant="ghost" className="flex items-center gap-1 px-0 hover:bg-transparent">
                      <span>Français</span>
                      <ArrowUpDown className="h-4 w-4 opacity-50" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button variant="ghost" className="flex items-center gap-1 px-0 hover:bg-transparent">
                      <span>Histoire</span>
                      <ArrowUpDown className="h-4 w-4 opacity-50" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button variant="ghost" className="flex items-center gap-1 px-0 hover:bg-transparent">
                      <span>Sciences</span>
                      <ArrowUpDown className="h-4 w-4 opacity-50" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button variant="ghost" className="flex items-center gap-1 px-0 hover:bg-transparent">
                      <span>Anglais</span>
                      <ArrowUpDown className="h-4 w-4 opacity-50" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button variant="ghost" className="flex items-center gap-1 px-0 hover:bg-transparent">
                      <span>EPS</span>
                      <ArrowUpDown className="h-4 w-4 opacity-50" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button variant="ghost" className="flex items-center gap-1 px-0 hover:bg-transparent">
                      <span>Arts</span>
                      <ArrowUpDown className="h-4 w-4 opacity-50" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button variant="ghost" className="flex items-center gap-1 px-0 hover:bg-transparent">
                      <span>Géo</span>
                      <ArrowUpDown className="h-4 w-4 opacity-50" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button variant="ghost" className="flex items-center gap-1 px-0 hover:bg-transparent">
                      <span>Moyenne</span>
                      <ArrowUpDown className="h-4 w-4 opacity-50" />
                    </Button>
                  </TableHead>
                  <TableHead className="text-right w-[120px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map((student) => {
                  const generalAverage = calculateGeneralAverage(student.grades)
                  const numericAverage = Number.parseFloat(generalAverage)

                  return (
                    <TableRow key={student.id} className="hover:bg-muted/50">
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8 border">
                            <AvatarImage src={`/avatars/${student.id}.jpg`} />
                            <AvatarFallback>{student.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <span>{student.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className={getCellColor(student.grades.math)}>
                        {student.grades.math}
                      </TableCell>
                      <TableCell className={getCellColor(student.grades.french)}>
                        {student.grades.french}
                      </TableCell>
                      <TableCell className={getCellColor(student.grades.history)}>
                        {student.grades.history}
                      </TableCell>
                      <TableCell className={getCellColor(student.grades.science)}>
                        {student.grades.science}
                      </TableCell>
                      <TableCell className={getCellColor(student.grades.english)}>
                        {student.grades.english}
                      </TableCell>
                      <TableCell className={getCellColor(student.grades.physicalEducation)}>
                        {student.grades.physicalEducation}
                      </TableCell>
                      <TableCell className={getCellColor(student.grades.arts)}>
                        {student.grades.arts}
                      </TableCell>
                      <TableCell className={getCellColor(student.grades.geography)}>
                        {student.grades.geography}
                      </TableCell>
                      <TableCell className="font-semibold">
                        <div className="flex items-center gap-2">
                          <span>{generalAverage}</span>
                          {numericAverage >= 14 && (
                            <Star className="h-4 w-4 text-amber-500" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Link href={`/vie_scolaire/moyennes/${student.id}`}>
                          <Button variant="outline" size="sm" className="flex items-center gap-1">
                            Détails
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-green-100/80" />
            <span>≥ 16</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-emerald-100/80" />
            <span>≥ 14</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-teal-100/80" />
            <span>≥ 12</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-amber-100/80" />
            <span>≥ 10</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-red-100/80" />
            <span>&lt; 10</span>
          </div>
        </div>
        <div>
          <Badge variant="outline" className="bg-primary/10 text-skyblue">
            {students.length} élèves
          </Badge>
        </div>
      </div>
    </div>
  )
}