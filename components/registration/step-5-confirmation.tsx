"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useSchoolStore } from "@/store/index"
import { CheckCircle, AlertTriangle, Loader2, CreditCard, Calendar, Info, Hash, User, BookOpen, FileText, Shield } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import type { Installment } from "@/lib/interface"
import { useDocumentStorage } from "@/hooks/useDocumentStorage"

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
  const {
    studentData,
    selectedTutors,
    newTutors,
    registrationData,
    paidAmount,
    documentTypes,
    paymentsForm,
    userOnline,
    cashRegisterSessionCurrent,
    methodPayment,
    classes,
    academicYears,
    pricing,
    installements,
    documentsForm,
  } = useSchoolStore()

  const { documents, addDocument, removeDocument, clearDocuments } = useDocumentStorage()

  // Synchroniser avec le store
  useEffect(() => {
    if (documents) {
      documents.forEach(doc => {
        addDocument({
          label: doc.label,
          path: doc.path
        });
      });
    }
  }, [documents, addDocument]);

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState("")

  const handleConfirm = async () => {
    setIsSubmitting(true)
    setSubmitError("")

    try {
      // Step 1: Create student
      const studentFormData = new FormData()
      if (studentData) {
        studentFormData.append("assignment_type_id", studentData.assignment_type_id.toString())
        studentFormData.append("registration_number", studentData.registration_number)
        studentFormData.append("name", studentData.name)
        studentFormData.append("first_name", studentData.first_name)
        studentFormData.append("birth_date", studentData.birth_date)
        studentFormData.append("status", studentData.status)
        studentFormData.append("sexe", studentData.sexe)

        if (studentData.photo) {
          // Si c'est une URL base64, la convertir en File
          if (typeof studentData.photo === 'string' && (studentData.photo as string).startsWith('data:')) {
            const blob = await (await fetch(studentData.photo)).blob();
            const file = new File([blob], 'photo.jpg', { type: 'image/jpeg' });
            studentFormData.append("photo", file);
          } else if (studentData.photo instanceof File) {
            studentFormData.append("photo", studentData.photo as File);
          } else {
            console.error('Type de photo non supporté');
          }
        }
      }

      const studentResponse = await fetch("/api/students", {
        method: "POST",
        body: studentFormData,
      })

      if (!studentResponse.ok) {
        throw new Error("Erreur lors de la création de l'élève")
      }

      const createdStudent = await studentResponse.json()
      const studentId = createdStudent.id

      // Step 2: Create new tutors if any
      const createdTutorIds: number[] = []
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
        createdTutorIds.push(createdTutor.id)
      }

      // Step 3: Assign tutors to student
      const allTutors = [
        ...selectedTutors.map((t) => ({ id: t.id, is_tutor_legal: t.is_tutor_legal })),
        ...newTutors.map((_, index) => ({
          id: createdTutorIds[index],
          is_tutor_legal: newTutors[index].is_tutor_legal,
        })),
      ]

      const assignTutorResponse = await fetch("https://educty.digifaz.com/api/student/assign-tutor", {
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
        const registrationResponse = await fetch("/api/registration", {
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
      }

      // Step 5: Create payments
      for (const payment of paymentsForm) {

        const transactionResponse = await fetch("/api/transaction", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id: userOnline?.id,
            cash_register_session_id: cashRegisterSessionCurrent?.id,
            transaction_date: formatDate(new Date()), // Use formatted date
            total_amount: payment.amount,
            transaction_type: "encaissement",
          }),
        })

        const transaction = await transactionResponse.json()

        if (!transactionResponse.ok) {
          throw new Error(`Erreur lors de la transaction: ${transaction.message}`)
        }

        const paymentResponse = await fetch("/api/payment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...payment,
            student_id: studentId.toString(),
            transaction_id: transaction.id.toString(),
          }),
        })

        const paymentresponse = await paymentResponse.json()

        if (!paymentResponse.ok) {
          throw new Error(`Erreur lors du paiement: ${paymentresponse.message}`)
        }
      }

      // Step 6: Upload documents
      for (const doc of documentsForm) {
        const docFormData = new FormData()
        docFormData.append("document_type_id", doc.document_type_id.toString())
        docFormData.append("student_id", studentId.toString())
        docFormData.append("label", doc.label)
        docFormData.append("path", doc.path)

        const docResponse = await fetch("/api/document", {
          method: "POST",
          body: docFormData,
        })

        const docresponse = await docResponse.json()

        if (!docResponse.ok) {
          throw new Error(`Erreur lors du téléchargement des documents: ${docresponse.message}`)
        }
      }

      onComplete()
    } catch (error) {
      console.error("Erreur lors de l'inscription:", error)
      setSubmitError(error instanceof Error ? error.message : "Une erreur inattendue s'est produite")
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
                    { label: "Statut", value: studentData.status, badge: true }
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
                      key={ index}
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
                      value: classes.find(c => c.id === registrationData.class_id)?.label,
                      icon: <BookOpen className="w-4 h-4" />
                    },
                    { 
                      label: "Année académique", 
                      value: academicYears.find(a => a.id === registrationData.academic_year_id)?.label,
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
                                {feeType || 'Type de frais non défini'}
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
                  <span className="ml-2 text-gray-500">({documentsForm.length})</span>
                </h4>
              </div>

              {documentsForm.length > 0 ? (
                <div className="space-y-2">
                  <AnimatePresence>
                    {documentsForm.map((doc, index) => (
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
                        <span className="text-sm text-gray-500">
                          {formatFileSize(documents[index]?.path.size || 0)}
                        </span>
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
                  <AlertDescription className="text-bittersweet">
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
            className="border-indigodye/30 text-indigodye hover:bg-indigodye/10 hover:text-indigodye"
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