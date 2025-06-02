import { User, GraduationCap, FileText, CheckCircle } from "lucide-react";

export const steps = [
  {
    label: "Informations personnelles",
    desc: "Informations de l'élève",
    icon: <User className="w-4 h-4 mr-2" />
  },
  {
    label: "Données scolaires",
    desc: "Dossier scolaire",
    icon: <GraduationCap className="w-4 h-4 mr-2" />
  },
  {
    label: "Classe et Niveau",
    desc: "classe et Niveau",
    icon: <FileText className="w-4 h-4 mr-2" />
  },
  {
    label: "Finalisation",
    desc: "inscription",
    icon: <CheckCircle className="w-4 h-4 mr-2" />
  }
];
