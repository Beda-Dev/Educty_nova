"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useReinscriptionStore } from "@/hooks/use-reinscription-store"
import { CheckCircle, AlertTriangle, Loader2 } from "lucide-react"
import { useSchoolStore } from "@/store/index"

interface Step5Props {
  onPrevious: () => void
  onComplete: () => void
}

const padTo2Digits = (num: number): string => num.toString().padStart(2, '0')

const formatDate = (date: Date): string => (
  [
    date.getFullYear(),
    padTo2Digits(date.getMonth() + 1),
    padTo2Digits(date.getDate()),
  ].join('-') +
  ' ' +
  [
    padTo2Digits(date.getHours()),
    padTo2Digits(date.getMinutes()),
    padTo2Digits(date.getSeconds()),
  ].join(':')
)


export function Step5Confirmation({ onPrevious, onComplete }: Step5Props) {
  const {
    selectedStudent,
    studentModifications,
    existingTutors,
    newTutors,
    registrationData,
    availablePricing,
    payments,
    newDocuments,
    paidAmount,
    setCreatedEntities,
    getFileFromPath,
    getFileSize,
  } = useReinscriptionStore()

  const { userOnline, cashRegisterSessionCurrent } = useSchoolStore()

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState("")
  const transactionIds: number[] = []

  const rollbackCreatedEntities = async (createdEntities: any) => {
    const results: Record<string, any> = {};
    try {
      // Helper pour suppression parallèle et rapport
      const deleteEntities = async (label: string, ids: any[], endpoint: string) => {
        if (!Array.isArray(ids) || ids.length === 0) return;
        const uniqueIds = Array.from(new Set(ids));
        const res = await Promise.allSettled(
          uniqueIds.map(id =>
            fetch(`${endpoint}?id=${id}`, { method: "DELETE" })
          )
        );
        results[label] = res.map((r, i) => ({
          id: uniqueIds[i],
          status: r.status,
          reason: r.status === "rejected" ? r.reason : undefined
        }));
      };

      await deleteEntities("payments", createdEntities.payments, "/api/payment");
      if (typeof transactionIds !== "undefined" && transactionIds.length > 0) {
        await deleteEntities("transactions", transactionIds, "/api/transaction");
      }
      await deleteEntities("documents", createdEntities.documents, "/api/document");
      await deleteEntities("tutors", createdEntities.tutors, "/api/tutor");

      if (createdEntities.registration) {
        try {
          await fetch(`/api/registration?id=${createdEntities.registration}`, { method: "DELETE" });
          results.registration = { id: createdEntities.registration, status: "fulfilled" };
        } catch (err) {
          results.registration = { id: createdEntities.registration, status: "rejected", reason: err };
        }
      }
    } catch (error) {
      console.error("Erreur lors du rollback:", error);
      results.globalError = error;
    }
    return results;
  }

  const handleConfirm = async () => {
    if (!selectedStudent) return

    setIsSubmitting(true)
    setSubmitError("")

    const createdEntities = {
      tutors: [] as number[],
      payments: [] as number[],
      documents: [] as number[],
      registration: null as number | null,
    }

    try {
      // Step 1: Update student if there are modifications
      if (studentModifications && Object.keys(studentModifications).length > 0) {
        const studentFormData = new FormData()

        for (const [key, value] of Object.entries(studentModifications)) {
          if (value !== null && value !== undefined) {
            if (key === "photo" && value && typeof value === "object" && ("file" in value || "stored" in value)) {
  // Get the actual File object from IndexedDB
  const file = await getFileFromPath(value as any)
  if (file) {
    studentFormData.append(key, file)
    console.log("Photo added to FormData:", file.name, file.size)
  } else {
    setSubmitError("Impossible de retrouver la photo de l'élève. Merci de la réimporter avant de confirmer la réinscription.");
    setIsSubmitting(false);
    return;
  }
} else {
              studentFormData.append(key, value.toString())
            }
          }
        }

        const studentResponse = await fetch(`/api/students?id=${selectedStudent.id}`, {
          method: "PUT",
          body: studentFormData,
        })

        if (!studentResponse.ok) {
          throw new Error("Erreur lors de la modification de l'élève")
        }
      }

      // Step 2: Create new tutors
      for (const tutor of newTutors) {
        const tutorResponse = await fetch("/api/tutor", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(tutor),
        })

        if (!tutorResponse.ok) {
          throw new Error("Erreur lors de la création d'un tuteur")
        }

        const createdTutor = await tutorResponse.json()
        createdEntities.tutors.push(createdTutor.id)
      }

      // Step 3: Update existing tutors
      for (const tutor of existingTutors.filter((t) => t.isModified)) {
        const { isModified, ...tutorData } = tutor
        const tutorResponse = await fetch(`/api/tutor?id=${tutor.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(tutorData),
        })

        if (!tutorResponse.ok) {
          throw new Error("Erreur lors de la modification d'un tuteur")
        }
      }

      // Step 4: Assign tutors to student
      const allTutors = [
        ...existingTutors.map((t) => ({ id: t.id, is_tutor_legal: t.is_tutor_legal })),
        ...newTutors.map((_, index) => ({
          id: createdEntities.tutors[index],
          is_tutor_legal: newTutors[index].is_tutor_legal,
        })),
      ]

      const assignTutorResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/student/assign-tutor`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          student_id: selectedStudent.id.toString(),
          tutors: allTutors,
        }),
      })

      if (!assignTutorResponse.ok) {
        throw new Error("Erreur lors de l'assignation des tuteurs")
      }

      // Step 5: Create registration
      if (registrationData) {
        const registrationResponse = await fetch("/api/registration", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...registrationData,
            student_id: selectedStudent.id,
          }),
        })

        if (!registrationResponse.ok) {
          throw new Error("Erreur lors de la réinscription")
        }

        const createdRegistration = await registrationResponse.json()
        createdEntities.registration = createdRegistration.id
      }

      // Step 6: Create payments
      for (const payment of payments) {
        const transactionResponse = await fetch("/api/transaction", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id: userOnline?.id,
            cash_register_session_id: cashRegisterSessionCurrent?.id,
            transaction_date: formatDate(new Date()),
            total_amount: payment.amount,
            transaction_type: "encaissement",
          }),
        })

        const transaction = await transactionResponse.json()

        if (!transactionResponse.ok) {
          throw new Error(`Erreur lors de la transaction: ${transaction.message}`)
        }
        transactionIds.push(transaction.id)

        const paymentResponse = await fetch("/api/payment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...payment,
            student_id: selectedStudent.id.toString(),
            transaction_id: transaction.id.toString(),
          }),
        })

        if (!paymentResponse.ok) {
          throw new Error("Erreur lors du paiement")
        }

        const createdPayment = await paymentResponse.json()
        createdEntities.payments.push(createdPayment.id)
      }

      // Step 7: Upload new documents
      for (const doc of newDocuments) {
        console.log("Processing document:", doc.label)

        const docFormData = new FormData()
        docFormData.append("document_type_id", doc.document_type_id.toString())
        docFormData.append("student_id", selectedStudent.id.toString())
        docFormData.append("label", doc.label)

        // Get the actual File object from IndexedDB
        const file = await getFileFromPath(doc.path)
        // console.log("Photo file retrieved", file ? `${file.name} (${file.size} bytes)` : "null")

        if (file && file.size > 0) {
          docFormData.append("path", file)
          console.log("FormData prepared with file:", file.name)

          try {
            const docResponse = await fetch("/api/document", {
              method: "POST",
              body: docFormData,
            })

            // Vérifier si la réponse est OK
            if (!docResponse.ok) {
              // Essayer de lire le corps de la réponse pour plus d'informations
              let errorText
              try {
                // Essayer de lire comme JSON d'abord
                const errorJson = await docResponse.json()
                errorText = JSON.stringify(errorJson)
              } catch (jsonError) {
                // Si ce n'est pas du JSON, lire comme texte
                try {
                  errorText = await docResponse.text()
                  // Limiter la taille du texte d'erreur pour éviter de surcharger la console
                  if (errorText.length > 500) {
                    errorText = errorText.substring(0, 500) + "... [texte tronqué]"
                  }
                } catch (textError) {
                  errorText = "Impossible de lire le corps de la réponse"
                }
              }

              console.error(`Document upload failed (${docResponse.status}):`, errorText)
              throw new Error(
                `Erreur lors du téléchargement du document "${doc.label}" (${docResponse.status}): ${errorText}`,
              )
            }

            // Essayer de lire la réponse JSON avec gestion d'erreur
            let createdDocument
            try {
              createdDocument = await docResponse.json()
            } catch (jsonError) {
              console.error("Failed to parse JSON response:", jsonError)
              throw new Error(`Erreur lors de la lecture de la réponse du serveur pour "${doc.label}"`)
            }

            createdEntities.documents.push(createdDocument.id)
            console.log("Document uploaded successfully:", createdDocument.id)
          } catch (error) {
            console.error("Error during document upload:", error)
            throw error // Rethrow to be caught by the outer try/catch
          }
        } else {
          console.error("Failed to get valid file for document:", doc.label, "File is null or empty")
          throw new Error(`Impossible de récupérer un fichier valide pour le document "${doc.label}"`)
        }
      }

      setCreatedEntities(createdEntities)
      onComplete()
    } catch (error) {
      console.error("Erreur lors de la réinscription:", error)
      setSubmitError(error instanceof Error ? error.message : "Une erreur inattendue s'est produite")

      // Rollback created entities
      await rollbackCreatedEntities(createdEntities)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span>Confirmation et récapitulatif de la réinscription</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Student Information */}
          {selectedStudent && (
            <div>
              <h4 className="font-semibold mb-3">Informations de l'élève</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Nom:</span>
                  <span className="ml-2 font-medium">{selectedStudent.name}</span>
                  {studentModifications?.name && (
                    <span className="ml-2 text-blue-600">→ {studentModifications.name}</span>
                  )}
                </div>
                <div>
                  <span className="text-gray-600">Prénom:</span>
                  <span className="ml-2 font-medium">{selectedStudent.first_name}</span>
                  {studentModifications?.first_name && (
                    <span className="ml-2 text-blue-600">→ {studentModifications.first_name}</span>
                  )}
                </div>
                <div>
                  <span className="text-gray-600">Matricule:</span>
                  <span className="ml-2 font-medium">{selectedStudent.registration_number}</span>
                  {studentModifications?.registration_number && (
                    <span className="ml-2 text-blue-600">→ {studentModifications.registration_number}</span>
                  )}
                </div>
                <div>
                  <span className="text-gray-600">Date de naissance:</span>
                  <span className="ml-2 font-medium">
                    {new Date(selectedStudent.birth_date).toLocaleDateString("fr-FR")}
                  </span>
                  {studentModifications?.birth_date && (
                    <span className="ml-2 text-blue-600">
                      → {new Date(studentModifications.birth_date).toLocaleDateString("fr-FR")}
                    </span>
                  )}
                </div>
                <div>
                  <span className="text-gray-600">Sexe:</span>
                  <span className="ml-2 font-medium">{selectedStudent.sexe}</span>
                  {studentModifications?.sexe && (
                    <span className="ml-2 text-blue-600">→ {studentModifications.sexe}</span>
                  )}
                </div>
                <div>
                  <span className="text-gray-600">Statut:</span>
                  <Badge color="skyblue">{selectedStudent.status}</Badge>
                  {studentModifications?.status && (
                    <Badge variant="outline" className="ml-2">
                      → {studentModifications.status}
                    </Badge>
                  )}
                </div>
                {studentModifications?.photo && (
                  <div className="md:col-span-2">
                    <span className="text-gray-600">Photo:</span>
                    {/* <Badge variant="outline" className="ml-2">
                      Nouvelle photo ajoutée
                      {studentModifications.photo.stored?.isRestored && " (restaurée automatiquement)"}
                    </Badge> */}
                  </div>
                )}
              </div>
            </div>
          )}

          <Separator />

          {/* Tutors Information */}
          <div>
            <h4 className="font-semibold mb-3">Tuteurs</h4>
            <div className="space-y-2">
              {existingTutors.map((tutor) => (
                <div key={tutor.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span>
                    {tutor.name} {tutor.first_name} - {tutor.phone_number}
                  </span>
                  <div className="flex space-x-2">
                    {tutor.is_tutor_legal && <Badge>Tuteur légal</Badge>}
                    {tutor.isModified && <Badge variant="outline">Modifié</Badge>}
                  </div>
                </div>
              ))}
              {newTutors.map((tutor, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-blue-50 rounded">
                  <span>
                    {tutor.name} {tutor.first_name} - {tutor.phone_number}
                  </span>
                  <div className="flex space-x-2">
                    <Badge variant="outline">Nouveau</Badge>
                    {tutor.is_tutor_legal && <Badge>Tuteur légal</Badge>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Registration Information */}
          {registrationData && (
            <div>
              <h4 className="font-semibold mb-3">Informations de réinscription</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Nouvelle classe:</span>
                  <span className="ml-2 font-medium">ID {registrationData.class_id}</span>
                </div>
                <div>
                  <span className="text-gray-600">Année académique:</span>
                  <span className="ml-2 font-medium">ID {registrationData.academic_year_id}</span>
                </div>
                <div>
                  <span className="text-gray-600">Date de réinscription:</span>
                  <span className="ml-2 font-medium">
                    {new Date(registrationData.registration_date).toLocaleDateString("fr-FR")}
                  </span>
                </div>
              </div>
            </div>
          )}

          <Separator />

          {/* Payment Information */}
          <div>
            <h4 className="font-semibold mb-3">Paiements</h4>
            <div className="space-y-2">
              {payments.map((payment, index) => (
                <div key={index} className="p-3 border rounded">
                  <div className="flex justify-between items-center mb-2">
                    <span>Échéance ID: {payment.installment_id}</span>
                    <span className="font-medium">{payment.amount.toLocaleString()} FCFA</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    Méthodes: {payment.methods.map((m) => `${m.montant} FCFA`).join(", ")}
                  </div>
                </div>
              ))}
              <div className="bg-green-50 p-3 rounded">
                <span className="font-semibold">Total versé: {paidAmount.toLocaleString()} FCFA</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Documents Information */}
          <div>
            <h4 className="font-semibold mb-3">Documents ({newDocuments.length} nouveaux)</h4>
            {newDocuments.length > 0 ? (
              <div className="space-y-2">
                {newDocuments.map((doc, index) => (
                  <div key={index} className="flex justify-between items-center p-2 bg-blue-50 rounded">
                    <span>{doc.label}</span>
                    <div className="flex space-x-2">
                      <span className="text-sm text-gray-500">{getFileSize(doc.path)} bytes</span>
                      <Badge variant="outline">
                        Nouveau{doc.path.stored?.isRestored && " (restauré automatiquement)"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">Aucun nouveau document ajouté</p>
            )}
          </div>

          {submitError && (
            <Alert color="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{submitError}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onPrevious} disabled={isSubmitting}>
          Précédent
        </Button>
        <Button onClick={handleConfirm} disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Réinscription en cours...
            </>
          ) : (
            "Confirmer la réinscription"
          )}
        </Button>
      </div>
    </div>
  )
}
