"use client"

import { useState, useEffect , useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useRegistrationStore } from "@/hooks/use-registration-store"
import { useSchoolStore } from "@/store"
import type { DocumentFormData } from "@/lib/interface"
import { X, Upload, FileText, Image, File, Info, AlertTriangle, RefreshCw } from "lucide-react"
import { fileStorage } from "@/lib/indexeddb-storage"
import { motion, AnimatePresence } from "framer-motion"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface Step4Props {
  onNext: () => void
  onPrevious: () => void
}

export function Step4Documents({ onNext, onPrevious }: Step4Props) {
  const { documentTypes } = useSchoolStore()
  const { documents, addDocument, removeDocument, getFileSize, restoreFilesFromIndexedDB, isRestoringFiles } = useRegistrationStore()
  const [selectedDocType, setSelectedDocType] = useState<number>(0)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [fileError, setFileError] = useState("")
  const [dbStatus, setDbStatus] = useState<string>("Vérification de la base de données...")
  const [isLoading, setIsLoading] = useState(false)
  const [isRestoring, setIsRestoring] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Effet de surveillance des documents dans le store
// Dans step-4-documents.tsx - Remplacer l'useEffect problématique

useEffect(() => {
  // Utiliser un délai pour éviter les restaurations multiples
  let timeoutId: NodeJS.Timeout;
  
  const checkAndRestore = async () => {
    const hasStoredFiles = documents.some(doc => doc.path.stored?.fileId);
    const needsRestoration = documents.some(doc => 
      doc.path.stored?.fileId && !doc.path.file && !doc.path.stored.isRestored
    );
    
    if (hasStoredFiles && needsRestoration && !isRestoring) {
      console.log("Initiating file restoration after delay...");
      setIsRestoring(true);
      
      try {
        await restoreFilesFromIndexedDB();
        setDbStatus("Documents restaurés avec succès");
      } catch (error) {
        console.error("Erreur lors de la restauration des documents:", error);
        setDbStatus("Erreur lors de la restauration des documents");
      } finally {
        setIsRestoring(false);
      }
    }
  };

  // Débouncer la restauration pour éviter les appels multiples
  timeoutId = setTimeout(checkAndRestore, 100);
  
  return () => {
    if (timeoutId) clearTimeout(timeoutId);
  };
}, [documents.length, isRestoring]); // Dépendances simplifiées

  // Vérifier l'état d'IndexedDB au montage
  useEffect(() => {
    checkIndexedDBStatus()
  }, [])

  // Effet de surveillance des erreurs
  // Note: abonnement supprimé pour éviter les restaurations concurrentes et répétées.

  const checkIndexedDBStatus = async () => {
    try {
      if (!fileStorage) {
        setDbStatus("Stockage local non disponible sur ce navigateur ou en SSR")
        return
      }
      await fileStorage.init()
      const files = await fileStorage.getAllFiles()
      setDbStatus(`Stockage prêt - ${files.length} fichiers stockés`)
    } catch (error) {
      console.error("Error checking IndexedDB status:", error)
      setDbStatus("Erreur d'accès au stockage")
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setFileError("");

    if (!file) {
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    validateFile(file);
  }

  const validateFile = (file: File) => {
    if (file.size === 0) {
      setFileError("Le fichier est vide");
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return false;
    }

    if (file.size > 5 * 1024 * 1024) {
      setFileError("Le fichier ne doit pas dépasser 5 Mo");
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return false;
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
      return false;
    }

    setSelectedFile(file);
    return true;
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) validateFile(file)
  }

  const handleAddDocument = async () => {
    if (!selectedDocType || !selectedFile) {
      setFileError("Veuillez sélectionner un type de document et un fichier");
      if (fileInputRef.current) fileInputRef.current.value = "";
      setSelectedFile(null);
      return;
    }

    if (fileError) {
      setFileError("Veuillez corriger l'erreur de fichier avant de continuer");
      if (fileInputRef.current) fileInputRef.current.value = "";
      setSelectedFile(null);
      return;
    }

    if (!fileStorage) {
      setFileError("Stockage local non disponible sur ce navigateur ou en SSR")
      return
    }

    setIsLoading(true)

    try {
      const docType = documentTypes.find((dt) => dt.id === selectedDocType)
      if (!docType) return

      const newDocument: DocumentFormData = {
        document_type_id: selectedDocType,
        student_id: 0,
        label: selectedFile.name,
        path: selectedFile,
      }

      // Essayer d'ajouter le document
      await addDocument(newDocument)
      
      // Vérifier si le document a été correctement stocké
      const storedDocument = documents.find(doc => 
        doc.label === selectedFile.name && 
        doc.document_type_id === selectedDocType
      )

      // if (!storedDocument) {
      //   console.error("Document non trouvé après l'ajout:", { 
      //     label: selectedFile.name, 
      //     docType: selectedDocType,
      //     documents: documents.map(d => ({ 
      //       label: d.label, 
      //       type: d.document_type_id,
      //       stored: d.path.stored?.fileId 
      //     }))
      //   })
      //   throw new Error("Le document n'a pas été trouvé après l'ajout")
      // }

      // if (!storedDocument?.path.stored?.fileId) {
      //   console.error("Document stocké sans ID:", storedDocument)
      //   throw new Error("Le document n'a pas été correctement stocké")
      // }

      setSelectedDocType(0)
      setSelectedFile(null)
      setFileError("")
      
      // Reset file input
      if (fileInputRef.current) fileInputRef.current.value = ""

      await checkIndexedDBStatus()
    } catch (error) {
      console.error("Error adding document:", error)
      if (error instanceof Error) {
        // Log more details about the error
        console.error("Detailed error:", {
          message: error.message,
          name: error.name,
          stack: error.stack
        })
      }
      
      // setFileError("Erreur lors de l'ajout du document: " + (error instanceof Error ? error.message : "Une erreur est survenue"))
      
      // Tenter de restaurer les documents existants
      if (documents.some(doc => doc.path.stored?.fileId)) {
        setIsRestoring(true)
        restoreFilesFromIndexedDB()
          .catch(error => {
            console.error("Erreur lors de la restauration:", error)
          })
          .finally(() => {
            setIsRestoring(false)
          })
      }
    } finally {
      setIsLoading(false)
    }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const getDocumentTypeName = (id: number): string => {
    const docType = documentTypes.find((dt) => dt.id === id)
    return docType?.name || "Type inconnu"
  }

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase()
    switch (extension) {
      case 'pdf': return <FileText className="w-5 h-5 text-red-500" />
      case 'jpg': case 'jpeg': case 'png': return <Image className="w-5 h-5 text-blue-500" />
      case 'doc': case 'docx': return <FileText className="w-5 h-5 text-blue-600" />
      default: return <File className="w-5 h-5 text-gray-500" />
    }
  }

  const hasRestoredDocuments = documents.some((doc) => doc.path.stored?.isRestored)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
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
                {/* <p>• Les fichiers sont sauvegardés localement en cas de rechargement</p> */}
                {/* <p className="font-medium">• État de la base de données: {dbStatus}</p> */}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* {hasRestoredDocuments && (
        <Alert className="border-tyrian/20 bg-tyrian/5">
          <RefreshCw className="h-4 w-4 text-tyrian" />
          <AlertDescription className="text-tyrian">
            Certains documents ont été restaurés automatiquement. Ils sont prêts à être utilisés.
          </AlertDescription>
        </Alert>
      )} */}

      {fileError && (
        <Alert color="destructive" className="border-bittersweet">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{fileError}</AlertDescription>
        </Alert>
      )}

      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-indigodye flex items-center">
            Documents et Pièces justificatives
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="w-5 h-5 ml-2 text-skyblue hover:text-indigodye" />
                </TooltipTrigger>
                <TooltipContent className="max-w-[300px]">
                  <p>Ajoutez ici tous les documents nécessaires pour compléter l'inscription.</p>
                  <p className="mt-2 font-medium">Formats acceptés:</p>
                  <ul className="list-disc pl-5 text-sm">
                    <li>Documents: PDF, DOC, DOCX, TXT</li>
                    <li>Images: JPEG, GIF, SVG</li>
                  </ul>
                  <p className="mt-2 text-sm">Taille maximale: 5 Mo</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
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
                  onValueChange={(value) => setSelectedDocType(Number(value))}
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
                  className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                    isDragging ? 'border-indigodye bg-indigodye/10' : 'border-gray-300 hover:border-gray-400'
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <input
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
                        {isDragging ? 'Déposez le fichier ici' : 'Glissez-déposez ou cliquez pour sélectionner'}
                      </p>
                      <p className="text-xs text-skyblue/70">
                        PDF, Word, images (max 5 Mo)
                      </p>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {selectedFile && !fileError && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="p-4 bg-gray-50 rounded-lg border border-gray-200"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {getFileIcon(selectedFile.name)}
                    <div>
                      <p className="font-medium text-indigodye truncate max-w-[200px]">{selectedFile.name}</p>
                      <p className="text-sm text-skyblue">{formatFileSize(selectedFile.size)}</p>
                    </div>
                  </div>
                  <Button 
                    color="indigodye"
                    onClick={handleAddDocument} 
                    className="gap-2"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Upload className="w-4 h-4" />
                    )}
                    Cliquez pour  ajouter
                  </Button>
                </div>
              </motion.div>
            )}
          </div>

          <div className="space-y-4">
            <Label className="text-indigodye">Documents ajoutés</Label>
            
            <AnimatePresence>
              {documents.length > 0 ? (
                <motion.div layout className="space-y-3">
                  {documents.map((doc, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -50 }}
                      transition={{ duration: 0.2 }}
                      className="flex items-center justify-between p-4 border rounded-lg bg-white hover:shadow-sm transition-all"
                    >
                      <div className="flex items-center space-x-4 min-w-0">
                        {getFileIcon(doc.label)}
                        <div className="min-w-0">
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline" className="text-xs bg-indigodye/10 text-indigodye border-indigodye/20">
                              {getDocumentTypeName(doc.document_type_id)}
                            </Badge>
                            <p className="font-medium text-indigodye truncate">{doc.label}</p>
                          </div>
                          <p className="text-sm text-skyblue">{formatFileSize(getFileSize(doc.path))}</p>
                          {/* {doc.path.stored?.isRestored && (
                            <p className="text-xs text-tyrian">Restauré automatiquement</p>
                          )} */}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          removeDocument(index)
                        }}
                        className="text-gray-400 hover:text-bittersweet hover:bg-bittersweet/10"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-12 text-skyblue border-2 border-dashed rounded-lg bg-indigodye/5"
                >
                  <Upload className="w-12 h-12 mx-auto mb-4 text-skyblue" />
                  <p className="text-lg font-medium text-indigodye">Aucun document ajouté</p>
                  <p className="text-sm">Commencez par ajouter un document ci-dessus</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* <Button
            variant="outline"
            size="sm"
            onClick={async () => {
              await fileStorage.listAllFiles()
              checkIndexedDBStatus()
            }}
            className="mt-4 border-indigodye/30 text-indigodye hover:bg-indigodye/10"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Vérifier les fichiers stockés
          </Button> */}
        </CardContent>
      </Card>

      <div className="flex justify-between pt-4">
        <Button 
          variant="outline" 
          onClick={onPrevious} 
          
        >
          Précédent
        </Button>
        <Button 
          onClick={onNext} 
          
          
        >
          Suivant
        </Button>
      </div>
    </motion.div>
  )
}