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
import { FileText, Download, Trash, PlusCircle, Upload, Loader2, CheckCircle, XCircle } from "lucide-react";
import { Student, DocumentType, Document } from "@/lib/interface";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useSchoolStore } from "@/store";
import { toast } from "sonner";
import { fetchDocument, fetchStudents } from "@/store/schoolservice";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

interface FileManagerProps {
  student: Student;
  updateMode?: boolean;
  onDocumentStatus: (hasDocuments: boolean) => void;
  className?: string;
}

const showToastError = (title: string, message: string) => {
  toast.error(
    <div>
      <p className="font-semibold">{title}</p>
      <p className="text-sm">{message}</p>
    </div>
  );
};


export default function FileManager({
  student,
  updateMode = false,
  onDocumentStatus,
  className = "",
}: FileManagerProps) {
  const { documentTypes, students, setDocuments, setStudents } = useSchoolStore();
  const [file, setFile] = useState<File | null>(null);
  const [myStudent, setMyStudent] = useState<Student | null>(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [docType, setDocType] = useState<number | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<number | null>(null);

  const allowedFormats = useMemo(() => [".pdf", ".doc", ".docx", ".txt", ".png", ".jpg", ".jpeg"], []);
  const maxFileSize = useMemo(() => 5 * 1024 * 1024, []); // 5 Mo

  const findStudentById = useCallback((studentId: number, students: Student[]): Student | null => {
    return students.find(student => student.id === studentId) || null;
  }, []);

  useEffect(() => {
    const currentStudent = findStudentById(student.id, students);
    setMyStudent(currentStudent);
    onDocumentStatus((currentStudent?.documents?.length ?? 0) > 0);
  }, [student.id, students, student.documents.length, onDocumentStatus, findStudentById]);

  const handleDelete = async (id: number) => {
    const toastId = toast.custom((t) => (
      <div className="flex items-center space-x-2">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>Suppression en cours...</span>
      </div>
    ));
    
    try {
      setLoading(true);
      const response = await fetch(`/api/document?id=${id}`, { method: "DELETE" });
      
      if (!response.ok) {
        const errorData = await response.json();
          showToastError("Échec de la suppression", `${errorData.message || "Échec de la suppression"}`);
      }

      toast.custom((t) => (
        <div className="flex items-center space-x-2 bg-green-50 p-3 rounded-md border border-green-200">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <span className="text-green-800">Document supprimé avec succès</span>
        </div>
      ), { id: toastId });
      
      onDocumentStatus((myStudent?.documents?.length || 0) - 1 > 0);
      
      // Rafraîchir les données en parallèle
      const [updatedDocuments, updatedStudents] = await Promise.all([
        fetchDocument(),
        fetchStudents()
      ]);
      
      setDocuments(updatedDocuments);
      setStudents(updatedStudents);
    } catch (error: any) {
      toast.custom((t) => (
        <div className="flex items-center space-x-2 bg-red-50 p-3 rounded-md border border-red-200">
          <XCircle className="h-5 w-5 text-red-600" />
          <span className="text-red-800">{error.message || "Erreur lors de la suppression"}</span>
        </div>
      ), { id: toastId });
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) {
      toast.warning("Aucun fichier sélectionné");
      return;
    }

    const fileExt = selectedFile.name.split(".").pop()?.toLowerCase();
    if (!fileExt || !allowedFormats.includes(`.${fileExt}`)) {
      toast.error(
        <div>
          <p className="font-medium">Format de fichier non autorisé</p>
          <p className="text-sm">Formats acceptés: {allowedFormats.join(', ')}</p>
        </div>
      );
      return;
    }

    if (selectedFile.size > maxFileSize) {
      toast.error(
        <div>
          <p className="font-medium">Fichier trop volumineux</p>
          <p className="text-sm">Taille maximale: {maxFileSize / (1024 * 1024)} Mo</p>
        </div>
      );
      return;
    }

    setFile(selectedFile);
  };

  const handleUpload = async () => {
    if (!file || !docType) {
      toast.warning("Veuillez sélectionner un type et un fichier");
      return;
    }

    const formData = new FormData();
    formData.append("document_type_id", docType.toString());
    formData.append("student_id", student.id.toString());
    formData.append("label", file.name);
    formData.append("path", file);

    const toastId = toast.custom((t) => (
      <div className="w-full space-y-2">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Envoi en cours...</span>
        </div>
        <Progress value={uploadProgress} className="h-2" />
      </div>
    ));

    try {
      setLoading(true);
      setUploadProgress(0);
      
      const xhr = new XMLHttpRequest();
      xhr.upload.addEventListener("progress", (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100);
          setUploadProgress(progress);
        }
      });

      const method = updateMode ? "PUT" : "POST";
      xhr.open(method, `https://educty.digifaz.com/api/document`);
      
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          toast.custom((t) => (
            <div className="flex items-center space-x-2 bg-green-50 p-3 rounded-md border border-green-200">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium text-green-800">Document ajouté avec succès</p>
                <p className="text-sm text-green-700">{file.name}</p>
              </div>
            </div>
          ), { id: toastId });
          
          setOpen(false);
          setFile(null);
          setDocType(null);
          onDocumentStatus(true);
          
          Promise.all([fetchDocument(), fetchStudents()])
            .then(([updatedDocuments, updatedStudents]) => {
              setDocuments(updatedDocuments);
              setStudents(updatedStudents);
            });
        } else {
          const errorData = JSON.parse(xhr.responseText);
          showToastError("Échec de l'ajout", `${errorData.message || "Échec de l'ajout"}`);
        }
      };
      
      xhr.onerror = () => {
        showToastError("", `Erreur réseau lors de l'envoi du fichier`);
      };
      
      xhr.send(formData);
    } catch (error: any) {
      toast.custom((t) => (
        <div className="flex items-center space-x-2 bg-red-50 p-3 rounded-md border border-red-200">
          <XCircle className="h-5 w-5 text-red-600" />
          <div>
            <p className="font-medium text-red-800">Échec de l'envoi</p>
            <p className="text-sm text-red-700">{error.message}</p>
          </div>
        </div>
      ), { id: toastId });
      console.error(error);
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  const handleDownload = (doc: Document) => {
    try {
      if (!doc.path) {
        throw new Error("Aucun fichier disponible pour ce document");
      }
  
      let downloadUrl = doc.path;
      
      if (!downloadUrl.startsWith('http')) {
        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
        downloadUrl = `${baseUrl}${downloadUrl.startsWith('/') ? '' : '/'}${downloadUrl}`;
      }
  
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.click();
      
      toast.success(
        <div className="flex items-center space-x-2">
          <CheckCircle className="h-4 w-4 text-green-500" />
          <span>Téléchargement lancé</span>
        </div>
      );
    } catch (error: any) {
      toast.error(
        <div className="flex items-center space-x-2">
          <XCircle className="h-4 w-4 text-red-500" />
          <span>Échec du téléchargement: {error.message}</span>
        </div>
      );
      console.error("Download error:", error);
    }
  };

  return (
    <div className={`bg-transparent p-4 ${className}`}>
      {loading && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
            <div className="flex flex-col items-center space-y-4">
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
              <p className="text-center font-medium">
                {uploadProgress > 0 ? `Envoi en cours (${uploadProgress}%)` : "Traitement en cours..."}
              </p>
              {uploadProgress > 0 && (
                <Progress value={uploadProgress} className="w-full h-2" />
              )}
            </div>
          </div>
        </div>
      )}

      {myStudent?.documents && myStudent.documents.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {myStudent.documents.map((doc) => (
            <div 
              key={doc.id} 
              className="flex flex-col items-center border p-4 rounded-lg hover:shadow-md transition-shadow bg-white"
            >
              <div className="relative w-full flex justify-between items-start mb-2">
                <Badge variant="outline" className="text-xs">
                  {documentTypes.find(dt => dt.id === doc.document_type_id)?.name || "Type inconnu"}
                </Badge>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => confirmDelete(doc.id)} 
                  disabled={loading}
                  className="h-6 w-6 text-red-500 hover:bg-red-50"
                >
                  <Trash className="w-3 h-3" />
                </Button>
              </div>
              
              <FileText className="w-10 h-10 text-blue-500" />
              <span className="text-sm text-center mt-2 font-medium line-clamp-2">
                {doc.label}
              </span>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDownload(doc)}
                disabled={loading}
                className="mt-3 w-full"
              >
                <Download className="w-4 h-4 mr-2" /> 
                <span>Télécharger</span>
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center p-8 border-2 border-dashed rounded-lg bg-gray-50/50">
          <FileText className="w-12 h-12 mx-auto text-gray-400" />
          <h4 className="mt-3 font-medium text-gray-600">
            Aucun document enregistré
          </h4>
          <p className="mt-1 text-sm text-gray-500">
            Ajoutez des documents pour {student.name} {student.first_name}
          </p>
        </div>
      )}

      {/* Dialog pour ajouter un document */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button className="mt-6 gap-1" color="default">
            <PlusCircle className="w-4 h-4" /> 
            <span>Ajouter un document</span>
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-blue-500" />
              <span>Ajouter un document</span>
            </DialogTitle>
            <DialogDescription>
              Téléversez un document pour {student.name} {student.first_name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label>Type de document <span className="text-red-500">*</span></Label>
              <Select 
                onValueChange={(value) => setDocType(Number(value))}
                value={docType?.toString() || ""}
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

            <div className="space-y-2">
              <Label>Fichier <span className="text-red-500">*</span></Label>
              <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-6 bg-gray-50/50 hover:bg-gray-100/50 transition-colors">
                {file ? (
                  <div className="text-center space-y-2">
                    <FileText className="w-10 h-10 mx-auto text-blue-500" />
                    <p className="font-medium">{file.name}</p>
                    <p className="text-sm text-gray-500">
                      {(file.size / 1024).toFixed(2)} KB
                    </p>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setFile(null)}
                      className="mt-2 text-red-500 hover:text-red-600"
                    >
                      Changer de fichier
                    </Button>
                  </div>
                ) : (
                  <>
                    <Upload className="w-10 h-10 text-gray-400 mb-3" />
                    <div className="text-center">
                      <p className="text-sm font-medium text-gray-600">
                        Glissez-déposez votre fichier ici
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        ou cliquez ici  pour sélectionner
                      </p>
                    </div>
                    <Input 
                      type="file" 
                      accept={allowedFormats.join(",")} 
                      onChange={handleFileChange} 
                      className="absolute opacity-0 w-full h-full cursor-pointer" 
                    />
                  </>
                )}
              </div>
              <div className="text-xs text-gray-500 mt-2">
                <p>Formats acceptés: {allowedFormats.join(', ')}</p>
                <p>Taille maximale: {maxFileSize / (1024 * 1024)} Mo</p>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button 
              onClick={handleUpload} 
              disabled={loading || !file || !docType}
              className="gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Envoi en cours...</span>
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  <span>Envoyer le document</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de confirmation de suppression */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <Trash className="w-5 h-5" />
              <span>Confirmer la suppression</span>
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              Êtes-vous sûr de vouloir supprimer ce document ? Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <div className="flex gap-2 w-full">
              <Button 
                variant="outline" 
                onClick={() => setDeleteDialogOpen(false)}
                disabled={loading}
                className="flex-1"
              >
                Annuler
              </Button>
              <Button 
              variant="outline" 
                color="destructive"
                onClick={() => documentToDelete && handleDelete(documentToDelete)}
                disabled={loading}
                className="flex-1 gap-2"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash className="w-4 h-4" />
                )}
                <span>Supprimer</span>
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}