"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useReinscriptionStore } from "@/hooks/use-reinscription-store"
import { CheckCircle, Download, PrinterIcon as Print } from "lucide-react"
import { useSchoolStore } from "@/store/index"
import { motion, AnimatePresence } from "framer-motion"
import { Key } from "react"
import { toast } from "react-hot-toast"
import { generatePDFfromRef } from "@/lib/utils"
import { useRef } from "react"

interface ReinscriptionReceiptProps {
  onNewReinscription: () => void
}

export function ReinscriptionReceipt({ onNewReinscription }: ReinscriptionReceiptProps) {
  const { selectedStudent, existingTutors, newTutors, registrationData, payments, newDocuments, paidAmount } =
    useReinscriptionStore()

  const {
    methodPayment,
    availablePricing,
    paymentsForm,
    setPaymentsForm,
    setPaidAmount,
    cashRegisterSessionCurrent
  } = useSchoolStore()

  const printRef = useRef<HTMLDivElement>(null)

  const handlePDF = async (mode: "download" | "print") => {
    await generatePDFfromRef(printRef, `reçu_inscription_${selectedStudent?.name}_${selectedStudent?.first_name}`, mode)
  }

  const handlePrint = () => {
    handlePDF("print")
  }

  const handleDownload = () => {
    handlePDF("download")
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card className="print:shadow-none">
        <CardHeader className="text-center bg-green-50 print:bg-white">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
            <CardTitle className="text-2xl text-green-800">Réinscription Réussie</CardTitle>
          </div>
          <p className="text-gray-600">Reçu de réinscription - {new Date().toLocaleDateString("fr-FR")}</p>
        </CardHeader>
        <CardContent className="space-y-6 p-6">
          {/* Student Information */}
          {selectedStudent && (
            <div>
              <h3 className="text-lg font-semibold mb-4 text-blue-800">Informations de l'élève</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Nom complet:</span>
                    <span className="font-medium">
                      {selectedStudent.name} {selectedStudent.first_name}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Matricule:</span>
                    <span className="font-medium">{selectedStudent.registration_number}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date de naissance:</span>
                    <span className="font-medium">
                      {new Date(selectedStudent.birth_date).toLocaleDateString("fr-FR")}
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Sexe:</span>
                    <span className="font-medium">{selectedStudent.sexe}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Statut:</span>
                    <Badge color="secondary">{selectedStudent.status}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date de réinscription:</span>
                    <span className="font-medium">
                      {registrationData
                        ? new Date(registrationData.registration_date).toLocaleDateString("fr-FR")
                        : "N/A"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <Separator />

          {/* Tutors Information */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-blue-800">Tuteurs</h3>
            <div className="space-y-3">
              {existingTutors.map((tutor) => (
                <div key={tutor.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">
                      {tutor.name} {tutor.first_name}
                    </p>
                    <p className="text-sm text-gray-600">
                      {tutor.phone_number} - {tutor.type_tutor}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    {tutor.is_tutor_legal && <Badge>Tuteur légal</Badge>}
                    {tutor.isModified && <Badge variant="outline">Modifié</Badge>}
                  </div>
                </div>
              ))}
              {newTutors.map((tutor, index) => (
                <div key={`new-${index}`} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div>
                    <p className="font-medium">
                      {tutor.name} {tutor.first_name}
                    </p>
                    <p className="text-sm text-gray-600">
                      {tutor.phone_number} - {tutor.type_tutor}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <Badge variant="outline">Nouveau</Badge>
                    {tutor.is_tutor_legal && <Badge>Tuteur légal</Badge>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Payment Information */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-blue-800">Détails des paiements</h3>
            <div className="space-y-3">
              {payments.map((payment, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">Échéance ID: {payment.installment_id}</span>
                    <span className="text-lg font-bold text-green-600">{payment.amount.toLocaleString()} FCFA</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    <p>Méthodes de paiement:</p>
                    <div className="grid gap-2">
                      {payment.methods.map((method: { id: number; montant: any }, methodIndex: Key | null | undefined) => {
                        const paymentMethod = methodPayment.find(mp => mp.id === method.id)
                        const percentage = (Number(method.montant) / payment.amount) * 100

                        return (
                          <motion.div
                            key={methodIndex}
                            whileHover={{ scale: 1.01 }}
                            className="flex items-center justify-between p-3 bg-whitesmoke rounded-md"
                          >
                            <div className="flex items-center space-x-3">
                              <div className="w-2 h-2 rounded-full bg-skyblue"></div>
                              <span className="font-medium">
                                {paymentMethod?.name || 'Méthode inconnue'}
                              </span>
                            </div>

                            <div className="text-right">
                              <div className="font-semibold">
                                {Number(method.montant).toLocaleString()} FCFA
                              </div>
                              <div className="text-xs text-gray-500">
                                {percentage.toFixed(1)}%
                              </div>
                            </div>
                          </motion.div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              ))}

              <div className="bg-green-100 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold">Total versé:</span>
                  <span className="text-2xl font-bold text-green-700">{paidAmount.toLocaleString()} FCFA</span>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Documents Information */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-blue-800">Nouveaux documents fournis</h3>
            {newDocuments.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {newDocuments.map((doc, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium">{doc.label}</span>
                    <Badge variant="outline">Nouveau</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 italic">Aucun nouveau document fourni</p>
            )}
          </div>

          <Separator />

          {/* Footer */}
          <div className="text-center text-sm text-gray-600">
            <p>Ce reçu confirme la réinscription de l'élève dans notre établissement.</p>
            <p>Conservez ce document pour vos dossiers.</p>
            <p className="mt-2 font-medium">
              Date d'émission: {new Date().toLocaleDateString("fr-FR")} à {new Date().toLocaleTimeString("fr-FR")}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-center space-x-4 print:hidden">
        <Button onClick={handlePrint} variant="outline">
          <Print className="w-4 h-4 mr-2" />
          Imprimer
        </Button>
        <Button onClick={handleDownload} variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Télécharger PDF
        </Button>
        <Button onClick={onNewReinscription}>Nouvelle réinscription</Button>
      </div>
    </div>
  )
}
