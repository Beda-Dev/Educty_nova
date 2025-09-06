"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "react-hot-toast";
import { useSchoolStore } from "@/store";
import { useRouter } from "next/navigation";
import { fetchRegistration, fetchStudents } from "@/store/schoolservice";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Registration, Student } from "@/lib/interface";
import { Label } from "@/components/ui/label";
import { Loader2, Upload, X } from "lucide-react";

interface EditStudentModalProps {
  isOpen: boolean;
  onOpenChangeAction: (open: boolean) => void;
  selectedStudent: Registration | null;
}

type FormData = {
  assignment_type_id: string;
  registration_number: string;
  name: string;
  first_name: string;
  birth_date: string;
  sexe: string;
  status: string;
  photo?: string | null;
};

export const EditStudentModal = ({
  isOpen,
  onOpenChangeAction,
  selectedStudent,
}: EditStudentModalProps) => {
  const { setRegistration, setStudents, registrations } = useSchoolStore();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formdata, setFormData] = useState<FormData>({
    assignment_type_id: "",
    registration_number: "",
    name: "",
    first_name: "",
    birth_date: "",
    sexe: "",
    status: "",
    photo: "",
  });
  const [matriculeError, setMatriculeError] = useState<string | null>(null);
  const [newPhoto, setNewPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);

  const resetForm = useCallback(() => {
    if (selectedStudent) {
      setFormData({
        assignment_type_id: String(
          selectedStudent?.student?.assignment_type_id || ""
        ),
        registration_number:
          selectedStudent?.student?.registration_number || "",
        name: selectedStudent?.student?.name || "",
        first_name: selectedStudent?.student?.first_name || "",
        birth_date: selectedStudent?.student?.birth_date || "",
        sexe: selectedStudent?.student?.sexe || "",
        status: selectedStudent?.student?.status || "",
        photo: typeof selectedStudent?.student?.photo === 'string' ? selectedStudent.student.photo : ""
      });
    } else {
      setFormData({
        assignment_type_id: "",
        registration_number: "",
        name: "",
        first_name: "",
        birth_date: "",
        sexe: "",
        status: "",
      });
    }
    setNewPhoto(null);
    setPhotoPreview(null);
    setPhotoError(null);
  }, [selectedStudent]);

  useEffect(() => {
    if (isOpen) {
      resetForm();
    }
  }, [isOpen, resetForm]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Gestion du changement de photo
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Vérification du type de fichier (MIME ou extension)
      const allowedMimes = ["image/jpeg", "image/jpg", "image/png", "image/gif"];
      const allowedExt = [".jpeg", ".jpg", ".png", ".gif"];
      const fileExt = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();

      if (!allowedMimes.includes(file.type) && !allowedExt.includes(fileExt)) {
        setPhotoError("Veuillez sélectionner un fichier image au format JPG, PNG ou GIF.");
        return;
      }

      // Vérification de la taille (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setPhotoError("La taille de l'image ne doit pas dépasser 10MB.");
        return;
      }

      setPhotoError(null);
      setNewPhoto(file);

      // Créer un aperçu de l'image
      const reader = new FileReader();
      reader.onload = (e) => {
        setPhotoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Supprimer la nouvelle photo sélectionnée
  const removeNewPhoto = () => {
    setNewPhoto(null);
    setPhotoPreview(null);
    setPhotoError(null);
    // Reset l'input file
    const fileInput = document.getElementById('photo-input') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  // Obtenir l'URL de la photo à afficher
  const getPhotoUrl = () => {
    if (photoPreview) {
      return photoPreview; // Nouvelle photo sélectionnée
    }
    if (formdata.photo) {
      return `${process.env.NEXT_PUBLIC_API_BASE_URL}/${formdata.photo}`;
    }
    return null;
  };

  // Vérification du matricule unique pour l'année académique courante
  useEffect(() => {
    if (
      formdata.registration_number &&
      selectedStudent &&
      registrations &&
      selectedStudent.academic_year_id
    ) {
      const duplicate = registrations.find(
        (reg) =>
          reg.student?.registration_number === formdata.registration_number &&
          reg.academic_year_id === selectedStudent.academic_year_id &&
          reg.student?.id !== selectedStudent.student?.id
      );
      if (duplicate) {
        setMatriculeError(
          "Ce matricule est déjà utilisé pour un autre élève dans la même année académique."
        );
      } else {
        setMatriculeError(null);
      }
    } else {
      setMatriculeError(null);
    }
  }, [
    formdata.registration_number,
    selectedStudent,
    registrations,
  ]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedStudent) return;
    if (matriculeError) {
      toast.error(matriculeError);
      return;
    }
    if (photoError) {
      toast.error(photoError);
      return;
    }

    setIsSubmitting(true);

    try {
      // Créer un FormData pour inclure la photo si elle a été modifiée
      const submitFormData = new FormData();
      
      // Ajouter les données textuelles
      submitFormData.append('assignment_type_id', formdata.assignment_type_id);
      submitFormData.append('registration_number', formdata.registration_number);
      submitFormData.append('name', formdata.name);
      submitFormData.append('first_name', formdata.first_name);
      submitFormData.append('birth_date', formdata.birth_date);
      submitFormData.append('sexe', formdata.sexe);
      submitFormData.append('status', formdata.status);

      // Ajouter la photo seulement si elle a été modifiée
      if (newPhoto) {
        submitFormData.append('photo', newPhoto);
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/student/${selectedStudent.student?.id || ""}`,
        {
          method: "POST",
          body: submitFormData, // Utiliser FormData au lieu de JSON
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erreur lors de la mise à jour");
      }

      // Utilisation de Promise.all pour paralléliser les requêtes
      const [updatedRegistrations, updatedStudents] = await Promise.all([
        fetchRegistration(),
        fetchStudents(),
      ]);

      if (updatedRegistrations) setRegistration(updatedRegistrations);
      if (updatedStudents) setStudents(updatedStudents);

      toast.success("Informations mises à jour avec succès !");
      onOpenChangeAction(false);
      router.refresh();
    } catch (error) {
      console.error("Erreur lors de la mise à jour :", error);
      toast.error(
        error instanceof Error ? error.message : "Échec de la mise à jour !"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const photoUrl = getPhotoUrl();

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChangeAction}>
      <DialogContent size="5xl" className="p-6">
        <DialogHeader>
          <DialogTitle>
            Modifier les informations de {selectedStudent?.student?.name}{" "}
            {selectedStudent?.student?.first_name}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 py-4">
            {/* Section Photo */}
            <div className="lg:col-span-1 space-y-4">
              <Label>Photo de l'élève</Label>
              
              {/* Affichage de la photo actuelle ou aperçu */}
              <div className="relative">
                {photoUrl ? (
                  <div className="relative w-full h-64 border-2 border-gray-200 rounded-lg overflow-hidden">
                    <img
                      src={photoUrl}
                      alt="Photo de l'élève"
                      className="w-full h-full object-cover"
                    />
                    {photoPreview && (
                      <Button
                        type="button"
                        onClick={removeNewPhoto}
                        className="absolute top-2 right-2 p-1 bg-red-500 hover:bg-red-600 text-white rounded-full"
                        size="sm"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="w-full h-64 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                    <div className="text-center text-gray-500">
                      <Upload className="w-12 h-12 mx-auto mb-2" />
                      <p>Aucune photo</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Input pour sélectionner une nouvelle photo */}
              <div className="space-y-2">
                <Input
                  id="photo-input"
                  type="file"
                  accept=".jpeg,.jpg,.png,.gif"
                  onChange={handlePhotoChange}
                  className="cursor-pointer"
                />
                {photoError && (
                  <div className="text-red-600 text-xs">{photoError}</div>
                )}
                <p className="text-xs text-gray-500">
                  Formats acceptés: JPG, PNG, GIF. Taille max: 10MB
                </p>
              </div>
            </div>

            {/* Section Informations */}
            <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="registration_number">Matricule</Label>
                <Input
                  id="registration_number"
                  name="registration_number"
                  placeholder="Matricule"
                  value={formdata.registration_number}
                  onChange={handleChange}
                  required
                />
                {matriculeError && (
                  <div className="text-red-600 text-xs mt-1">{matriculeError}</div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Nom</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Nom"
                  value={formdata.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="first_name">Prénom</Label>
                <Input
                  id="first_name"
                  name="first_name"
                  placeholder="Prénom"
                  value={formdata.first_name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="birth_date">Date de naissance</Label>
                <Input
                  id="birth_date"
                  name="birth_date"
                  type="date"
                  value={formdata.birth_date}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label>Sexe</Label>
                <Select
                  value={formdata.sexe}
                  onValueChange={(value) => handleSelectChange("sexe", value)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue>{formdata.sexe || "Sélectionner le sexe"}</SelectValue>
                  </SelectTrigger>
                  <SelectContent className="z-[9999]">
                    <SelectItem value="Masculin">Masculin</SelectItem>
                    <SelectItem value="Feminin">Feminin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <DialogFooter>
            <div className="flex flex-row gap-4 justify-center w-full">
              <Button
                type="button"
                color="destructive"
                onClick={() => onOpenChangeAction(false)}
                disabled={isSubmitting}
              >
                Annuler
              </Button>
              <Button type="submit" color="tyrian" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enregistrement...
                  </>
                ) : (
                  "Enregistrer"
                )}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};