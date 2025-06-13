import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CalendarIcon, CreditCard, School, Building2, Phone, Mail, MapPin } from "lucide-react";
import { Pricing } from "@/lib/interface";

interface PaymentScheduleProps {
  pricing: Pricing
}

export function PaymentSchedule({ pricing }: PaymentScheduleProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  }

  const totalAmount = Number.parseFloat(pricing.amount)
  const installmentLabel = (index: number) => {
    const labels = ["Premier versement", "Deuxième versement", "Troisième versement", "Quatrième versement"]
    return index < labels.length ? labels[index] : `Versement ${index + 1}`
  }

  return (
    <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm print:p-0 print:border-0 print:shadow-none">
      {/* En-tête avec logo et informations de l'école */}
      <div className="flex justify-between items-start mb-8 border-b pb-6 print:flex print:justify-between">
        <div className="flex items-center gap-4">
          <div className="bg-primary/10 p-1 rounded-lg">
            <Building2 className="h-8 w-8 text-skyblue" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">École Excellence</h1>
            <p className="text-sm text-muted-foreground">Éducation - Formation - Excellence</p>
          </div>
        </div>
        
        <div className="text-right space-y-1 text-sm">
          <div className="flex items-center justify-end gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span>123 Avenue des Écoles, Abidjan</span>
          </div>
          <div className="flex items-center justify-end gap-2">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <span>+225 33 123 45 67</span>
          </div>
          <div className="flex items-center justify-end gap-2">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span>contact@ecole-excellence.edu</span>
          </div>
        </div>
      </div>

      {/* Détails de la tarification */}
      <div className="flex justify-between items-start mb-6 print:flex print:justify-between">
        <div>
          <h2 className="text-xl font-bold">{pricing.fee_type.label}</h2>
          <div className="flex items-center mt-2 text-muted-foreground">
            <School className="h-4 w-4 mr-2" />
            <span> Niveau : {pricing.level.label}</span>
            <span className="mx-2">•</span>
            <span>Année académique : {pricing.academic_year.label}</span>
          </div>
          <div className="flex items-center mt-1 text-muted-foreground">
            {/* <CreditCard className="h-4 w-4 mr-2" /> */}
            <span className="mx-2">•</span>
            <span>Statut: {pricing.assignment_type.label}</span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm text-muted-foreground">Montant total</div>
          <div className="text-xl font-bold border border-gray-300 p-2">
            {totalAmount.toLocaleString("fr-FR")} FCFA
          </div>
        </div>
      </div>

      {/* Tableau des échéances */}
      <Card className="mb-6">
        <CardHeader className="bg-muted/50">
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Échéancier de paiement
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">Libellé</TableHead>
                <TableHead className="text-right">Montant</TableHead>
                <TableHead className="text-right">Date d'échéance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pricing.installments?.map((installment, index) => (
                <TableRow key={installment.id}>
                  <TableCell className="font-medium">{installmentLabel(index)}</TableCell>
                  <TableCell className="text-right">
                    {Number.parseFloat(installment.amount_due).toLocaleString("fr-FR")} FCFA
                  </TableCell>
                  <TableCell className="text-right flex items-center justify-end">
                    <CalendarIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                    {formatDate(installment.due_date)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pied de page */}
      <div className="mt-6 pt-4 border-t text-sm text-muted-foreground">
        <div className="font-medium mb-2">Notes importantes :</div>
        <ul className="list-disc pl-5 space-y-1">
          <li>Les paiements doivent être effectués avant la date d'échéance</li>
          <li>Pour toute question, veuillez contacter le service financier</li>
        </ul>
      </div>

      {/* Signature */}
      <div className="mt-3 pt-4 border-t flex justify-end">
        <div className="text-center">
          <div className="mb-1 text-sm text-muted-foreground">cachet</div>
          <div className="h-0.5 w-32 bg-gray-200 my-2 mx-auto"></div>
        </div>
      </div>
    </div>
  )
}