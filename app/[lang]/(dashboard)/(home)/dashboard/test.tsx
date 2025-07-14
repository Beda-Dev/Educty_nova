"use client"
import { useSchoolStore } from "@/store"
import type { Professor } from "@/lib/interface"
import { useEffect, useState } from "react"
import DashbordView from "./admin_dashbord/page-view"
import ProfessorDashboard from "./professor-dashbord/professor-dashboard"
import Loading from "./loading"

interface DashboardViewProps {
  trans?: {
    [key: string]: string
  }
}

const Dashboard = ({ trans }: DashboardViewProps) => {
  const { professor, userOnline } = useSchoolStore()
  const [isProfessor, setIsProfessor] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    if (userOnline && professor.length > 0) {
      // Vérifie si l'utilisateur connecté est un professeur
      const isUserProfessor = professor.some(
        (prof: Professor) => prof.user_id === userOnline.id
      )
      setIsProfessor(isUserProfessor)
    }
    setLoading(false)
  }, [userOnline, professor])

  if (loading) {
    return <Loading/>
}

  return isProfessor ? (
    <ProfessorDashboard trans={trans} />
  ) : (
    <DashbordView trans={trans} />
  )
}

export default Dashboard