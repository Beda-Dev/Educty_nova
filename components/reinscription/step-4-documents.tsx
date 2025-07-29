"use client"

import type React from "react"

import { useState, useEffect , useRef } from "react"
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

export function Step4Documents({
  onNext,
  onPrevious,
}: Step4Props) {
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
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      if (fileInputRef.current) fileInputRef.current.value = "";
      setSelectedFile(null);
      return;
    }
    const file = e.target.files?.[0];
    setFileError("");

    if (!file) {
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    // Validate file
    if (file.size === 0) {
      setFileError("Le fichier est vide");
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setFileError("Le fichier ne doit pas dépasser 5 Mo");
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
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
    ];

    if (!allowedTypes.includes(file.type)) {
      setFileError(`Format de fichier non supporté: ${file.type}. Utilisez PDF, DOC, DOCX, TXT, JPEG, GIF ou SVG`);
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setSelectedFile(file);
  }

  const handleAddDocument = async () => {
    if (!selectedDocType || !selectedFile) {
      toast.error("Veuillez sélectionner un type de document et un fichier");
      if (fileInputRef.current) fileInputRef.current.value = "";
      setSelectedFile(null);
      return;
    }

    if (fileError) {
      toast.error("Veuillez corriger l'erreur de fichier avant de continuer");
      if (fileInputRef.current) fileInputRef.current.value = "";
      setSelectedFile(null);
      return;
    }

    if (!fileStorage) {
      setFileError("Stockage local non disponible sur ce navigateur ou en SSR");
      toast.error("Stockage local non disponible sur ce navigateur ou en SSR");
      if (fileInputRef.current) fileInputRef.current.value = "";
      setSelectedFile(null);
      return;
    }
    if (!selectedFile) return;

    const docType = documentTypes.find((dt) => dt.id === selectedDocType)
    if (!docType) return

    try {
      // console.log("Adding document:", selectedFile.name, selectedFile.size, selectedFile.type)

      // Vérifier à nouveau que le fichier est valide
      if (selectedFile && selectedFile.size === 0) {
        throw new Error("Le fichier est vide")
      }

      if (!selectedFile) return;

      const newDocument: DocumentFormData = {
        document_type_id: selectedDocType,
        label: selectedFile.name,
        path: selectedFile,
        student_id: selectedStudent?.id || 0,
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
    const docType = documentTypes.find((dt: DocumentType) => dt.id === id);
    return docType?.name || "Type inconnu";
  }


  return (
    <div className="space-y-6">
      {/* Information Card */}
      <Card className="border-indigodye/20 bg-indigodye/5">
        <CardContent className="pt-6">
          <div className="flex items-start space-x-3">
            <Info className="w-5 h-5 text-indigodye mt-0.5" />
            <div className="space-y-2">
              <h4 className="font-medium text-indigodye">Gestion des documents</h4>
              <div className="text-sm text-skyblue space-y-1">
                <p>• Ajoutez les documents nécessaires pour l'inscription</p>
                <p>• Taille maximale par fichier: 5 Mo</p>
                <p>• Formats acceptés: PDF, DOC, DOCX, TXT, JPEG, GIF, SVG</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Documents existants */}
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

      {/* Ajout de nouveaux documents (drag & drop + bouton) */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-indigodye flex items-center">
            Ajouter de nouveaux documents
            <Info className="w-5 h-5 ml-2 text-skyblue hover:text-indigodye" />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="flex items-center text-indigodye">
                  Type de document
                  <span className="text-bittersweet ml-1">*</span>
                </Label>
                <Select
                  value={selectedDocType.toString()}
                  onValueChange={(value) => setSelectedDocType(Number.parseInt(value))}
                >
                  <SelectTrigger className="h-11" aria-required="true">
                    <SelectValue placeholder="Sélectionner un type" />
                  </SelectTrigger>
                  <SelectContent aria-required="true">
                    {documentTypes.map((docType) => (
                      <SelectItem key={docType.id} value={docType.id.toString()}>
                        {docType.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {!selectedDocType && (
                  <p className="text-red-500 text-sm mt-1">Ce champ est requis</p>
                )}
              </div>
              <div className="space-y-2">
                <Label className="flex items-center text-indigodye">
                  Fichier (max 5 Mo)
                  <span className="text-bittersweet ml-1">*</span>
                </Label>
                <div
                  className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${fileError ? 'border-bittersweet' : 'border-gray-300 hover:border-gray-400'}`}
                  onDragOver={e => { e.preventDefault(); e.stopPropagation(); }}
                  onDrop={e => {
                    e.preventDefault();
                    const file = e.dataTransfer.files?.[0];
                    if (file) handleFileSelect({ target: { files: [file] } } as any)
                  }}
                >
                  <Input
                    id="document-file"
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    className="hidden"
                  />
                  <label htmlFor="document-file" className="cursor-pointer">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <Upload className="w-8 h-8 text-skyblue" />
                      <p className="text-sm text-skyblue">
                        Glissez-déposez ou cliquez pour sélectionner
                      </p>
                      <p className="text-xs text-skyblue/70">
                        PDF, Word, images (max 5 Mo)
                      </p>
                    </div>
                  </label>
                </div>
              </div>
            </div>
            {fileError && (
              <Alert color="destructive" className="border-bittersweet">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{fileError}</AlertDescription>
              </Alert>
            )}
            {selectedFile && !fileError && (
              <div className="p-3 bg-gray-50 rounded-md">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{selectedFile?.name}</p>
                    <p className="text-sm text-gray-500">{selectedFile ? formatFileSize(selectedFile.size) : ''}</p>
                  </div>
                  <Button color="indigodye" onClick={handleAddDocument} size="sm">
                    <Upload className="w-4 h-4 mr-2" />
                    Cliquez pour ajouter
                  </Button>
                </div>
              </div>
            )}
          </div>
          {/* Liste des nouveaux documents */}
          {newDocuments.length > 0 && (
            <div className="space-y-4">
              <Label className="text-indigodye">Nouveaux documents ajoutés</Label>
              <div className="space-y-3">
                {newDocuments.map((doc, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-md">
                    <div className="flex items-center space-x-3">
                      <Badge color="skyblue">{getDocumentTypeName(doc.document_type_id)}</Badge>
                      <div>
                        <p className="font-medium">{doc.label}</p>
                        <p className="text-sm text-gray-500">{formatFileSize(getFileSize(doc.path))}</p>
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
