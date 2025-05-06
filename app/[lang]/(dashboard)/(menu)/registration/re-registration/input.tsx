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
import { FileText, Download, Trash, PlusCircle, Upload, Loader2 } from "lucide-react";
import { Student, DocumentType, Document, Registration } from "@/lib/interface";
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

interface FileManagerProps {
  student: Registration["student"];
  updateMode?: boolean;
  onDocumentStatus?: (hasDocuments: boolean) => void;
  className?: string;
}

export default function FileManager({
  student,
  updateMode = false,
  onDocumentStatus = () => {},
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

  const handleDelete = async (id: number) => {
    const toastId = toast.loading("Suppression en cours...");
    try {
      setLoading(true);
      const response = await fetch(`https://educty.digifaz.com/api/document/${id}`, { 
        method: "DELETE",
        headers: {
          'Accept': 'application/json',
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Échec de la suppression.");
      }

      toast.success("Document supprimé !", { id: toastId });
      onDocumentStatus((myStudent?.documents?.length || 0) - 1 > 0);
      
      // Rafraîchir les données
      const [updatedDocuments, updatedStudents] = await Promise.all([
        fetchDocument(),
        fetchStudents()
      ]);
      
      setDocuments(updatedDocuments);
      setStudents(updatedStudents);
    } catch (error: any) {
      toast.error(error.message || "Erreur lors de la suppression.", { id: toastId });
      console.error("Delete error:", error);
    } finally {
      setLoading(false);
      setDeleteDialogOpen(false);
      setDocumentToDelete(null);
    }
  };

  const confirmDelete = (id: number) => {
    setDocumentToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) {
      toast.error("Aucun fichier sélectionné");
      return;
    }

    const fileExt = selectedFile.name.split(".").pop()?.toLowerCase();
    if (!fileExt || !allowedFormats.includes(`.${fileExt}`)) {
      toast.error(`Format de fichier non autorisé ! Formats acceptés: ${allowedFormats.join(', ')}`);
      return;
    }

    if (selectedFile.size > maxFileSize) {
      toast.error(`Le fichier dépasse la taille maximale de ${maxFileSize / (1024 * 1024)} Mo`);
      return;
    }

    setFile(selectedFile);
  }, [allowedFormats, maxFileSize]);

  const handleUpload = async () => {
    if (!file || !docType || !student?.id) {
      toast.error("Sélectionnez un type et un fichier valides.");
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
      const method = updateMode ? "PUT" : "POST";
      const response = await fetch(`${apiBaseUrl}api/document`, { 
        method, 
        body: formData 
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Échec de l'ajout.");
      }

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
      toast.error(error.message || "Erreur lors de l'ajout.", { id: toastId });
      console.error("Upload error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = useCallback((doc: Document) => {
    try {
      if (!doc.path) {
        throw new Error("Aucun fichier disponible pour ce document");
      }
  
      let downloadUrl = doc.path;
      
      if (!downloadUrl.startsWith('http')) {
        downloadUrl = `${apiBaseUrl}${downloadUrl.startsWith('/') ? '' : '/'}${downloadUrl}`;
      }
  
      // Créer un lien temporaire pour le téléchargement
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
      console.error("Download error:", error);
    }
  }, [apiBaseUrl]);

  if (!student) {
    return (
      <div className="text-center p-6 border-2 border-dashed rounded-lg">
        <FileText className="w-12 h-12 mx-auto text-gray-400" />
        <p className="mt-2 text-gray-500">
          Aucun étudiant sélectionné.
        </p>
      </div>
    );
  }

  return (
    <div className={`bg-transparent p-4 ${className}`}>
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
        </div>
      )}

      {myStudent?.documents && myStudent.documents.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {myStudent.documents.map((doc) => (
            <div 
              key={doc.id} 
              className="flex flex-col items-center border p-4 rounded-md hover:shadow-md transition-shadow bg-white"
            >
              <FileText className="w-10 h-10 text-blue-500" />
              <span className="text-sm text-center mt-2 font-medium line-clamp-2">
                {doc.label}
              </span>
              <span className="text-xs text-gray-500 mt-1">
                {documentTypes.find(dt => dt.id === doc.document_type_id)?.name || "Type inconnu"}
              </span>
              <div className="flex gap-2 mt-3 w-full justify-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDownload(doc)}
                  disabled={loading}
                  className="flex-1"
                >
                  <Download className="w-4 h-4 mr-2" /> Télécharger
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => confirmDelete(doc.id)} 
                  disabled={loading}
                  className="flex-1"
                >
                  <Trash className="w-4 h-4 mr-2 text-red-500" /> Supprimer
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center p-6 border-2 border-dashed rounded-lg">
          <FileText className="w-12 h-12 mx-auto text-gray-400" />
          <p className="mt-2 text-gray-500">
            Aucun document enregistré pour {student?.name || "l'étudiant"} {student?.first_name || ""}.
          </p>
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button className="mt-6" variant="outline">
            <PlusCircle className="w-5 h-5 mr-2" /> Ajouter un document
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Ajouter un document</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label>Type de document *</Label>
              <Select 
                onValueChange={(value) => setDocType(Number(value))}
                value={docType?.toString() || ""}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un type" />
                </SelectTrigger>
                <SelectContent className="z-[9999]">
                  {documentTypes.map((item: DocumentType) => (
                    <SelectItem key={item.id} value={item.id.toString()}>
                      {item.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Fichier *</Label>
              <div className="mt-1 flex items-center gap-2">
                <Input 
                  type="file" 
                  accept={allowedFormats.join(",")} 
                  onChange={handleFileChange} 
                  className="border p-2 w-full" 
                  disabled={loading}
                />
              </div>
              {file && (
                <div className="mt-2 text-sm text-gray-600">
                  Fichier sélectionné: <span className="font-medium">{file.name}</span>
                  <span className="ml-2 text-gray-500">({(file.size / 1024).toFixed(2)} KB)</span>
                </div>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Formats acceptés: {allowedFormats.join(', ')} (max {maxFileSize / (1024 * 1024)} Mo)
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button 
              onClick={handleUpload} 
              disabled={loading || !file || !docType}
              className="w-full sm:w-auto"
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

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer ce document ? Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setDeleteDialogOpen(false)}
              disabled={loading}
            >
              Annuler
            </Button>
            <Button 
              variant="outline"
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
    </div>
  );
}