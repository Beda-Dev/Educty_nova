"use client"

import { useRouter } from "next/navigation"
import { useSchoolStore } from "@/store"
import type { Professor } from "@/lib/interface"
import { useEffect, useState } from "react"
import DashbordView from "./admin_dashbord/page-view"
import ProfessorDashboard from "./professor-dashbord/professor-dashboard"
import CashierDashboard from "./cahier_dashbord/cashier-dashboard"
import AccountingDashboard from "./acounting_dashbord/accounting-dashboard"
import Loading from "./loading"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RocketIcon, UserIcon, CalculatorIcon, WalletIcon, ShieldIcon , EyeIcon, HeartIcon } from "lucide-react"
import { motion } from "framer-motion"
import CenseurDashboard from "./censeur_dashbord/censeur-dashbord"
import EducateurDashboard from "./educateur_dashbord/educteur-dashbord"

interface DashboardViewProps {
  trans?: {
    [key: string]: string
  }
}

// Type pour les options de dashboard
type DashboardOption = {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  component: React.ReactNode
  roles: string[]
}

const Dashboard = ({ trans }: DashboardViewProps) => {
  const { professor, userOnline } = useSchoolStore()
  const [userRoles, setUserRoles] = useState<string[]>([])
  const [availableDashboards, setAvailableDashboards] = useState<DashboardOption[]>([])
  const [selectedDashboard, setSelectedDashboard] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // Définition des différents dashboards disponibles
  const dashboardOptions: DashboardOption[] = [
    {
      id: 'admin',
      name: 'Administration',
      description: 'Tableau de bord complet avec toutes les fonctionnalités administratives',
      icon: <ShieldIcon className="w-8 h-8" />,
      component: <DashbordView trans={trans} />,
      roles: ['admin', 'administrateur', 'directeur', 'super admin']
    },
    {
      id: 'accounting',
      name: 'Comptabilité',
      description: 'Interface dédiée à la gestion financière et comptable',
      icon: <CalculatorIcon className="w-8 h-8" />,
      component: <AccountingDashboard trans={trans} />,
      roles: ['comptable', 'comptabilité', 'accounting', 'finance']
    },
    {
      id: 'cashier',
      name: 'Caisse',
      description: 'Interface pour la gestion des paiements et des transactions',
      icon: <WalletIcon className="w-8 h-8" />,
      component: <CashierDashboard trans={trans} />,
      roles: ['caisse', 'caissier', 'cashier']
    },
    {
      id: 'professor',
      name: 'Enseignant',
      description: 'Tableau de bord pour les professeurs et formateurs',
      icon: <UserIcon className="w-8 h-8" />,
      component: <ProfessorDashboard trans={trans} />,
      roles: ['professeur', 'enseignant', 'teacher', 'professor']
    },
    {
      id: 'censeur',
      name: 'Censeur',
      description: 'Interface de supervision pédagogique et disciplinaire',
      icon: <EyeIcon className="w-8 h-8" />,
      component: <CenseurDashboard trans={trans} />,
      roles: ['censeur', 'censure', 'supervisor']
    },
    {
      id: 'educateur',
      name: 'Éducateur',
      description: 'Suivi du bien-être et accompagnement des élèves',
      icon: <HeartIcon className="w-8 h-8" />,
      component: <EducateurDashboard trans={trans} />,
      roles: ['educateur', 'éducateur', 'educator', 'conseiller']
    }
  ]

  useEffect(() => {
    if (userOnline) {
      // Extraire les noms des rôles de l'utilisateur en minuscules
      const roles = userOnline.roles?.map(role => role.name.toLowerCase()) || []
      // console.log('Rôles de l\'utilisateur:', roles);
      setUserRoles(roles)

      // Rediriger automatiquement si l'utilisateur a le rôle 'caisse' (insensible à la casse)
      const hasCashierRole = roles.some(role => 
        ['caisse', 'caissier', 'cashier'].includes(role.toLowerCase())
      );
      
      if (hasCashierRole) {
        router.push('/eleves')
        return
      }

      // Vérifier si l'utilisateur est un professeur
      const isProfessor = professor.some(
        (prof: Professor) => prof.user_id === userOnline.id
      )
      console.log('Est un professeur?', isProfessor);
      
      if (isProfessor) {
        const newRoles = [...roles, 'professor', 'professeur', 'enseignant', 'teacher'];
        // console.log('Nouveaux rôles avec professeur:', newRoles);
        setUserRoles(newRoles);
      }

      // Afficher les options de dashboard disponibles
      // console.log('Toutes les options de dashboard:', dashboardOptions);

      // Trouver les dashboards disponibles pour cet utilisateur
      const available = dashboardOptions.filter(option =>
        option.roles.some(role => 
          roles.includes(role) || 
          (isProfessor && option.id === 'professor')
        )
      )

      // console.log('Dashboards disponibles:', available.map(d => d.id));
      setAvailableDashboards(available)

      // Si un seul dashboard disponible, le sélectionner automatiquement
      if (available.length === 1) {
        // console.log('Un seul dashboard disponible, sélection automatique:', available[0].id);
        setSelectedDashboard(available[0].id)
      }
    }

    setLoading(false)
  }, [userOnline, professor])

  if (loading) {
    return <Loading />
  }

  // Si aucun rôle ou dashboard disponible
  if (availableDashboards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <Card className="p-6 max-w-md text-center">
          <h2 className="text-2xl font-bold mb-4">Accès non autorisé</h2>
          <p className="text-muted-foreground">
            Vous n'avez pas les permissions nécessaires pour accéder à un tableau de bord.
          </p>
        </Card>
      </div>
    )
  }

  // Si plusieurs dashboards disponibles, afficher le choix
  if (availableDashboards.length > 1 && !selectedDashboard) {
    return (
      <Card className="container py-8">
        <CardHeader>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <h1 className="text-xl font-bold mb-2">Sélectionnez votre tableau de bord</h1>
          <p className="text-muted-foreground">
            Vous avez accès à plusieurs interfaces en fonction de vos rôles: {userRoles.join(', ')}
          </p>
        </motion.div>
        </CardHeader>
        <CardContent>

        

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {availableDashboards.map((dashboard) => (
            <motion.div
              key={dashboard.id}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
            >
              <Card className="p-6 h-full flex flex-col">
                <div className="flex items-center mb-4">
                  <div className="p-3 rounded-lg bg-primary/10 text-primary mr-4">
                    {dashboard.icon}
                  </div>
                  <h3 className="text-lg font-semibold">{dashboard.name}</h3>
                </div>
                <p className="text-muted-foreground mb-6 flex-grow">{dashboard.description}</p>
                <Button
                
                  onClick={() => setSelectedDashboard(dashboard.id)}
                  className="w-full"
                >
                  Sélectionner
                </Button>
              </Card>
            </motion.div>
          ))}
        </div>
        </CardContent>
      </Card>
    )
  }

  // Afficher le dashboard sélectionné ou le seul disponible
  const dashboardToDisplay = selectedDashboard 
    ? dashboardOptions.find(d => d.id === selectedDashboard)?.component
    : availableDashboards[0]?.component

  // Priorité au dashboard admin si disponible (même si d'autres sont disponibles)
  const adminDashboard = dashboardOptions.find(d => d.id === 'Administrateur')
  if (adminDashboard && userRoles.some(r => adminDashboard.roles.includes(r))) {
    return adminDashboard.component
  }

  return dashboardToDisplay || <DashbordView trans={trans} />
}

export default Dashboard