"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useSchoolStore } from "@/store/index"
import { CheckCircle, Download, PrinterIcon as Print } from "lucide-react"

interface RegistrationReceiptProps {
  onNewRegistration: () => void
}

export function RegistrationReceipt({ onNewRegistration }: RegistrationReceiptProps) {
  const { studentData, selectedTutors, newTutors, registrationData, paymentsForm, documentsForm, paidAmount } =
    useSchoolStore()

  const handlePrint = () => {
    window.print()
  }

  const handleDownload = () => {
    // Implementation for downloading receipt as PDF
    alert("Fonctionnalité de téléchargement à implémenter")
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card className="print:shadow-none">
        <CardHeader className="text-center bg-green-50 print:bg-white">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
            <CardTitle className="text-2xl text-green-800">Inscription Réussie</CardTitle>
          </div>
          <p className="text-gray-600">Reçu d'inscription - {new Date().toLocaleDateString("fr-FR")}</p>
        </CardHeader>
        <CardContent className="space-y-6 p-6">
          {/* Student Information */}
          {studentData && (
            <div>
              <h3 className="text-lg font-semibold mb-4 text-blue-800">Informations de l'élève</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Nom complet:</span>
                    <span className="font-medium">
                      {studentData.name} {studentData.first_name}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Matricule:</span>
                    <span className="font-medium">{studentData.registration_number}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date de naissance:</span>
                    <span className="font-medium">{new Date(studentData.birth_date).toLocaleDateString("fr-FR")}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Sexe:</span>
                    <span className="font-medium">{studentData.sexe}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Statut:</span>
                    <Badge variant="outline">{studentData.status}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date d'inscription:</span>
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
              {selectedTutors.map((tutor, index) => (
                <div key={tutor.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">
                      {tutor.name} {tutor.first_name}
                    </p>
                    <p className="text-sm text-gray-600">
                      {tutor.phone_number} - {tutor.type_tutor}
                    </p>
                  </div>
                  {tutor.is_tutor_legal && <Badge>Tuteur légal</Badge>}
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
              {paymentsForm.map((payment, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">Échéance ID: {payment.installment_id}</span>
                    <span className="text-lg font-bold text-green-600">{payment.amount.toLocaleString()} FCFA</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    <p>Méthodes de paiement:</p>
                    <ul className="list-disc list-inside ml-4">
                      {payment.methods.map((method, methodIndex) => (
                        <li key={methodIndex}>
                          Méthode ID {method.id}: {Number.parseInt(method.montant).toLocaleString()} FCFA
                        </li>
                      ))}
                    </ul>
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
            <h3 className="text-lg font-semibold mb-4 text-blue-800">Documents fournis</h3>
            {documentsForm.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {documentsForm.map((doc, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium">{doc.label}</span>
                    <Badge variant="outline">Fourni</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 italic">Aucun document fourni</p>
            )}
          </div>

          <Separator />

          {/* Footer */}
          <div className="text-center text-sm text-gray-600">
            <p>Ce reçu confirme l'inscription de l'élève dans notre établissement.</p>
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
        <Button onClick={onNewRegistration}>Nouvelle inscription</Button>
      </div>
    </div>
  )
}
