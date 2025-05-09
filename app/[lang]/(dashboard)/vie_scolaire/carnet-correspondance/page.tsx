import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import StudentInfo from "./componant/student-info"
import CorrespondenceList from "./componant/correspondence-list"
import type { Student, CorrespondenceEntry } from "./student"
import { FormProvider, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"



export default function CarnetCorrespondancePage() {
  // Exemple de données d'un élève
  const student: Student = {
    nom: "Kouassi",
    prenom: "Marie-ange",
    classe: "Terminale D2",
    matricule: "15267844F",
    dateNaissance: new Date("2005-04-15"),
    telephone: "0123456789",
  }

  // Exemple de données de correspondance
  const correspondenceEntries: CorrespondenceEntry[] = [
    {
      id: "1",
      date: new Date("2023-09-15"),
      titre: "Absence justifiée",
      contenu: "Absence pour rendez-vous médical.",
      auteur: "Dr. Martin",
      type: "absence",
    },
    {
      id: "2",
      date: new Date("2023-10-05"),
      titre: "Félicitations",
      contenu: "Excellent travail sur le projet de sciences.",
      auteur: "Mme. Bernard",
      type: "note",
    },
    {
      id: "3",
      date: new Date("2023-11-10"),
      titre: "Retard",
      contenu: "Arrivée en retard de 15 minutes.",
      auteur: "M. Dubois",
      type: "retard",
    },
  ]



  return (
    <main className="container mx-auto py-6 px-4">
      <h1 className="text-3xl font-bold mb-6">Carnet de Correspondance</h1>

      <StudentInfo student={student} />

      <Tabs defaultValue="liste" className="mt-8">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="liste">Liste des entrées</TabsTrigger>
        </TabsList>
        
        <TabsContent value="liste">
          <CorrespondenceList entries={correspondenceEntries} />
        </TabsContent>
      </Tabs>
    </main>
  )
}