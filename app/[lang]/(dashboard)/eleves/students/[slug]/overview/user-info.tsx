import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Phone, Location, Calender, CalenderCheck } from "@/components/svg";
import { Student, AcademicYear, Registration } from "@/lib/interface";

interface UserInfoProps {
  student: Student | null;
  anneeAcademic: AcademicYear | null;
}

const UserInfo: React.FC<UserInfoProps> = ({ student, anneeAcademic }) => {
  // Vérification des données d'entrée
  if (!student) {
    return (
      <Card>
        <CardContent className="px-4 py-6 text-center text-default-600">
          Aucune donnée étudiant disponible
        </CardContent>
      </Card>
    );
  }

  // Formater la date de naissance avec vérification
  const formatDate = (dateString: string | undefined | null): string => {
    if (!dateString) return "Non renseignée";
    
    try {
      const date = new Date(dateString);
      return isNaN(date.getTime()) 
        ? "Date invalide" 
        : date.toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
          });
    } catch (error) {
      console.error("Erreur de formatage de date:", error);
      return "Erreur de date";
    }
  };

  // Trouver la dernière inscription avec gestion d'erreur robuste
  const getLastRegistration = (): Registration | undefined => {
    try {
      if (!anneeAcademic || !student.registrations || student.registrations.length === 0) {
        return undefined;
      }
      
      return student.registrations.find((item) => 
        item.academic_year_id === anneeAcademic.id
      ) as Registration | undefined;
    } catch (error) {
      console.error("Erreur lors de la recherche d'inscription:", error);
      return undefined;
    }
  };

  const lastRegistration = getLastRegistration();
  const createdAt = lastRegistration?.created_at 
    ? formatDate(lastRegistration.created_at) 
    : "Non renseignée";

  // Informations de base de l'étudiant avec valeurs par défaut
  const userInfo = [
    {
      icon: User,
      label: "Nom complet",
      value: `${student.name || "Non renseigné"} ${student.first_name || ""}`.trim()
    },
    {
      icon: CalenderCheck,
      label: "Date de naissance",
      value: formatDate(student.birth_date)
    },
    {
      icon: Calender,
      label: "Date d'inscription",
      value: createdAt
    },
    {
      icon: Location,
      label: "Statut",
      value: student.status || "Inconnu"
    },
    {
      icon: User,
      label: "Sexe",
      value: student.sexe === "F" ? "Féminin" : student.sexe === "M" ? "Masculin" : "Non spécifié"
    }
  ];

  return (
    <Card>
      <CardHeader className="border-none mb-0">
        <CardTitle className="text-lg font-medium text-default-800">
          Informations de l'éleve
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4">
        <p className="text-sm text-default-600">
          Matricule: {student.registration_number || "Non renseigné"} | 
          Type: {student.assignment_type?.label || "Type inconnu"}
        </p>
        
        <ul className="mt-6 space-y-4">
          {userInfo.map((item, index) => (
            <li key={`user-info-${index}`} className="flex items-center">
              <div className="flex-none 2xl:w-56 flex items-center gap-1.5">
                <span>{<item.icon className="w-4 h-4 text-skyblue" />}</span>
                <span className="text-sm font-medium text-default-800">
                  {item.label}:
                </span>
              </div>
              <div className="flex-1 text-sm text-default-700">
                {item.value}
              </div>
            </li>
          ))}
        </ul>

        <div className="mt-6 text-lg font-medium text-default-800 mb-4">
          Documents
        </div>
        <div className="space-y-3">
          {student.documents?.length > 0 ? (
            student.documents.map((document, index) => (
              <div key={`document-${index}`} className="flex items-center gap-2">
                <span className="w-4 h-4 text-skyblue">📄</span>
                <div className="text-sm font-medium text-default-800">
                  {document.label || "Document sans nom"}
                  <span className="font-normal ml-2">
                    ({formatDate(document.created_at)})
                  </span>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-default-600">Aucun document enregistré</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default UserInfo;