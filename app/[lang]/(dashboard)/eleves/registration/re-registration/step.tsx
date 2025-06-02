import { User, FileText, Calendar, CheckCircle } from "lucide-react";

export const steps = [
  {
    label: "Informations",
    desc: "Informations personnelles",
    icon: <User className="w-4 h-4" />
  },
  {
    label: "Documents",
    desc: "Pièces jointes requises",
    icon: <FileText className="w-4 h-4" />
  },
  {
    label: "Paiement",
    desc: "Règlement des frais",
    icon: <Calendar className="w-4 h-4" />
  },
  {
    label: "Validation",
    desc: "Confirmation finale",
    icon: <CheckCircle className="w-4 h-4" />
  }
];