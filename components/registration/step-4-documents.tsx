"use client"

import type React from "react"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useSchoolStore } from "@/store/index"
import type { DocumentFormData, DocumentType } from "@/lib/interface"
import { X, Upload, FileText, Image, File, HelpCircle } from "lucide-react"
import { toast } from "react-hot-toast"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { motion, AnimatePresence } from "framer-motion"

interface Step4Props {
  onNext: () => void
  onPrevious: () => void
}

export function Step4Documents({ onNext, onPrevious }: Step4Props) {
  const { documentTypes, documentsForm, addDocumentForm, removeDocumentForm } = useSchoolStore()
  const [selectedDocType, setSelectedDocType] = useState<number>(0)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    handleFile(file)
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
    handleFile(file)
  }

  const handleFile = (file: File | undefined) => {
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Fichier trop volumineux , Le fichier ne doit pas dépasser 5 Mo")
      return
    }
    setSelectedFile(file)
  }

  const handleAddDocument = () => {
    if (!selectedDocType || !selectedFile) {
      toast.error("Champs manquants , Veuillez sélectionner un type de document et un fichier")
      return
    }

    const docType = documentTypes.find((dt) => dt.id === selectedDocType)
    if (!docType) return

    const newDocument: DocumentFormData = {
      document_type_id: selectedDocType,
      student_id: 0,
      label: selectedFile.name,
      path: selectedFile,
    }

    addDocumentForm(newDocument)
    setSelectedDocType(0)
    setSelectedFile(null)

    // Reset file input
    const fileInput = document.getElementById("document-file") as HTMLInputElement
    if (fileInput) fileInput.value = ""

    toast.success("Document ajouté , Le document a bien été ajouté à la liste")
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
      case 'jpg': case 'jpeg': case 'png': case 'gif': case 'bmp': case 'webp': case 'svg':
        return <Image className="w-5 h-5 text-blue-500" />
      case 'xls': case 'xlsx': case 'csv': case 'ods':
        return <File className="w-5 h-5 text-green-500" />
      case 'doc': case 'docx': case 'odt': case 'rtf':
        return <FileText className="w-5 h-5 text-blue-600" />
      case 'txt': return <FileText className="w-5 h-5 text-gray-600" />
      default: return <File className="w-5 h-5 text-gray-500" />
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-gray-800 flex items-center">
            Documents et Pièces justificatives
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="w-5 h-5 ml-2 text-gray-400 hover:text-gray-600" />
                </TooltipTrigger>
                <TooltipContent className="max-w-[300px]">
                  <p>Ajoutez ici tous les documents nécessaires pour compléter l'inscription.</p>
                  <p className="mt-2 font-medium">Formats acceptés:</p>
                  <ul className="list-disc pl-5 text-sm">
                    <li>Documents: PDF, DOC, DOCX, TXT, RTF</li>
                    <li>Tableurs: XLS, XLSX, CSV, ODS</li>
                    <li>Images: JPG, PNG, GIF, SVG, WEBP</li>
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
                <Label className="flex items-center">
                  Type de document
                  <span className="text-red-500 ml-1">*</span>
                </Label>
                <Select
                  value={selectedDocType.toString()}
                  onValueChange={(value) => setSelectedDocType(Number(value))}
                >
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Sélectionner un type" />
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
                <Label className="flex items-center">
                  Fichier (max 5 Mo)
                  <span className="text-red-500 ml-1">*</span>
                </Label>
                <div
                  className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                    isDragging ? 'border-primary bg-primary/10' : 'border-gray-300 hover:border-gray-400'
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <Input
                    id="document-file"
                    type="file"
                    onChange={handleFileSelect}
                    accept=".pdf,.jpg,.jpeg,.png,.gif,.bmp,.webp,.svg,.doc,.docx,.xls,.xlsx,.csv,.txt,.odt,.ods,.rtf"
                    className="hidden"
                  />
                  <label htmlFor="document-file" className="cursor-pointer">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <Upload className="w-8 h-8 text-gray-400" />
                      <p className="text-sm text-gray-500">
                        {isDragging ? 'Déposez le fichier ici' : 'Glissez-déposez ou cliquez pour sélectionner'}
                      </p>
                      <p className="text-xs text-gray-400">
                        PDF, Word, Excel, images (max 5 Mo)
                      </p>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {selectedFile && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="p-4 bg-gray-50 rounded-lg border border-gray-200"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {getFileIcon(selectedFile.name)}
                    <div>
                      <p className="font-medium text-gray-800 truncate max-w-[200px]">{selectedFile.name}</p>
                      <p className="text-sm text-gray-500">{formatFileSize(selectedFile.size)}</p>
                    </div>
                  </div>
                  <Button 
                    color="indigodye"
                    onClick={handleAddDocument} 
                    className="gap-2 bg-blue-600 hover:bg-blue-700"
                  >
                    <Upload className="w-4 h-4" />
                    Ajouter
                  </Button>
                </div>
              </motion.div>
            )}
          </div>

          <div className="space-y-4">
            <Label>Documents ajoutés</Label>
            
            <AnimatePresence>
              {documentsForm.length > 0 ? (
                <motion.div layout className="space-y-3">
                  {documentsForm.map((doc, index) => (
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
                            <Badge variant="outline" className="text-xs">
                              {getDocumentTypeName(doc.document_type_id)}
                            </Badge>
                            <p className="font-medium text-gray-800 truncate">{doc.label}</p>
                          </div>
                          <p className="text-sm text-gray-500">{formatFileSize(doc.path.size)}</p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          removeDocumentForm(index)
                          toast.success("Document supprimé , Le document a été retiré de la liste")
                        }}
                        className="text-gray-400 hover:text-red-500 hover:bg-red-50"
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
                  className="text-center py-12 text-gray-400 border-2 border-dashed rounded-lg bg-gray-50"
                >
                  <Upload className="w-12 h-12 mx-auto mb-4" />
                  <p className="text-lg font-medium">Aucun document ajouté</p>
                  <p className="text-sm">Commencez par ajouter un document ci-dessus</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between pt-4">
        <Button 
          variant="outline" 
          onClick={onPrevious} 
          className="gap-2 border-gray-300 hover:bg-gray-50"
        >
          Précédent
        </Button>
        <Button 
          onClick={onNext} 
          className="gap-2 border-gray-300"
          disabled={documentsForm.length === 0}
        >
          Suivant
        </Button>
      </div>
    </motion.div>
  )
}