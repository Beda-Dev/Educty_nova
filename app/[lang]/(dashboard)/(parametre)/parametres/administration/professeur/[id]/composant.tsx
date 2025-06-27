import React from "react";
import type { Professor, Timetable } from "@/lib/interface";

interface ProfesseurComposantProps {
  professeur: Professor | null;
  timeTables: Timetable[];
}

export default function ProfesseurComposant({ professeur, timeTables }: ProfesseurComposantProps) {
  if (!professeur) {
    return <div>Professeur introuvable.</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">Détail du professeur</h1>
      <div className="mb-6 p-4 border rounded bg-gray-50">
        <div><strong>Nom :</strong> {professeur.name}</div>
        <div><strong>Email :</strong> {professeur.email}</div>
        {/* Ajoutez d'autres champs si besoin */}
      </div>
      <h2 className="text-xl font-semibold mb-2">Emplois du temps</h2>
      {timeTables.length === 0 ? (
        <div>Aucun emploi du temps trouvé pour ce professeur.</div>
      ) : (
        <ul className="space-y-2">
          {timeTables.map((tt) => (
            <li key={tt.id} className="p-3 border rounded bg-white">
              <div><strong>Matière :</strong> {tt.subject}</div>
              <div><strong>Jour :</strong> {tt.day}</div>
              <div><strong>Heure :</strong> {tt.hour}</div>
              {/* Ajoutez d'autres champs si besoin */}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
