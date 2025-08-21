"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useSchoolStore } from "@/store/index"
import { CheckCircle, AlertTriangle, Loader2, CreditCard, Calendar, Info, Hash, User, BookOpen, FileText, Shield } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import type { Installment, PaymentFormData } from "@/lib/interface"
import { useDocumentStorage } from "@/hooks/useDocumentStorage"
import { useRegistrationStore } from "@/hooks/use-registration-store"
import { fetchCorrespondenceBooks } from "@/lib/fonction"


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

interface Step5Props {
  onPrevious: () => void
  onComplete: () => void
}

export function Step5Confirmation({ onPrevious, onComplete }: Step5Props) {
  const [restoredPhotoFile, setRestoredPhotoFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [photoRestored, setPhotoRestored] = useState(false); // Flag pour éviter les restaurations multiples


  const {
    documentTypes,
    userOnline,
    cashRegisterSessionCurrent,
    methodPayment,
    classes,
    academicYears,
    pricing,
    installements,
  } = useSchoolStore()
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
            fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}${endpoint}/${id}`, { method: "DELETE" })
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
          await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/registration/${createdEntities.registration}`, { method: "DELETE" });
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

  const {
    studentData,
    selectedTutors,
    newTutors,
    registrationData,
    availablePricing,
    payments,
    documents,
    paidAmount,
    getFileFromPath,
    getFileSize,
    lastRestoreAttempt
  } = useRegistrationStore()
  const { restoreFilesFromIndexedDB } = useRegistrationStore();

  // Optimiser la restauration de la photo
  useEffect(() => {
    let isMounted = true; // Éviter les setState si le composant est démonté
    
    const restorePhoto = async () => {
      // Éviter les restaurations multiples
      if (photoRestored) return;
      
      try {
        if (studentData?.photo?.file) {
          if (isMounted) {
            setRestoredPhotoFile(studentData.photo.file);
            setPhotoRestored(true);
          }
        } else if (studentData?.photo?.stored && !photoRestored) {
          console.log("Attempting to restore photo from IndexedDB...");
          const file = await getFileFromPath(studentData.photo);
          
          if (file && isMounted) {
            setRestoredPhotoFile(file);
            setPhotoRestored(true);
            console.log("Photo successfully restored in Step5");
          }
        }
      } catch (error) {
        console.error("Error restoring photo in Step5:", error);
        if (isMounted) {
          setRestoredPhotoFile(null);
        }
      }
    };

    // Délai pour éviter les conflits avec d'autres restaurations
    const timeoutId = setTimeout(restorePhoto, 200);
    
    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [studentData?.photo, photoRestored, getFileFromPath]);

  // Réinitialiser le flag si les données changent
  useEffect(() => {
    setPhotoRestored(false);
  }, [studentData?.photo?.stored?.fileId]);

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState("")

  const handleConfirm = async () => {
    setIsSubmitting(true)
    setSubmitError("")

    // Restaurer d'abord les fichiers
    try {
      await restoreFilesFromIndexedDB();
    } catch (error) {
      console.error("Erreur lors de la restauration des fichiers:", error);
      setSubmitError("Erreur lors de la restauration des fichiers. Veuillez réessayer.");
      setIsSubmitting(false);
      return;
    }

    // Vérifier que la photo est présente
    if (studentData?.photo) {
      const photoFile = await getFileFromPath(studentData.photo);
      if (!photoFile) {
        console.error("Impossible de récupérer la photo de l'élève. Veuillez la réimporter.");
        return;
      }
    }

    const createdEntities = {
      student_id: null as number | null,
      tutors: [] as number[],
      payments: [] as number[],
      documents: [] as number[],
      registration: null as number | null,
    }

    try {
      // --- UTILS pour harmoniser PaymentFormData avant fetch ---
      const normalizePaymentFormData = (payment: any): PaymentFormData => ({
        student_id: payment.student_id?.toString?.() ?? '',
        installment_id: payment.installment_id?.toString?.() ?? '',
        cash_register_id: payment.cash_register_id?.toString?.() ?? '',
        cashier_id: payment.cashier_id?.toString?.() ?? '',
        amount: Number(payment.amount),
        transaction_id: payment.transaction_id?.toString?.() ?? '',
        methods: Array.isArray(payment.methods)
          ? payment.methods.map((m: { id: any; montant: any }) => ({
            id: Number(m.id),
            montant: m.montant !== undefined ? String(m.montant) : '0',
          }))
          : [],
      });
      // Step 1: Create student
      const studentFormData = new FormData()
      if (studentData) {
        studentFormData.append("assignment_type_id", studentData.assignment_type_id.toString())
        studentFormData.append("registration_number", studentData.registration_number)
        studentFormData.append("name", studentData.name)
        studentFormData.append("first_name", studentData.first_name)
        studentFormData.append("birth_date", studentData.birth_date)
        studentFormData.append("status", studentData.status)
        // if (photo) {
        //   console.log("Photo ajoutée:", photo.name)
        //   studentFormData.append("photo", photo)
        // }else{
        //   console.log("pas de photo" , photo )
        // }
        studentFormData.append("sexe", studentData.sexe)

        if (studentData.photo) {
          // console.log("[DEBUG] Passing to getFileFromPath:", studentData.photo);
          const photoFile = await getFileFromPath(studentData.photo);
          // console.log("[DEBUG] Result from getFileFromPath:", photoFile);
          if (photoFile) {
            studentFormData.append("photo", photoFile);
            // console.log("[DEBUG] Photo added to FormData:", photoFile.name, photoFile.size);
          }
        }
      }

      const studentResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/student`, {
        method: "POST",
        body: studentFormData,
      })

      if (!studentResponse.ok) {
        throw new Error("Erreur lors de la création de l'élève")
      }

      const createdStudent = await studentResponse.json()
      const studentId = createdStudent.id
      createdEntities.student_id = studentId

      // Step 2: Create new tutors if any
      const createdTutorIds: number[] = []
      for (const tutor of newTutors) {
        const tutorResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/tutor`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(tutor),
        })

        if (!tutorResponse.ok) {
          throw new Error("Erreur lors de la création d'un tuteur")
        }

        const createdTutor = await tutorResponse.json()
        createdTutorIds.push(createdTutor.id)
        createdEntities.tutors.push(createdTutor.id)
      }

      // Step 3: Assign tutors to student
      const allTutors = [
        ...selectedTutors.map((t) => ({ id: t.id, is_tutor_legal: t.is_tutor_legal })),
        ...newTutors.map((_, index) => ({
          id: createdTutorIds[index],
          is_tutor_legal: newTutors[index].is_tutor_legal,
        })),
      ]

      const assignTutorResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/student/assign-tutor`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          student_id: studentId.toString(),
          tutors: allTutors,
        }),
      })

      if (!assignTutorResponse.ok) {
        throw new Error("Erreur lors de l'assignation des tuteurs")
      }

      // Step 4: Create registration
      if (registrationData) {
        const registrationResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/registration`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...registrationData,
            student_id: studentId,
          }),
        })

        if (!registrationResponse.ok) {
          throw new Error("Erreur lors de l'inscription")
        }

        const registrationResult = await registrationResponse.json();
        createdEntities.registration = registrationResult.id;

      }

      for (const payment of payments) {
        const transactionResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/transaction`, {
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

        const paymentPayload = normalizePaymentFormData({
          ...payment,
          student_id: studentId.toString(),
          transaction_id: transaction.id.toString(),
        });

        const paymentRes = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/payment`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(paymentPayload),
        });

        const paymentData = await paymentRes.json();
        if (!paymentRes.ok) {
          throw new Error(`Erreur lors du paiement: ${paymentData.message}`);
        }
        createdEntities.payments.push(paymentData.id);
      }

      // Step 6: Upload documents (ne bloque pas la continuité si erreur)
      for (const doc of documents) {
        try {
          const docFormData = new FormData()
          docFormData.append("document_type_id", doc.document_type_id.toString())
          docFormData.append("student_id", studentId.toString())
          docFormData.append("label", doc.label)

          const file = await getFileFromPath(doc.path)

          if (file && file.size > 0) {
            docFormData.append("path", file)
            const docResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/document`, {
              method: "POST",
              body: docFormData,
            })

            if (!docResponse.ok) {
              let errorText
              try {
                const errorJson = await docResponse.json()
                errorText = JSON.stringify(errorJson)
              } catch (jsonError) {
                try {
                  errorText = await docResponse.text()
                  if (errorText.length > 500) {
                    errorText = errorText.substring(0, 500) + "... [texte tronqué]"
                  }
                } catch (textError) {
                  errorText = "Impossible de lire le corps de la réponse"
                }
              }
              // Log l'erreur mais ne bloque pas la suite
              console.error(`Document upload failed (${docResponse.status}):`, errorText)
              continue;
            }

            const createdDocument = await docResponse.json()
            createdEntities.documents.push(createdDocument.id)
          } else {
            console.error("Failed to get valid file for document:", doc.label, "File is null or empty")
            continue;
          }
        } catch (error) {
          console.error("Erreur lors de l'envoi du document:", error)
          // Ne bloque pas la continuité
          continue;
        }
      }
      
      // Step 7: Fetch correspondences books , creation du carnet de correspondance
      if (createdEntities.registration) {
        const correspondencesBooks = await fetchCorrespondenceBooks(createdEntities.registration)
        console.log("Correspondences books:", correspondencesBooks)
      }else{
        console.error("Registration ID is missing")
      }
      
      onComplete()
    } catch (error) {
      console.error("Erreur lors de l'inscription:", error)
      setSubmitError(error instanceof Error ? error.message : "Une erreur inattendue s'est produite")
      await rollbackCreatedEntities(createdEntities)
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const paymentsForm = payments.map(payment => ({
    ...payment,
    methods: payment.methods.map(method => ({
      ...method,
      montant: method.montant
    }))
  }))

  return (
    <TooltipProvider>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-6"
      >
        <Card className="border-0 shadow-lg bg-white/95 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 0.6 }}
              >
                <CheckCircle className="w-6 h-6 text-emerald-600" />
              </motion.div>
              <span className="text-2xl font-bold text-tyrian">Confirmation et récapitulatif</span>
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-8">
            {/* Student Information */}
            <motion.section
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              <div className="flex items-center space-x-2 mb-4">
                <User className="w-5 h-5 text-skyblue" />
                <h4 className="font-semibold text-lg text-tyrian">Informations de l'élève</h4>
              </div>

              {studentData && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-whitesmoke/50 rounded-lg">
                  {[
                    { label: "Nom", value: studentData.name, icon: <User className="w-4 h-4" /> },
                    { label: "Prénom", value: studentData.first_name },
                    { label: "Matricule", value: studentData.registration_number, icon: <Hash className="w-4 h-4" /> },
                    { label: "Date de naissance", value: new Date(studentData.birth_date).toLocaleDateString("fr-FR"), icon: <Calendar className="w-4 h-4" /> },
                    { label: "Sexe", value: studentData.sexe },
                    { label: "Statut", value: studentData.status, badge: true },
                    {
                      label: "Photo", value: restoredPhotoFile ? "Photo ajoutée" : "Aucune photo", badge: true
                    }
                  ].map((item, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      {item.icon && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="text-skyblue">{item.icon}</div>
                          </TooltipTrigger>
                          <TooltipContent>{item.label}</TooltipContent>
                        </Tooltip>
                      )}
                      <span className="text-gray-600">{item.label}:</span>
                      {item.badge ? (
                        <Badge variant="outline" className="bg-indigodye/10 text-indigodye">
                          {item.value}
                        </Badge>
                      ) : (
                        <span className="font-medium text-tyrian">{item.value}</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </motion.section>

            {restoredPhotoFile && (
              <div className="mt-4 flex flex-col items-center">
                <h4 className="text-sm font-medium mb-2">Photo de l'élève</h4>
                <div className="relative w-32 h-32 rounded-full overflow-hidden border-2 border-skyblue-200">
                  <Image
                    src={URL.createObjectURL(restoredPhotoFile)}
                    alt="Photo de l'élève"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            )}

            <Separator className="bg-gray-200" />

            {/* Tutors Information */}
            <motion.section
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-center space-x-2 mb-4">
                <Shield className="w-5 h-5 text-bittersweet" />
                <h4 className="font-semibold text-lg text-tyrian">Tuteurs</h4>
              </div>

              <div className="space-y-3">
                <AnimatePresence>
                  {[...selectedTutors, ...newTutors].map((tutor, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`p-4 rounded-lg ${index >= selectedTutors.length ? 'bg-blue-50' : 'bg-gray-50'} border border-gray-200`}
                    >
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <div className="flex items-center space-x-2">
                            <User className="w-4 h-4 text-gray-500" />
                            <span className="font-medium">{tutor.name} {tutor.first_name}</span>
                            {index >= selectedTutors.length && (
                              <Badge color="skyblue" className="ml-2">Nouveau</Badge>
                            )}
                          </div>
                          <div className="text-sm text-gray-600 ml-6">{tutor.type_tutor}</div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Info className="w-4 h-4 text-gray-500" />
                          <span className="text-sm">{tutor.phone_number}</span>
                        </div>

                        <div className="flex justify-end">
                          {tutor.is_tutor_legal && (
                            <Badge className="bg-indigodye text-white">
                              Tuteur légal
                            </Badge>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </motion.section>

            <Separator className="bg-gray-200" />

            {/* Registration Information */}
            {registrationData && (
              <motion.section
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <div className="flex items-center space-x-2 mb-4">
                  <BookOpen className="w-5 h-5 text-indigodye" />
                  <h4 className="font-semibold text-lg text-tyrian">Informations scolaires</h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-whitesmoke/50 rounded-lg">
                  {[
                    {
                      label: "Classe",
                      value: classes.find(c => c.id === registrationData.class_id)?.label || `ID ${registrationData.class_id}`,
                      icon: <BookOpen className="w-4 h-4" />
                    },
                    {
                      label: "Année académique",
                      value: academicYears.find(a => a.id === registrationData.academic_year_id)?.label || `ID ${registrationData.academic_year_id}`,
                      icon: <Calendar className="w-4 h-4" />
                    },
                    {
                      label: "Date d'inscription",
                      value: new Date(registrationData.registration_date).toLocaleDateString("fr-FR"),
                      icon: <Calendar className="w-4 h-4" />
                    }
                  ].map((item, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="text-indigodye">{item.icon}</div>
                        </TooltipTrigger>
                        <TooltipContent>{item.label}</TooltipContent>
                      </Tooltip>
                      <span className="text-gray-600">{item.label}:</span>
                      <span className="font-medium text-tyrian">{item.value}</span>
                    </div>
                  ))}
                </div>
              </motion.section>
            )}

            <Separator className="bg-gray-200" />

            {/* Payment Information */}
            <motion.section
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <div className="flex items-center space-x-2 mb-4">
                <CreditCard className="w-5 h-5 text-emerald-600" />
                <h4 className="font-semibold text-lg text-tyrian">Paiements</h4>
              </div>

              <div className="space-y-4">
                <AnimatePresence>
                  {paymentsForm.map((payment, index) => {
                    const installment = installements.find(i => i && String(i.id) === String(payment.installment_id))
                    const feeType = pricing.find(p => p?.installments?.some(i => Number(i.id) === Number(payment.installment_id)))?.fee_type?.label

                    const formatDate = (dateString: string | number | Date) => {
                      if (!dateString) return 'Date non définie'
                      return new Date(dateString).toLocaleDateString('fr-FR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric'
                      })
                    }

                    return (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                        className="p-5 border border-gray-200 rounded-xl bg-white shadow-sm hover:shadow-md transition-all"
                      >
                        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-4">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <h4 className="font-semibold text-lg text-tyrian">
                                {feeType || `Échéance ID: ${payment.installment_id}`}
                              </h4>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Info className="w-4 h-4 text-gray-400 hover:text-indigodye" />
                                </TooltipTrigger>
                                <TooltipContent className="max-w-[300px]">
                                  <p>Détails du paiement pour {feeType || 'ce type de frais'}</p>
                                  {installment?.due_date && (
                                    <p>Échéance: {formatDate(new Date(installment.due_date))}</p>
                                  )}
                                </TooltipContent>
                              </Tooltip>
                            </div>

                            {installment?.due_date && (
                              <div className="flex items-center space-x-2 text-sm text-gray-600 mt-1">
                                <Calendar className="w-4 h-4" />
                                <span>Échéance: {formatDate(new Date(installment.due_date))}</span>
                              </div>
                            )}
                          </div>

                          <div className="text-right">
                            <div className="text-2xl font-bold text-skyblue">
                              {payment.amount.toLocaleString()} FCFA
                            </div>
                            <div className="text-sm text-gray-500">
                              Montant total
                            </div>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                            <CreditCard className="w-4 h-4" />
                            <span>Méthodes de paiement ({payment.methods.length})</span>
                          </div>

                          <div className="grid gap-2">
                            {payment.methods.map((method, methodIndex) => {
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
                      </motion.div>
                    )
                  })}
                </AnimatePresence>

                <motion.div
                  whileHover={{ scale: 1.01 }}
                  className="p-4 bg-emerald-50 rounded-lg border border-emerald-200 mt-4"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-emerald-800">Total versé</span>
                    <span className="text-xl font-bold text-emerald-600">
                      {paidAmount.toLocaleString()} FCFA
                    </span>
                  </div>
                </motion.div>
              </div>
            </motion.section>

            <Separator className="bg-gray-200" />

            {/* Photo Preview
            {photo && (
              <motion.section
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.45 }}
                className="mb-6"
              >
                <div className="flex items-center space-x-2 mb-4">
                  <User className="w-5 h-5 text-bittersweet" />
                  <h4 className="font-semibold text-lg text-tyrian">
                    Photo de l'élève
                  </h4>
                </div>
                <div className="flex items-center justify-center">
                  <img
                    src={URL.createObjectURL(photo)}
                    alt="Prévisualisation photo"
                    className="rounded-lg shadow-md max-h-48"
                  />
                </div>
              </motion.section>
            )} */}

            {/* Documents Information */}
            <motion.section
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <div className="flex items-center space-x-2 mb-4">
                <FileText className="w-5 h-5 text-bittersweet" />
                <h4 className="font-semibold text-lg text-tyrian">
                  Documents et pièces justificatives
                  <span className="ml-2 text-gray-500">({documents.length})</span>
                </h4>
              </div>

              {documents.length > 0 ? (
                <div className="space-y-2">
                  <AnimatePresence>
                    {documents.map((doc, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex justify-between items-center p-3 bg-whitesmoke rounded-lg hover:bg-gray-100"
                      >
                        <div className="flex items-center space-x-3">
                          <FileText className="w-4 h-4 text-indigodye" />
                          <span className="truncate max-w-xs">{doc.label}</span>
                        </div>
                        <div className="flex space-x-2">
                          <span className="text-sm text-gray-500">
                            {formatFileSize(getFileSize(doc.path))}
                          </span>
                          {/* {doc.path?.stored?.isRestored && (
                            <Badge variant="outline" className="text-xs">
                              Restauré automatiquement
                            </Badge>
                          )} */}
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-6 text-gray-400 border-2 border-dashed rounded-lg"
                >
                  <FileText className="w-10 h-10 mx-auto mb-2" />
                  <p>Aucun document ajouté</p>
                </motion.div>
              )}
            </motion.section>

            {submitError && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Alert color="destructive" className="border-bittersweet/20 bg-bittersweet/10">
                  <AlertTriangle className="h-4 w-4 text-bittersweet" />
                  <AlertDescription color="destructive" className="text-bittersweet">
                    {submitError}
                  </AlertDescription>
                </Alert>
              </motion.div>
            )}
          </CardContent>
        </Card>

        <motion.div
          className="flex justify-between pt-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <Button
            variant="outline"
            onClick={onPrevious}
            disabled={isSubmitting}

          >
            Précédent
          </Button>

          <Button
            onClick={handleConfirm}
            disabled={isSubmitting}
            color="indigodye"

          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Inscription en cours...
              </>
            ) : (
              "Confirmer l'inscription"
            )}
          </Button>
        </motion.div>
      </motion.div>
    </TooltipProvider>
  )
}