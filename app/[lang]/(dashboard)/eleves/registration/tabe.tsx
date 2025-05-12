"use client";

import { useState } from "react";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";

interface RegistrationData {
  class_id: number;
  academic_year_id: number;
  student_id: number;
  registration_date: string;
}

interface Document {
  document_type_id: number;
  student_id: number;
  label: string;
}

const RegistrationForm = ({ classes, academicYears, students, documentTypes }: {
  classes: { id: number; level: string; label: string }[];
  academicYears: { id: number; label: string }[];
  students: { id: number; name: string; first_name: string }[];
  documentTypes: { id: number; name: string }[];
}) => {
  const [registration, setRegistration] = useState<RegistrationData>({
    class_id: 0,
    academic_year_id: 0,
    student_id: 0,
    registration_date: new Date().toISOString().split("T")[0],
  });
  const [documents, setDocuments] = useState<Document[]>([]);

  const handleRegister = async () => {
    // Validation des champs obligatoires
    if (!registration.student_id || !registration.class_id || !registration.academic_year_id) {
      toast.error("Veuillez remplir tous les champs obligatoires.");
      return;
    }

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ registration, documents }),
      });
      if (!response.ok) throw new Error("Échec de l'inscription");
      toast.success("Inscription réussie !");
      // Réinitialiser le formulaire après une inscription réussie
      setRegistration({
        class_id: 0,
        academic_year_id: 0,
        student_id: 0,
        registration_date: new Date().toISOString().split("T")[0],
      });
      setDocuments([]);
    } catch (error) {
      toast.error("Erreur lors de l'inscription");
    }
  };

  return (
    <Card className="p-6 max-w-2xl mx-auto">
      <h2 className="text-xl font-semibold mb-4">Inscription d'un élève</h2>
      <div className="space-y-4">
        {/* Sélection de l'élève */}
        <div>
          <Label>Élève *</Label>
          <Select onValueChange={(value) => setRegistration({ ...registration, student_id: Number(value) })}>
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner un élève" />
            </SelectTrigger>
            <SelectContent>
              {students.map((student) => (
                <SelectItem key={student.id} value={student.id.toString()}>
                  {student.name} {student.first_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Sélection de la classe */}
        <div>
          <Label>Classe *</Label>
          <Select onValueChange={(value) => setRegistration({ ...registration, class_id: Number(value) })}>
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner une classe" />
            </SelectTrigger>
            <SelectContent>
              {classes.map((classe) => (
                <SelectItem key={classe.id} value={classe.id.toString()}>
                  {classe.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Sélection de l'année académique */}
        <div>
          <Label>Année académique *</Label>
          <Select onValueChange={(value) => setRegistration({ ...registration, academic_year_id: Number(value) })}>
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner une année" />
            </SelectTrigger>
            <SelectContent>
              {academicYears.map((year) => (
                <SelectItem key={year.id} value={year.id.toString()}>
                  {year.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Date d'inscription */}
        <div>
          <Label>Date d'inscription *</Label>
          <Input
            type="date"
            value={registration.registration_date}
            onChange={(e) => setRegistration({ ...registration, registration_date: e.target.value })}
          />
        </div>

        {/* Gestion des documents */}
        <div>
          <Label>Documents</Label>
          {documents.map((doc, index) => (
            <div key={index} className="flex space-x-3 mb-2">
              <Select
                onValueChange={(value) => {
                  const newDocs = [...documents];
                  newDocs[index].document_type_id = Number(value);
                  setDocuments(newDocs);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Type de document" />
                </SelectTrigger>
                <SelectContent>
                  {documentTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id.toString()}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                placeholder="Label du document"
                value={doc.label}
                onChange={(e) => {
                  const newDocs = [...documents];
                  newDocs[index].label = e.target.value;
                  setDocuments(newDocs);
                }}
              />
              <Button variant="outline" onClick={() => setDocuments(documents.filter((_, i) => i !== index))}>
                Supprimer
              </Button>
            </div>
          ))}
          <Button
            variant="outline"
            onClick={() => setDocuments([...documents, { document_type_id: 0, student_id: registration.student_id, label: "" }])}
          >
            Ajouter un document
          </Button>
        </div>

        {/* Bouton de soumission */}
        <Button onClick={handleRegister} className="w-full mt-4">S'inscrire</Button>
      </div>
    </Card>
  );
};

export default RegistrationForm;