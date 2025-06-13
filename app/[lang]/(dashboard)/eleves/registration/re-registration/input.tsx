"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FileText, Download, Trash, PlusCircle, Upload, Loader2, FileUp } from "lucide-react";
import { Student, DocumentType, Document, Registration , StudentOnly } from "@/lib/interface";
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogTrigger, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter, 
  DialogDescription 
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useSchoolStore } from "@/store";
import { toast } from "sonner";
import { fetchDocument, fetchStudents } from "@/store/schoolservice";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatFileSize } from "./fonction";

interface FileManagerProps {
  student: StudentOnly;
  updateMode?: boolean;
  onDocumentStatus?: (hasDocuments: boolean) => void;
  onPrevious: () => void;
  onNext: () => void;
  isLastStep: boolean;
  isSubmitting: boolean;
  Tarificationfound: boolean;
  className?: string;
}

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
};

export default function FileManager({
  student,
  updateMode = false,
  onDocumentStatus = () => {},
  onPrevious,
  onNext,
  isLastStep,
  isSubmitting,
  className = "",
}: FileManagerProps) {
  const { documentTypes, students, setDocuments, setStudents } = useSchoolStore();
  const [file, setFile] = useState<File | null>(null);
  const [myStudent, setMyStudent] = useState<Student | null>(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [docType, setDocType] = useState<number | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const allowedFormats = useMemo(() => [".pdf", ".doc", ".docx", ".txt", ".png", ".jpg", ".jpeg"], []);
  const maxFileSize = useMemo(() => 5 * 1024 * 1024, []); // 5 Mo
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';

  const findStudentById = useCallback((studentId: number, studentsList: Student[]): Student | null => {
    return studentsList.find(s => s.id === studentId) || null;
  }, []);

  useEffect(() => {
    const currentStudent = findStudentById(student?.id || 0, students);
    setMyStudent(currentStudent);
    onDocumentStatus((currentStudent?.documents?.length || 0) > 0);
  }, [student?.id, students, onDocumentStatus, findStudentById]);

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      validateAndSetFile(droppedFile);
    }
  };

  const validateAndSetFile = (selectedFile: File) => {
    const fileExt = selectedFile.name.split(".").pop()?.toLowerCase();
    
    if (!fileExt || !allowedFormats.includes(`.${fileExt}`)) {
      toast.error(`Format non supporté. Formats acceptés: ${allowedFormats.join(', ')}`);
      return;
    }

    if (selectedFile.size > maxFileSize) {
      toast.error(`Fichier trop volumineux (max ${formatFileSize(maxFileSize)})`);
      return;
    }

    setFile(selectedFile);
    toast.success("Fichier prêt à être uploadé");
  };

  const handleDelete = async (id: number) => {
    const toastId = toast.loading("Suppression en cours...");
    try {
      setLoading(true);
      const response = await fetch(`${apiBaseUrl}api/document/${id}`, { 
        method: "DELETE",
        headers: { 'Accept': 'application/json' }
      });
      
      if (!response.ok) throw new Error("Échec de la suppression");

      toast.success("Document supprimé !", { id: toastId });
      onDocumentStatus((myStudent?.documents?.length || 0) - 1 > 0);
      
      const [updatedDocuments, updatedStudents] = await Promise.all([
        fetchDocument(),
        fetchStudents()
      ]);
      
      setDocuments(updatedDocuments);
      setStudents(updatedStudents);
    } catch (error: any) {
      toast.error(error.message || "Erreur lors de la suppression", { id: toastId });
    } finally {
      setLoading(false);
      setDeleteDialogOpen(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) validateAndSetFile(selectedFile);
  };

  const handleUpload = async () => {
    if (!file || !docType || !student?.id) {
      toast.error("Sélectionnez un type et un fichier valides");
      return;
    }

    const formData = new FormData();
    formData.append("document_type_id", docType.toString());
    formData.append("student_id", student.id.toString());
    formData.append("label", file.name);
    formData.append("path", file);

    const toastId = toast.loading("Envoi en cours...");
    try {
      setLoading(true);
      const response = await fetch(`${apiBaseUrl}api/document`, { 
        method: updateMode ? "PUT" : "POST", 
        body: formData 
      });
      
      if (!response.ok) throw new Error("Échec de l'upload");

      toast.success("Document ajouté !", { id: toastId });
      setOpen(false);
      setFile(null);
      setDocType(null);
      onDocumentStatus(true);
      
      const [updatedDocuments, updatedStudents] = await Promise.all([
        fetchDocument(),
        fetchStudents()
      ]);
      
      setDocuments(updatedDocuments);
      setStudents(updatedStudents);
    } catch (error: any) {
      toast.error(error.message || "Erreur lors de l'upload", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (doc: Document) => {
    try {
      if (!doc.path) throw new Error("Aucun fichier disponible");
  
      let downloadUrl = doc.path.startsWith('http') || doc.path.startsWith('https') ? doc.path : `${apiBaseUrl}${doc.path}`;
      
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.download = doc.label || `document-${doc.id}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success("Téléchargement lancé");
    } catch (error: any) {
      toast.error(`Échec du téléchargement: ${error.message}`);
    }
  };

  if (!student) {
    return (
      <Card className="text-center p-6 border-dashed">
        <FileText className="w-12 h-12 mx-auto text-muted-foreground" />
        <p className="mt-2 text-muted-foreground">
          Aucun étudiant sélectionné
        </p>
      </Card>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      <AnimatePresence>
        {loading && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 flex items-center justify-center z-50"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            >
              <Loader2 className="w-12 h-12 text-skyblue" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">
          Documents de {student.name} {student.first_name}
        </h3>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button color="default" size="sm">
              <PlusCircle className="w-4 h-4 mr-2" />
              Ajouter
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Ajouter un document</DialogTitle>
              <DialogDescription>
                Formats acceptés: {allowedFormats.join(', ')} (max {formatFileSize(maxFileSize)})
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label>Type de document</Label>
                <Select 
                  onValueChange={(value) => setDocType(Number(value))}
                  value={docType?.toString() || ""}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un type" />
                  </SelectTrigger>
                  <SelectContent className="z-[9999]">
                    {documentTypes.map((item) => (
                      <SelectItem key={item.id} value={item.id.toString()}>
                        {item.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                  isDragging ? "border-primary bg-primary/5" : "border-muted"
                }`}
              >
                <div className="flex flex-col items-center justify-center space-y-2">
                  <FileUp className="w-8 h-8 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    {file ? file.name : "Glissez-déposez votre fichier ici"}
                  </p>
                  {file && (
                    <Badge variant="outline" className="mt-1">
                      {formatFileSize(file.size)}
                    </Badge>
                  )}
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-2"
                    onClick={() => document.getElementById("file-upload")?.click()}
                  >
                    {file ? "Changer de fichier" : "Sélectionner un fichier"}
                  </Button>
                  <Input
                    id="file-upload"
                    type="file"
                    accept={allowedFormats.join(",")}
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button 
                onClick={handleUpload} 
                disabled={!file || !docType}
                className="w-full"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Upload className="w-4 h-4 mr-2" />
                )}
                {loading ? "Envoi en cours..." : "Envoyer le document"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <AnimatePresence mode="wait">
        {myStudent?.documents && myStudent.documents.length > 0 ? (
          <motion.div
            key="documents-list"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={{
              hidden: { opacity: 0 },
              visible: { 
                opacity: 1,
                transition: { staggerChildren: 0.1 }
              },
              exit: { opacity: 0 }
            }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {myStudent.documents.map((doc) => (
              <motion.div
                key={doc.id}
                variants={fadeIn}
                whileHover={{ y: -2 }}
                className="border rounded-lg overflow-hidden bg-card"
              >
                <div className="p-4 flex flex-col h-full">
                  <div className="flex items-start space-x-3">
                    <div className="bg-primary/10 p-2 rounded-lg">
                      <FileText className="w-5 h-5 text-skyblue" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium truncate">{doc.label}</h4>
                      <p className="text-sm text-muted-foreground truncate">
                        {documentTypes.find(dt => dt.id === doc.document_type_id)?.name || "Type inconnu"}
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-4 flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownload(doc)}
                      className="flex-1"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Télécharger
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => {
                        setDocumentToDelete(doc.id);
                        setDeleteDialogOpen(true);
                      }}
                      className="flex-1 text-destructive hover:text-destructive"
                    >
                      <Trash className="w-4 h-4 mr-2" />
                      Supprimer
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="empty-state"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="border-2 border-dashed rounded-lg p-8 text-center"
          >
            <FileText className="w-12 h-12 mx-auto text-muted-foreground" />
            <h4 className="mt-3 font-medium text-muted-foreground">
              Aucun document enregistré
            </h4>
            <p className="mt-1 text-sm text-muted-foreground">
              Commencez par ajouter des documents pour {student.name} {student.first_name}
            </p>
            <Button color="indigodye"  size="sm" className="mt-4" onClick={() => setOpen(true)}>
              <PlusCircle className="w-4 h-4 mr-2" />
              Ajouter un document
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
            <DialogDescription>
              Cette action est irréversible. Le document sera définitivement supprimé.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Annuler
            </Button>
            <Button 
              color="destructive" 
              onClick={() => documentToDelete && handleDelete(documentToDelete)}
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Trash className="w-4 h-4 mr-2" />
              )}
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <div className="flex justify-between mt-4">
        <Button
          onClick={onPrevious}
          variant="outline"
          disabled={isSubmitting}
        >
          Précédent
        </Button>
        <Button
          onClick={onNext}
          disabled={isSubmitting || isLastStep}
        >
          {isLastStep ? 'Terminer' : 'Suivant'}
        </Button>
      </div>
    </div>
  );
}