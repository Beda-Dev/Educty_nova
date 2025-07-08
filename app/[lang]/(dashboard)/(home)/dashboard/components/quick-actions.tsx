"use client"

import { Button } from "@/components/ui/button"
import { UserPlus, FileText, CreditCard, Settings, BookOpen, Users } from "lucide-react"
import Link from "next/link"

const QuickActions = () => {
  const actions = [
    {
      label: "Nouvelle inscription",
      icon: UserPlus,
      href: "/eleves/registration/new_registration",
      color: "bg-blue-500 hover:bg-blue-600",
    },
    {
      label: "Enregistrer paiement",
      icon: CreditCard,
      href: "/caisse_comptabilite/encaissement/paiement",
      color: "bg-green-500 hover:bg-green-600",
    },
    {
      label: "Gérer classes",
      icon: BookOpen,
      href: "/parametres/pedagogy/classe",
      color: "bg-purple-500 hover:bg-purple-600",
    },
    {
      label: "Voir élèves",
      icon: Users,
      href: "/eleves/students",
      color: "bg-orange-500 hover:bg-orange-600",
    },
    // {
    //   label: "Rapports",
    //   icon: FileText,
    //   href: "/rapports",
    //   color: "bg-indigo-500 hover:bg-indigo-600",
    // },
    {
      label: "Paramètres",
      icon: Settings,
      href: "/parametres",
      color: "bg-gray-500 hover:bg-gray-600",
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-3">
      {actions.map((action, index) => (
        <Link key={index} href={action.href}>
          <Button
            variant="outline"
            className={`w-full h-auto p-3 flex flex-col items-center gap-2 hover:scale-105 transition-all duration-200 ${action.color} text-white border-0`}
          >
            <action.icon className="h-5 w-5" />
            <span className="text-xs text-center leading-tight">{action.label}</span>
          </Button>
        </Link>
      ))}
    </div>
  )
}

export default QuickActions
