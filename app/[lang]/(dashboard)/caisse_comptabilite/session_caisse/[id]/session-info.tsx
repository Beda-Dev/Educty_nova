"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calculator, Calendar, Clock, Wallet, Banknote, ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import type { CashRegisterSession } from "@/lib/interface"

interface SessionInfoProps {
  currentSession: CashRegisterSession
  formatDateTime: (dateString: string) => string
  formatAmount: (amount: number | string) => string
}

export default function SessionInfo({ currentSession, formatDateTime, formatAmount }: SessionInfoProps) {
  const router = useRouter()

  return (
    <>
      {/* En-tête avec navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => router.push("/caisse_comptabilite/session_caisse")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
          <div>
            <h1 className="text-xl font-bold flex items-center gap-4">
              Session de Caisse #{currentSession.id}
              {currentSession.status === "open" && (
                <Button
                  color="destructive"
                  size="sm"
                  className="ml-2"
                  onClick={() => router.push(`/caisse_comptabilite/close-session/${currentSession.id}`)}
                >
                  Fermer la session
                </Button>
              )}
            </h1>
            <p className="text-muted-foreground">
              {currentSession.cash_register?.cash_register_number} - {currentSession.user?.name}
            </p>
          </div>
        </div>
        <Badge color={currentSession.status === "open" ? "skyblue" : "destructive"} className="text-sm">
          {currentSession.status === "open" ? (
            <span>
              Ouverte <span className="ml-1 text-xs text-orange-500 font-semibold">(En cours)</span>
            </span>
          ) : (
            "Fermée"
          )}
        </Badge>
      </div>

      {/* Informations de la session */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Informations de la session
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                Date d'ouverture
              </div>
              <p className="font-semibold">{formatDateTime(currentSession.opening_date)}</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                Date de fermeture
              </div>
              <p className="font-semibold">
                {currentSession.status === "closed" && currentSession.closing_date
                  ? formatDateTime(currentSession.closing_date)
                  : "-"}
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Wallet className="h-4 w-4" />
                Solde d'ouverture
              </div>
              <p className="font-semibold">{formatAmount(currentSession.opening_amount)}</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Banknote className="h-4 w-4" />
                Solde de fermeture
              </div>
              <p className="font-semibold">
                {currentSession.status === "closed" && currentSession.closing_amount
                  ? formatAmount(currentSession.closing_amount)
                  : "-"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  )
}
