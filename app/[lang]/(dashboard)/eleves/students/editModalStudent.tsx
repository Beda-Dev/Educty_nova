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
import { Loader2 } from "lucide-react";

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
};

export const EditStudentModal = ({
  isOpen,
  onOpenChangeAction,
  selectedStudent,
}: EditStudentModalProps) => {
  const { setRegistration, setStudents } = useSchoolStore();
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
  });

  const resetForm = useCallback(() => {
    if (selectedStudent) {
      setFormData({
        assignment_type_id: String(selectedStudent?.student?.assignment_type_id || ""),
        registration_number: selectedStudent?.student?.registration_number || "",
        name: selectedStudent?.student?.name || "",
        first_name: selectedStudent?.student?.first_name || "",
        birth_date: selectedStudent?.student?.birth_date || "",
        sexe: selectedStudent?.student?.sexe || "",
        status: selectedStudent?.student?.status || "",
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
  }, [selectedStudent]);

  useEffect(() => {
    if (isOpen) {
      resetForm();
    }
  }, [isOpen, resetForm]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedStudent) return;
    
    setIsSubmitting(true);
    
    try {
      const response = await fetch(
        `/api/students?id=${selectedStudent.student?.id || ""}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formdata),
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
        error instanceof Error 
          ? error.message 
          : "Échec de la mise à jour !"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChangeAction}>
      <DialogContent className="max-w-2xl p-6">
        <DialogHeader>
          <DialogTitle>
            Modifier les informations de {selectedStudent?.student?.name} {selectedStudent?.student?.first_name}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="registration_number">Matricule</Label>
              <Input
                id="registration_number"
                name="registration_number"
                placeholder="Matricule"
                value={formdata.registration_number}
                onChange={handleChange}
              />
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
            
            <div className="space-y-2">
              <Label>Sexe</Label>
              <Select
                value={formdata.sexe}
                onValueChange={(value) => handleSelectChange("sexe", value)}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner le sexe" />
                </SelectTrigger>
                <SelectContent className="z-[9999]" >
                  <SelectItem value="Masculin">Masculin</SelectItem>
                  <SelectItem value="Feminin">Feminin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
          
            
          </div>
          
          <DialogFooter>
          <div className="flex justify-around" >
              
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
              ) : "Enregistrer"}
            </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};