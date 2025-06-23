import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CalendarIcon, CreditCard, School, Building2, Phone, Mail, MapPin } from "lucide-react";
import { Pricing } from "@/lib/interface";
import { useSchoolStore } from "@/store";
import Image from "next/image";
import { Separator } from "@/components/ui/separator";

interface PaymentScheduleProps {
  pricing: Pricing
}

export function PaymentSchedule({ pricing }: PaymentScheduleProps) {
  const { settings } = useSchoolStore();
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

  // School info
  const schoolInfo = {
    logo: settings?.[0]?.establishment_logo || "",
    name: settings?.[0]?.establishment_name || "Nom Établissement",
    address: settings?.[0]?.address || "Adresse établissement",
    phone: `${settings?.[0]?.establishment_phone_1 || ""} ${settings?.[0]?.establishment_phone_2 ? "/ " + settings?.[0]?.establishment_phone_2 : ""}`.trim(),
    currency: settings?.[0]?.currency || "FCFA"
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow-sm" style={{ fontSize: "12px" }}>
      {/* Header */}
      <div className="flex justify-between items-start border-b pb-3 mb-4">
        <div className="flex items-start gap-3">
          {schoolInfo.logo ? (
            <Image
              src={`${process.env.NEXT_PUBLIC_API_BASE_URL_2}/${schoolInfo.logo}`}
              alt="Logo"
              width={80}
              height={80}
              className="school-logo"
            />
          ) : (
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm">
              Logo
            </div>
          )}
          <div className="space-y-1">
            <h1 className="text-sm font-bold leading-snug">{schoolInfo.name}</h1>
            <p className="text-xs text-gray-600 leading-snug">
              {schoolInfo.address} | Tél: {schoolInfo.phone}
            </p>
            <p className="text-xs text-gray-600 leading-snug">
              Année scolaire: {pricing.academic_year.label}
            </p>
          </div>
        </div>
        <div className="text-right space-y-1">
          <h2 className="text-sm font-semibold leading-snug">ÉCHÉANCIER DE PAIEMENT</h2>
          <p className="text-xs text-gray-600 leading-snug">
            Niveau: {pricing.level.label}
          </p>
          <p className="text-xs text-gray-600 leading-snug">
            Type: {pricing.assignment_type.label}
          </p>
        </div>
      </div>

      {/* Détails de la tarification */}
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-blue-800 mb-2">DÉTAILS DES FRAIS</h3>
        <div className="grid grid-cols-2 gap-x-4 gap-y-2">
          <div className="flex items-start">
            <span className="font-semibold min-w-[100px]">Type de frais:</span>
            <span className="text-gray-800 ml-2">{pricing.fee_type.label}</span>
          </div>
          <div className="flex items-start">
            <span className="font-semibold min-w-[100px]">Statut:</span>
            <span className="text-gray-800 ml-2">{pricing.assignment_type.label}</span>
          </div>
          <div className="flex items-start">
            <span className="font-semibold min-w-[100px]">Montant total:</span>
            <span className="text-gray-800 ml-2 font-bold">
              {totalAmount.toLocaleString("fr-FR")} {schoolInfo.currency}
            </span>
          </div>
        </div>
      </div>

      <Separator className="my-3" />

      {/* Tableau des échéances */}
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-blue-800 mb-2">DÉTAIL DES ÉCHÉANCES</h3>
        <Table className="border">
          <TableHeader>
            <TableRow>
              <TableHead className="border p-2 text-left">Libellé</TableHead>
              <TableHead className="border p-2 text-right">Montant</TableHead>
              <TableHead className="border p-2 text-right">Date d'échéance</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pricing.installments?.map((installment, index) => (
              <TableRow key={installment.id}>
                <TableCell className="border p-2">{installmentLabel(index)}</TableCell>
                <TableCell className="border p-2 text-right">
                  {Number.parseFloat(installment.amount_due).toLocaleString("fr-FR")} {schoolInfo.currency}
                </TableCell>
                <TableCell className="border p-2 text-right">
                  {formatDate(installment.due_date)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Separator className="my-3" />

      {/* Signatures */}
      <div className="grid grid-cols-2 gap-4 mt-4">
        <div className="text-xs text-gray-700 text-center space-y-2">
          <div className="border-t border-gray-400 h-10 w-40 mx-auto"></div>
          <span>Cachet et signature de l'établissement</span>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-xs text-gray-600 mt-4 pt-4 border-t">
        <p className="mb-1">Document officiel de {schoolInfo.name}</p>
        <p>Émis le {new Date().toLocaleDateString("fr-FR")}</p>
      </div>
    </div>
  )
}