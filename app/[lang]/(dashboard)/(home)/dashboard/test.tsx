"use client"

import { useSchoolStore } from "@/store"
import type { Professor } from "@/lib/interface"
import { useEffect, useState } from "react"
import DashbordView from "./admin_dashbord/page-view"
import ProfessorDashboard from "./professor-dashbord/professor-dashboard"
import CashierDashboard from "./cahier_dashbord/cashier-dashboard"
import Loading from "./loading"

interface DashboardViewProps {
  trans?: {
    [key: string]: string
  }
}

const Dashboard = ({ trans }: DashboardViewProps) => {
  const { professor, userOnline } = useSchoolStore()
  const [isProfessor, setIsProfessor] = useState(false)
  const [isCashier, setIsCashier] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (userOnline) {
      // Vérifie si l'utilisateur a un rôle "caisse", "caissier" ou similaire
      const userIsCashier = userOnline.roles?.some((role) =>
        ["caisse", "caissier", "cashier"].some(keyword =>
          role.name.toLowerCase().includes(keyword)
        )
      ) || false
      setIsCashier(userIsCashier)

      // Vérifie si l'utilisateur est un professeur
      const userIsProfessor = professor.some(
        (prof: Professor) => prof.user_id === userOnline.id
      )
      setIsProfessor(userIsProfessor)
    }

    setLoading(false)
  }, [userOnline, professor])

  if (loading) {
    return <Loading />
  }

  // Priorité : Caissier > Professeur > Admin
  if (isCashier) {
    return <CashierDashboard trans={trans} />
  }

  if (isProfessor) {
    return <ProfessorDashboard trans={trans} />
  }

  return <DashbordView trans={trans} />
}

export default Dashboard
