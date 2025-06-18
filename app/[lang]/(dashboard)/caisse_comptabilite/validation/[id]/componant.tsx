"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { Card, CardContent, CardDescription, CardHeader, CardTitle , CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { CalendarDays, User, DollarSign, MessageSquare, Clock, CheckCircle, XCircle } from "lucide-react"
import toast from "react-hot-toast"
import { useSchoolStore } from "@/store/index"
import { ValidationExpense, Demand } from "@/lib/interface"
import { fetchDemands, fetchValidationExpenses } from "@/store/schoolservice"
import Loading from "./loading"
import { useRouter } from 'next/navigation'

interface Props {
  demande: Demand
  validation: ValidationExpense
}

export default function DemandDetailsPage({ demande, validation }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [validationStatus, setValidationStatus] = useState<"approuvée" | "refusée">("approuvée")
  const [comment, setComment] = useState("")
  const { userOnline, setValidationExpenses, setDemands, settings } = useSchoolStore()

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 500)
    return () => clearTimeout(timer)
  }, [])

  const formatAmount = (amount: number) => {
    return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " " + (settings?.[0]?.currency || "FCFA")
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return "Non validé"
    const date = new Date(dateString)
    return date.toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "en attente":
        return (
          <Badge color="warning" className="bg-yellow-100 text-yellow-800">
            <Clock className="w-3 h-3 mr-1" />
            En attente
          </Badge>
        )
      case "approuvée":
        return (
          <Badge color="success" className="bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Badge>
        )
      case "refusée":
        return (
          <Badge color="destructive" className="bg-red-100 text-red-800">
            <XCircle className="w-3 h-3 mr-1" />
            Refusée
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getAvatarUrl = (avatar: string | null | undefined) => {
    if (!avatar) return undefined
    return avatar.startsWith('http') ? avatar : `${process.env.NEXT_PUBLIC_API_BASE_URL_2}/${avatar}`
  }

  const handleValidation = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!demande || !userOnline) {
      toast.error("Données manquantes")
      return
    }

    if (!validation || validation.user_id !== userOnline.id) {
      toast.error("Vous n'êtes pas autorisé à valider cette demande")
      return
    }

    if (validation.validation_status !== "en attente" || demande.status !== "en attente") {
      toast.error("Cette demande a déjà été traitée")
      return
    }

    setSubmitting(true)

    try {
      const validationData = {
        user_id: userOnline.id,
        demand_id: validation.demand_id,
        validation_date: new Date().toISOString().replace('T', ' ').slice(0, 19),
        validation_order: validation.validation_order,
        validation_status: validationStatus,
        comment: comment || "aucun commentaire",
      }

      const validationResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/validationExpense/${validation.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(validationData),
      })

      if (!validationResponse.ok) {
        throw new Error("Échec de la validation")
      }

      let demandStatus: 'en attente' | 'approuvée' | 'refusée' = demande.status
      if (validationStatus === "refusée") {
        demandStatus = "refusée"
      }
      if (validationStatus === "approuvée") {
        demandStatus = "approuvée"
      }

      const demandData = {
        applicant_id: demande.applicant_id,
        pattern: demande.pattern,
        amount: demande.amount,
        status: demandStatus,
      }

      const demandResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/demand/${demande.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(demandData),
      })

      if (!demandResponse.ok) {
        throw new Error("Échec de la mise à jour de la demande")
      }

      const [updatedValidations, updatedDemands] = await Promise.all([
        fetchValidationExpenses(),
        fetchDemands()
      ])

      setValidationExpenses(updatedValidations)
      setDemands(updatedDemands)

      toast.success(`Demande ${validationStatus} avec succès`)
      setComment("")
    } catch (error) {
      console.error("Validation error:", error)
      toast.error(error instanceof Error ? error.message : "Erreur lors de la validation")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <Card className="container mx-auto p-6">
        <Loading />
      </Card>
    )
  }

  if (!demande) {
    return (
      <Card className="container mx-auto p-6">
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">Demande non trouvée</p>
        </CardContent>
      </Card>
    )
  }

  const canValidate = validation &&
    userOnline &&
    validation.user_id === userOnline.id &&
    validation.validation_status === "en attente" &&
    demande.status === "en attente"

  return (
    <Card className="container mx-auto p-6 space-y-6">
      {/* En-tête */}
      <CardHeader className="pb-0">
        <div className="flex items-center justify-between">
          <CardTitle>Demande de décaissement #{demande.id}</CardTitle>
          {getStatusBadge(demande.status)}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Informations de la demande */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Détails de la demande
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-muted-foreground">Motif</Label>
                <p className="text-sm">{demande.pattern}</p>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-muted-foreground">Montant</Label>
                <p className="text-lg font-semibold text-green-600">{formatAmount(demande.amount)}</p>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-muted-foreground">Date de création</Label>
                <p className="text-sm flex items-center gap-1">
                  <CalendarDays className="w-4 h-4" />
                  {formatDate(demande.created_at)}
                </p>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-muted-foreground">Dernière mise à jour</Label>
                <p className="text-sm flex items-center gap-1">
                  <CalendarDays className="w-4 h-4" />
                  {formatDate(demande.updated_at)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Informations du demandeur */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Demandeur
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Avatar className="w-12 h-12">
                <AvatarImage asChild src={getAvatarUrl(demande.applicant.avatar)}>
                  <Image
                    src={getAvatarUrl(demande.applicant.avatar) || ""}
                    alt={`Avatar de ${demande.applicant.name}`}
                    width={48}
                    height={48}
                  />
                </AvatarImage>
                <AvatarFallback>
                  {demande.applicant.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{demande.applicant.name}</p>
                <p className="text-sm text-muted-foreground">{demande.applicant.email}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Validation */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Processus de validation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <Avatar className="w-10 h-10">
                  <AvatarImage asChild src={getAvatarUrl(validation.user?.avatar)}>
                    <Image
                      src={getAvatarUrl(validation.user?.avatar) || ""}
                      alt={`Avatar de ${validation.user?.name}`}
                      width={40}
                      height={40}
                    />
                  </AvatarImage>
                  <AvatarFallback>
                    {validation.user?.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{validation.user?.name}</p>
                    </div>
                    {getStatusBadge(validation.validation_status)}
                  </div>
                  {validation.comment && (
                    <div className="bg-gray-50 p-3 rounded-md">
                      <p className="text-sm">{validation.comment}</p>
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {validation.validation_date ? formatDate(validation.validation_date) : "En attente"}
                  </p>
                </div>
              </div>
              <Separator className="my-4" />
            </div>
          </CardContent>
          {!canValidate && (
            <CardFooter className="flex justify-center gap-4">
              <p className="text-muted-foreground">Vous n'êtes pas autorisé à valider cette demande</p>
              <Button 
                onClick={() => router.push("/caisse_comptabilite/decaissement/validation/")}
                variant="outline"
                color="destructive"
              >
                Retour à la liste des validations
              </Button>
            </CardFooter>
          )}
        </Card>

        {/* Formulaire de validation */}
        {canValidate && (
          <Card>
            <CardHeader>
              <CardTitle>Valider la demande</CardTitle>
              <CardDescription>
                Vous êtes responsable de la validation de cette demande.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleValidation} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="validation-status">Décision</Label>
                  <Select
                    value={validationStatus}
                    onValueChange={(value: "approuvée" | "refusée") => setValidationStatus(value)}
                    disabled={submitting}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner une action" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="approuvée">approuver</SelectItem>
                      <SelectItem value="refusée">refuser</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="comment">Commentaire {validationStatus === "refusée" && "(obligatoire)"}</Label>
                  <Textarea 
                  color={
                    validationStatus === "refusée"
                      ? "destructive"
                      : "primary"
                  }
                    id="comment"
                    placeholder={
                      validationStatus === "refusée"
                        ? "Veuillez expliquer le motif du refus"
                        : "Commentaire optionnel"
                    }
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={3}
                    required={validationStatus === "refusée" && !comment}
                    disabled={submitting}
                  />
                </div>
                <div className="flex justify-around gap-2">
                  <Button
                    color="destructive"
                    onClick={() => router.push("/caisse_comptabilite")}
                    disabled={submitting}
                    className=""
                  >
                    Annuler

                  </Button>



                  <Button
                    color="indigodye"
                    type="submit"
                    disabled={submitting || (validationStatus === "refusée" && !comment)}
                    className=""
                  >
                    {submitting ? (
                      <span className="flex items-center gap-2">
                        <Clock className="h-4 w-4 animate-spin" />
                        Traitement...
                      </span>
                    ) : (
                      `${validationStatus === "approuvée" ? "approuver" : "refuser"} la demande`
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}
      </CardContent>

    </Card>
  )
}