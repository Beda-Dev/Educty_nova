"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { toast } from "react-hot-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useReinscriptionStore } from "@/hooks/use-reinscription-store"
import type { DocumentFormData, DocumentType } from "@/lib/interface"
import { X, Upload, FileText, Info, AlertTriangle, RefreshCw } from "lucide-react"
import { fileStorage } from "@/lib/indexeddb-storage"
import { useSchoolStore } from "@/store/index"


interface Step4Props {
  onNext: () => void
  onPrevious: () => void
}

export function Step4Documents({ onNext, onPrevious }: Step4Props) {
  const {
    selectedStudent,
    existingDocuments,
    newDocuments,
    setExistingDocuments,
    addNewDocument,
    removeNewDocument,
    getFileFromPath,
    getFileSize,
  } = useReinscriptionStore()

  const { methodPayment , academicYearCurrent , documentTypes } = useSchoolStore()

  const [selectedDocType, setSelectedDocType] = useState<number>(0)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [fileError, setFileError] = useState("")
  const [dbStatus, setDbStatus] = useState<string>("Vérification de la base de données...")

  useEffect(() => {
    if (selectedStudent?.documents) {
      setExistingDocuments(selectedStudent.documents)
    }

    // Vérifier l'état d'IndexedDB
    checkIndexedDBStatus()
  }, [selectedStudent, setExistingDocuments])

  const checkIndexedDBStatus = async () => {
    try {
      if (!fileStorage) {
        setDbStatus("Stockage local non disponible sur ce navigateur ou en SSR")
        return
      }
      await fileStorage.init()
      const files = await fileStorage.getAllFiles()
      setDbStatus(`IndexedDB prêt - ${files.length} fichiers stockés`)
    } catch (error) {
      console.error("Error checking IndexedDB status:", error)
      setDbStatus("Erreur d'accès à IndexedDB")
    }
  }

  // Améliorons la validation des fichiers
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!fileStorage) {
      setFileError("Stockage local non disponible sur ce navigateur ou en SSR")
      toast.error("Stockage local non disponible sur ce navigateur ou en SSR")
      return
    }
    const file = e.target.files?.[0]
    setFileError("")

    if (!file) {
      setSelectedFile(null)
      return
    }

    console.log("File selected:", file.name, file.size, file.type)

    // Validate file
    if (file.size === 0) {
      setFileError("Le fichier est vide")
      setSelectedFile(null)
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setFileError("Le fichier ne doit pas dépasser 5 Mo")
      setSelectedFile(null)
      return
    }

    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
      "image/jpeg",
      "image/jpg",
      "image/gif",
      "image/svg+xml",
    ]

    if (!allowedTypes.includes(file.type)) {
      setFileError(`Format de fichier non supporté: ${file.type}. Utilisez PDF, DOC, DOCX, TXT, JPEG, GIF ou SVG`)
      setSelectedFile(null)
      return
    }

    setSelectedFile(file)
  }

  const handleAddDocument = async () => {
    if (!selectedDocType || !selectedFile) {
      toast.error("Veuillez sélectionner un type de document et un fichier")
      return
    }

    if (fileError) {
      toast.error("Veuillez corriger l'erreur de fichier avant de continuer")
      return
    }

    if (!fileStorage) {
      setFileError("Stockage local non disponible sur ce navigateur ou en SSR")
      toast.error("Stockage local non disponible sur ce navigateur ou en SSR")
      return
    }

    const docType = documentTypes.find((dt) => dt.id === selectedDocType)
    if (!docType) return

    try {
      console.log("Adding document:", selectedFile.name, selectedFile.size, selectedFile.type)

      // Vérifier à nouveau que le fichier est valide
      if (selectedFile.size === 0) {
        throw new Error("Le fichier est vide")
      }

      const newDocument: DocumentFormData = {
        document_type_id: selectedDocType,
        student_id: selectedStudent?.id ?? 0,
        label: selectedFile.name,
        path: selectedFile, // Store as native File object
      }

      await addNewDocument(newDocument)
      setSelectedDocType(0)
      setSelectedFile(null)
      setFileError("")

      // Reset file input
      const fileInput = document.getElementById("document-file") as HTMLInputElement
      if (fileInput) fileInput.value = ""

      // Mettre à jour le statut d'IndexedDB
      checkIndexedDBStatus()
    } catch (error) {
      console.error("Error adding document:", error)
      setFileError(`Erreur lors de l'ajout du document: ${error instanceof Error ? error.message : "Erreur inconnue"}`)
    }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const getDocumentTypeName = (id: number): string => {
    const docType = documentTypes.find((dt) => dt.id === id)
    return docType?.name || "Type inconnu"
  }

  const hasRestoredDocuments = newDocuments.some((doc) => doc.path.stored?.isRestored)

  return (
    <div className="space-y-6">
      {/* Information Card */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="pt-6">
          <div className="flex items-start space-x-3">
            <Info className="w-5 h-5 text-blue-600 mt-0.5" />
            <div className="space-y-2">
              <h4 className="font-medium text-blue-900">Gestion des documents</h4>
              <div className="text-sm text-blue-800 space-y-1">
                <p>• Les documents existants sont conservés automatiquement</p>
                <p>• Ajoutez uniquement les nouveaux documents ou mises à jour</p>
                <p>• Taille maximale par fichier: 5 Mo</p>
                <p>• Formats acceptés: PDF, JPG, PNG, DOC, DOCX</p>
                <p>• Les fichiers sont sauvegardés dans IndexedDB en cas de rechargement</p>
                <p className="font-medium">• État de la base de données: {dbStatus}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* {hasRestoredDocuments && (
        <Alert>
          <RefreshCw className="h-4 w-4" />
          <AlertDescription>
            Certains documents ont été restaurés. Ils sont prêts à être utilisés.
          </AlertDescription>
        </Alert>
      )} */}

      <Card>
        <CardHeader>
          <CardTitle>Documents existants</CardTitle>
        </CardHeader>
        <CardContent>
          {existingDocuments.length > 0 ? (
            <div className="space-y-3">
              {existingDocuments.map((doc, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <FileText className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="font-medium">{doc.label}</p>
                      <p className="text-sm text-gray-600">{doc.document_type?.name}</p>
                    </div>
                  </div>
                  <Badge variant="outline">Existant</Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">Aucun document existant</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Ajouter de nouveaux documents</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Type de document</Label>
                <Select
                  value={selectedDocType.toString()}
                  onValueChange={(value) => setSelectedDocType(Number.parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner le type" />
                  </SelectTrigger>
                  <SelectContent>
                    {documentTypes.map((docType) => (
                      <SelectItem key={docType.id} value={docType.id.toString()}>
                        {docType.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="document-file">Fichier (max 5 Mo)</Label>
                <Input
                  id="document-file"
                  type="file"
                  onChange={handleFileSelect}
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                />
              </div>
            </div>

            {fileError && (
              <Alert color="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{fileError}</AlertDescription>
              </Alert>
            )}

            {selectedFile && !fileError && (
              <div className="p-3 bg-gray-50 rounded-md">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{selectedFile.name}</p>
                    <p className="text-sm text-gray-500">{formatFileSize(selectedFile.size)}</p>
                  </div>
                  <Button color="indigodye" onClick={handleAddDocument} size="sm">
                    <Upload className="w-4 h-4 mr-2" />
                    Cliquez pour ajouter
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* New Documents List */}
          {newDocuments.length > 0 && (
            <div className="space-y-4">
              <Label>Nouveaux documents ajoutés</Label>
              <div className="space-y-3">
                {newDocuments.map((doc, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-md">
                    <div className="flex items-center space-x-3">
                      <Badge color="skyblue">{getDocumentTypeName(doc.document_type_id)}</Badge>
                      <div>
                        <p className="font-medium">{doc.label}</p>
                        <p className="text-sm text-gray-500">{formatFileSize(getFileSize(doc.path))}</p>
                        {/* {doc.path.stored?.isRestored && (
                          <p className="text-xs text-blue-600">Restauré depuis IndexedDB</p>
                        )} */}
                        {doc.path.stored?.fileId && (
                          <p className="text-xs text-gray-500">ID: {doc.path.stored.fileId.substring(0, 10)}...</p>
                        )}
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => removeNewDocument(index)}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {newDocuments.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Upload className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Aucun nouveau document ajouté</p>
              <p className="text-sm">Ajoutez de nouveaux documents si nécessaire</p>
            </div>
          )}

          {/* <Button
            variant="outline"
            size="sm"
            onClick={async () => {
              await fileStorage.listAllFiles()
              checkIndexedDBStatus()
            }}
            className="mt-4"
          >
            Vérifier les fichiers stockés
          </Button> */}
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onPrevious}>
          Précédent
        </Button>
        <Button onClick={onNext}>Suivant</Button>
      </div>
    </div>
  )
}
