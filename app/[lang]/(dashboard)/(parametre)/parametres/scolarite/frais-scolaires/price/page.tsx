"use client"

import { useState, useRef, useEffect } from "react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { CalendarIcon, Plus, Trash2, Printer, Download, ArrowLeft, ChevronDown, ChevronUp } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { Switch } from "@/components/ui/switch"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Progress } from "@/components/ui/progress"

interface Paiement {
  id: string
  date: Date
  montant: number
}

// Données fictives pour les sélecteurs
const levels = [
  { id: 1, name: "Primaire" },
  { id: 2, name: "Collège" },
  { id: 3, name: "Lycée" },
]

const assignmentTypes = [
  { id: 1, name: "Inscription" },
  { id: 2, name: "Réinscription" },
]

const academicYears = [
  { id: 1, name: "2023-2024" },
  { id: 2, name: "2024-2025" },
]

const feeTypes = [
  { id: 1, name: "Frais de scolarité" },
  { id: 2, name: "Frais d'inscription" },
  { id: 3, name: "Frais de cantine" },
]

// Composant Select contrôlé
function ControlledSelectData({
  datas,
  onSelect,
  placeholder,
  defaultValue,
}: {
  datas: any[]
  onSelect: (id: number) => void
  placeholder: string
  defaultValue?: number
}) {
  const [value, setValue] = useState<string>(defaultValue?.toString() || "")

  useEffect(() => {
    if (defaultValue) {
      setValue(defaultValue.toString())
      onSelect(defaultValue)
    }
  }, [defaultValue, onSelect])

  return (
    <Select
      value={value}
      onValueChange={(val) => {
        setValue(val)
        onSelect(Number(val))
      }}
    >
      <SelectTrigger className="w-full">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {datas.map((item) => (
          <SelectItem key={item.id} value={item.id.toString()}>
            {item.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

export default function TarificationPage() {
  // États pour la tarification
  const [label, setLabel] = useState<string>("")
  const [amount, setAmount] = useState<string>("")
  const [selectedLevelId, setSelectedLevelId] = useState<number | null>(null)
  const [assignmentTypeId, setAssignmentTypeId] = useState<number | null>(null)
  const [academicYearId, setAcademicYearId] = useState<number | null>(null)
  const [feeTypeId, setFeeTypeId] = useState<number | null>(null)

  // État pour l'échéancier
  const [useEcheancier, setUseEcheancier] = useState<boolean>(false)
  const [paiements, setPaiements] = useState<Paiement[]>([])
  const [nouvelleDatePaiement, setNouvelleDatePaiement] = useState<Date | undefined>(undefined)
  const [nouveauMontantPaiement, setNouveauMontantPaiement] = useState<string>("")
  const [calendarOpen, setCalendarOpen] = useState(false)
  const [echeancierValide, setEcheancierValide] = useState(false)
  const [isFormExpanded, setIsFormExpanded] = useState(true)
  const tableauRef = useRef<HTMLDivElement>(null)

  const montantRestant =
    useEcheancier && paiements.length > 0
      ? Number.parseInt(amount || "0") - paiements.reduce((sum, p) => sum + p.montant, 0)
      : 0

  const ajouterPaiement = () => {
    if (!nouvelleDatePaiement || !nouveauMontantPaiement || Number.parseInt(nouveauMontantPaiement) <= 0) {
      return
    }

    const nouveauPaiement: Paiement = {
      id: Date.now().toString(),
      date: nouvelleDatePaiement,
      montant: Number.parseInt(nouveauMontantPaiement),
    }

    setPaiements([...paiements, nouveauPaiement])
    setNouvelleDatePaiement(undefined)
    setNouveauMontantPaiement("")
    setCalendarOpen(false)
  }

  const supprimerPaiement = (id: string) => {
    setPaiements(paiements.filter((p) => p.id !== id))
  }

  const formatMontant = (montant: number) => {
    return new Intl.NumberFormat("fr-FR").format(montant) + " FCFA"
  }

  const validerEcheancier = () => {
    setEcheancierValide(true)
  }

  const retourModification = () => {
    setEcheancierValide(false)
  }

  const imprimerEcheancier = () => {
    const contenuOriginal = document.body.innerHTML
    const contenuImprimer = tableauRef.current?.innerHTML || ""

    document.body.innerHTML = `
      <div style="padding: 20px;">
        <h1 style="text-align: center; font-size: 24px; font-weight: bold; margin-bottom: 20px;">Échéancier de Paiement</h1>
        <h2 style="text-align: center; font-size: 18px; margin-bottom: 30px;">Montant total: ${formatMontant(Number.parseInt(amount))}</h2>
        ${contenuImprimer}
      </div>
      <style>
        body { font-family: Arial, sans-serif; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
        .resume { margin-top: 20px; font-weight: bold; }
        .text-red-500 { color: #ef4444; }
        .text-green-500 { color: #10b981; }
      </style>
    `

    window.print()
    document.body.innerHTML = contenuOriginal
  }

  const telechargerEcheancier = () => {
    // Simuler un téléchargement
    const link = document.createElement("a")
    link.href = "#"
    link.download = `echeancier-${label || "tarification"}.pdf`
    link.click()
  }

  // Trier les paiements par date
  const paiementsTries = [...paiements].sort((a, b) => a.date.getTime() - b.date.getTime())

  // Validation du formulaire
  const isFormValid = () => {
    if (
      !label.trim() ||
      !amount.trim() ||
      Number(amount) <= 0 ||
      selectedLevelId === null ||
      assignmentTypeId === null ||
      academicYearId === null ||
      feeTypeId === null
    ) {
      return false
    }

    if (useEcheancier) {
      return paiements.length > 0 && montantRestant === 0
    }

    return true
  }

  // Soumission du formulaire
  const handleSubmit = () => {
    if (!isFormValid()) {
      alert("Veuillez remplir tous les champs obligatoires.")
      return
    }

    if (useEcheancier) {
      setEcheancierValide(true)
    } else {
      alert("Tarification enregistrée avec succès !")
    }
  }

  if (echeancierValide) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-primary">Échéancier de Paiement Validé</h1>
            <Button variant="outline" onClick={retourModification}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Retour à la modification
            </Button>
          </div>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl">Récapitulatif de l'échéancier</CardTitle>
              <CardDescription className="text-lg">
                {label} - Montant total: <span className="font-semibold">{formatMontant(Number.parseInt(amount))}</span>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div ref={tableauRef}>
                <Table className="border rounded-lg">
                  <TableHeader className="bg-secondary">
                    <TableRow>
                      <TableHead className="font-bold">N°</TableHead>
                      <TableHead className="font-bold">Date</TableHead>
                      <TableHead className="font-bold">Montant</TableHead>
                      <TableHead className="font-bold">Solde restant</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paiementsTries.map((paiement, index) => {
                      const soldeAvant =
                        Number.parseInt(amount) - paiementsTries.slice(0, index).reduce((sum, p) => sum + p.montant, 0)

                      const soldeApres = soldeAvant - paiement.montant

                      return (
                        <TableRow key={paiement.id} className="hover:bg-secondary/50">
                          <TableCell>{index + 1}</TableCell>
                          <TableCell>{format(paiement.date, "dd/MM/yyyy")}</TableCell>
                          <TableCell>{formatMontant(paiement.montant)}</TableCell>
                          <TableCell>{formatMontant(soldeApres)}</TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>

                <div className="mt-6 space-y-4 p-4 bg-secondary/20 rounded-lg">
                  <div className="flex justify-between font-medium text-lg">
                    <span>Total payé:</span>
                    <span className="font-bold">{formatMontant(paiements.reduce((sum, p) => sum + p.montant, 0))}</span>
                  </div>
                  <div className="flex justify-between font-medium text-lg">
                    <span>Reste à payer:</span>
                    <span className={montantRestant > 0 ? "text-red-500 font-bold" : "text-green-500 font-bold"}>
                      {formatMontant(montantRestant)}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex gap-4 justify-end border-t pt-4">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" onClick={imprimerEcheancier}>
                      <Printer className="mr-2 h-4 w-4" /> Imprimer
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Imprimer l'échéancier</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button onClick={telechargerEcheancier}>
                      <Download className="mr-2 h-4 w-4" /> Télécharger en PDF
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Télécharger l'échéancier au format PDF</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-primary mb-6">Définir une tarification</h1>

        <Card className="shadow-lg mb-8">
          <CardHeader
            className="cursor-pointer hover:bg-secondary/10 transition-colors rounded-t-lg"
            onClick={() => setIsFormExpanded(!isFormExpanded)}
          >
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Informations de la tarification</CardTitle>
                <CardDescription>Définissez les détails de la tarification</CardDescription>
              </div>
              {isFormExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
            </div>
          </CardHeader>
          <AnimatePresence>
            {isFormExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <CardContent>
                  <ScrollArea className="h-auto max-h-[500px]">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
                      {/* Libellé */}
                      <div className="space-y-2">
                        <Label htmlFor="label" className="flex items-center gap-2">
                          Libellé <Badge variant="outline" className="text-xs">Obligatoire</Badge>
                        </Label>
                        <Input
                          id="label"
                          type="text"
                          placeholder="ex : Tarification inscription"
                          value={label}
                          onChange={(e) => setLabel(e.target.value)}
                          className="focus-visible:ring-primary"
                        />
                      </div>

                      {/* Montant */}
                      <div className="space-y-2">
                        <Label htmlFor="amount" className="flex items-center gap-2">
                          Montant <Badge variant="outline" className="text-xs">Obligatoire</Badge>
                        </Label>
                        <Input
                          id="amount"
                          type="number"
                          placeholder="ex : 100000"
                          min={1}
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          className="focus-visible:ring-primary"
                        />
                      </div>

                      {/* Niveau */}
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                          Niveau <Badge variant="outline" className="text-xs">Obligatoire</Badge>
                        </Label>
                        <ControlledSelectData datas={levels} onSelect={setSelectedLevelId} placeholder="Choisir un niveau" />
                      </div>

                      {/* Type d'affectation */}
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                          Type d'affectation <Badge variant="outline" className="text-xs">Obligatoire</Badge>
                        </Label>
                        <ControlledSelectData
                          datas={assignmentTypes}
                          onSelect={setAssignmentTypeId}
                          placeholder="Choisir un type d'affectation"
                        />
                      </div>

                      {/* Année académique */}
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                          Année académique <Badge variant="outline" className="text-xs">Obligatoire</Badge>
                        </Label>
                        <ControlledSelectData
                          datas={academicYears}
                          onSelect={setAcademicYearId}
                          placeholder="Choisir une année académique"
                        />
                      </div>

                      {/* Type de frais */}
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                          Type de frais <Badge variant="outline" className="text-xs">Obligatoire</Badge>
                        </Label>
                        <ControlledSelectData datas={feeTypes} onSelect={setFeeTypeId} placeholder="Choisir un type de frais" />
                      </div>

                      {/* Option échéancier */}
                      <div className="flex flex-col gap-2 md:col-span-2">
                        <div className="flex items-center justify-between p-4 bg-secondary/20 rounded-lg">
                          <Label htmlFor="use-echeancier" className="text-lg font-medium">
                            Définir un échéancier de paiement
                          </Label>
                          <Switch
                            id="use-echeancier"
                            checked={useEcheancier}
                            onCheckedChange={setUseEcheancier}
                            className="data-[state=checked]:bg-primary"
                          />
                        </div>
                      </div>
                    </div>
                  </ScrollArea>
                </CardContent>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>

        <AnimatePresence>
          {useEcheancier && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="grid gap-8 md:grid-cols-2 mb-8"
            >
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle>Ajouter un paiement</CardTitle>
                  <CardDescription>Définissez les paiements échelonnés</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <Label htmlFor="date-paiement">Date du paiement</Label>
                      <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !nouvelleDatePaiement && "text-muted-foreground",
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {nouvelleDatePaiement ? (
                              format(nouvelleDatePaiement, "PPP", { locale: fr })
                            ) : (
                              <span>Sélectionner une date</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={nouvelleDatePaiement}
                            onSelect={setNouvelleDatePaiement}
                            initialFocus
                            locale={fr}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div className="space-y-3">
                      <Label htmlFor="montant-paiement">Montant du paiement (FCFA)</Label>
                      <Input
                        id="montant-paiement"
                        type="number"
                        placeholder="Ex: 100000"
                        value={nouveauMontantPaiement}
                        onChange={(e) => setNouveauMontantPaiement(e.target.value)}
                        className="focus-visible:ring-primary"
                      />
                    </div>
                    <Button
                      onClick={ajouterPaiement}
                      disabled={
                        !nouvelleDatePaiement || !nouveauMontantPaiement || Number.parseInt(nouveauMontantPaiement) <= 0
                      }
                      className="w-full"
                    >
                      <Plus className="mr-2 h-4 w-4" /> Ajouter ce paiement
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle>Récapitulatif de l'échéancier</CardTitle>
                  <CardDescription>
                    {amount ? (
                      <>Montant total: <span className="font-semibold">{formatMontant(Number.parseInt(amount))}</span></>
                    ) : (
                      "Veuillez saisir un montant total"
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {paiements.length > 0 ? (
                    <div className="space-y-6">
                      <Table>
                        <TableHeader className="bg-secondary">
                          <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Montant</TableHead>
                            <TableHead className="w-[80px]"></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {paiementsTries.map((paiement) => (
                            <motion.tr
                              key={paiement.id}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              className="hover:bg-secondary/50"
                            >
                              <TableCell>{format(paiement.date, "dd/MM/yyyy")}</TableCell>
                              <TableCell>{formatMontant(paiement.montant)}</TableCell>
                              <TableCell>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => supprimerPaiement(paiement.id)}
                                  className="text-red-500 hover:text-red-600"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </motion.tr>
                          ))}
                        </TableBody>
                      </Table>

                      <div className="space-y-4">
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Progression:</span>
                            <span>
                              {Math.round(
                                (paiements.reduce((sum, p) => sum + p.montant, 0) / Number.parseInt(amount || "1")) *
                                  100
                              )}
                              %
                            </span>
                          </div>
                          <Progress
                            value={
                              (paiements.reduce((sum, p) => sum + p.montant, 0) / Number.parseInt(amount || "1")) *
                              100
                            }
                            className="h-2"
                          />
                        </div>

                        <Separator />

                        <div className="flex justify-between font-medium text-lg">
                          <span>Total payé:</span>
                          <span className="font-bold">
                            {formatMontant(paiements.reduce((sum, p) => sum + p.montant, 0))}
                          </span>
                        </div>
                        <div className="flex justify-between font-medium text-lg">
                          <span>Reste à payer:</span>
                          <span className={montantRestant > 0 ? "text-red-500 font-bold" : "text-green-500 font-bold"}>
                            {formatMontant(montantRestant)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <p className="mb-4">Aucun paiement défini.</p>
                      <p>Utilisez le formulaire pour ajouter des paiements à votre échéancier.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex justify-end"
        >
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  className="w-full md:w-auto px-8 py-6 text-lg"
                  onClick={handleSubmit}
                  disabled={!isFormValid()}
                >
                  {useEcheancier ? "Valider l'échéancier" : "Enregistrer la tarification"}
                </Button>
              </TooltipTrigger>
              {!isFormValid() && (
                <TooltipContent side="top">
                  <p>Veuillez remplir tous les champs obligatoires</p>
                  {useEcheancier && montantRestant !== 0 && (
                    <p>Le montant total des paiements doit correspondre au montant défini</p>
                  )}
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
        </motion.div>
      </motion.div>
    </div>
  )
}