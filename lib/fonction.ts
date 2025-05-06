import { Registration , AcademicYear  , Classe  , User , Role, Permission} from "./interface";


// Description: Fonctions utilitaires pour les mises à jour des classes



/**
 * Fonction qui compte les élèves par classe pour une année académique et met à jour les classes
 * @param registrations Liste des inscriptions
 * @param academicYear Année académique cible
 * @param classes Liste des classes à mettre à jour
 */
/**
 * Met à jour le nombre d'élèves par classe pour une année académique donnée
 * @param registrations - Liste des inscriptions d'élèves
 * @param academicYear - Année académique cible
 * @param classes - Liste des classes à mettre à jour
 * @returns Promise<void>
 * @throws {Error} Si une erreur survient pendant le traitement
 */
export async function updateStudentCountByClass(
  registrations: Registration[],
  academicYear: AcademicYear,
  classes: Classe[]
): Promise<void> {
  // Validation des entrées
  if (!registrations || !academicYear || !classes) {
    throw new Error("Paramètres d'entrée invalides");
  }

  if (classes.length === 0) {
    console.warn("Aucune classe à mettre à jour");
    return;
  }

  try {
    // 1. Filtrer les inscriptions valides pour l'année académique
    const validRegistrations = registrations.filter(
      (reg) => reg?.academic_year_id === academicYear.id && reg.class_id
    );

    if (validRegistrations.length === 0) {
      console.warn(`Aucune inscription valide trouvée pour l'année ${academicYear.name}`);
      return;
    }

    // 2. Compter efficacement les élèves par classe
    const classCounts = validRegistrations.reduce<Record<number, number>>(
      (acc, reg) => {
        acc[reg.class_id] = (acc[reg.class_id] || 0) + 1;
        return acc;
      },
      // Initialiser avec toutes les classes à 0
      Object.fromEntries(classes.map(classe => [classe.id, 0]))
    );

    // 3. Filtrer les classes nécessitant une mise à jour
    const classesToUpdate = classes.filter(classe => {
      const currentCount = parseInt(classe.student_number) || 0;
      const newCount = classCounts[classe.id] || 0;
      return currentCount !== newCount;
    });

    if (classesToUpdate.length === 0) {
      console.log("Aucune mise à jour nécessaire - les comptes sont déjà à jour");
      return;
    }

    // 4. Exécuter les mises à jour en parallèle avec gestion fine des erreurs
    const updateResults = await Promise.allSettled(
      classesToUpdate.map(async (classe) => {
        const newCount = classCounts[classe.id];
        const updateData = {
          ...classe,
          student_number: newCount.toString()
        };

        const response = await fetch(`/api/classe?id=${classe.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updateData),
        });

        if (!response.ok) {
          throw new Error(`Statut ${response.status} - ${response.statusText}`);
        }

        return {
          classId: classe.id,
          previousCount: classe.student_number,
          newCount,
          success: true
        };
      })
    );

    // 5. Analyser les résultats des mises à jour
    const successfulUpdates = updateResults
      .filter((result): result is PromiseFulfilledResult<any> => result.status === "fulfilled")
      .map(result => result.value);

    const failedUpdates = updateResults
      .filter((result): result is PromiseRejectedResult => result.status === "rejected")
      .map((result, index) => ({
        classId: classesToUpdate[index].id,
        error: result.reason.message
      }));

    // Log des résultats
    if (successfulUpdates.length > 0) {
      console.log("Mises à jour réussies:", successfulUpdates);
    }

    if (failedUpdates.length > 0) {
      console.error("Échecs de mise à jour:", failedUpdates);
      throw new Error(`${failedUpdates.length} mise(s) à jour ont échoué`);
    }

  } catch (error) {
    console.error("Erreur critique dans updateStudentCountByClass:", error);
    throw new Error(`Échec de la mise à jour des classes: ${error instanceof Error ? error.message : String(error)}`);
  }
}


  type RawUser = Omit<User, "permissions">;
  
  export function mergeUserPermissions(
    inputUser: RawUser,
    allRoles: Role[],
    allPermissions: Permission[]
  ): User & { permissionNames: string[] } {
    const userRoles: Role[] = inputUser.roles.map(userRole => {
      const fullRole = allRoles.find(r => r.id === userRole.id);
      return {
        ...userRole,
        permissions: fullRole?.permissions || []
      };
    });
  
    // Fusionner les noms de permissions uniques
    const permissionNamesSet = new Set<string>();
    
    userRoles.forEach(role => {
      role.permissions?.forEach(permission => {
        permissionNamesSet.add(permission.name);
      });
    });
  
    // Convertir le Set en tableau
    const permissionNames = Array.from(permissionNamesSet);
  
    return {
      ...inputUser,
      roles: userRoles,
      permissions: userRoles.flatMap(role => role.permissions || []),
      permissionNames // Ajout du tableau des noms de permissions
    };
  }

  //fonction pour vérifier si l'utilisateur a au moins une permission requise

export function verificationPermission(
    user: {
      permissionNames: string[];
      // Les autres propriétés ne sont pas nécessaires pour cette vérification
    },
    requiredPermissions: string[]
  ): boolean {
    // Vérifie si au moins une permission de l'utilisateur est incluse dans requiredPermissions
    return user.permissionNames.some(permission => 
      requiredPermissions.includes(permission)
    );
  }

  export function formatIvorianNumber(phoneNumber: string): string {
    // Supprimer tous les caractères non numériques
    const cleaned = phoneNumber.replace(/\D/g, "");
  
    // Vérification du format 225XXXXXXXX (10 chiffres au total)
    if (/^225\d{10}$/.test(cleaned)) {
      return cleaned;
    }
  
    // Si 8 chiffres seulement (sans 225)
    if (/^\d{10}$/.test(cleaned)) {
      return `225${cleaned}`;
    }
  
    // Si format international +225XXXXXXXX
    if (/^\+225\d{10}$/.test(phoneNumber)) {
      return phoneNumber.replace("+", "");
    }
  
    throw new Error(
      "Format de numéro invalide. Doit être 225XXXXXXXX ou +225XXXXXXXX"
    );
  }


  // fonction pour l'envoie de sms 

  /**
 * Fonction pour envoyer un SMS via l'API Brevo
 * @param {Object} params - Les paramètres d'envoi
 * @param {string} params.phoneNumber - Numéro au format 2250102030405 ou 0102030405
 * @param {string} params.message - Contenu du SMS
 * @param {string} [params.sender='Educty'] - Nom de l'expéditeur (optionnel)
 * @param {'transactional'|'marketing'} [params.smsType='transactional'] - Type de SMS (optionnel)
 * @returns {Promise<{success: boolean, data?: {messageId: string, numberUsed: string}, error?: string}>}
 */
  export async function envoiSms({
    phoneNumber,
    message,
    sender = 'Educty',
    smsType = 'transactional'
  }: {
    phoneNumber: string;
    message: string;
    sender?: string;
    smsType?: 'transactional' | 'marketing';
  }) {
    // Validation minimale
    if (!phoneNumber || !message) {
      console.error('Numéro ou message manquant');
      return {
        success: false,
        error: 'Le numéro et le message sont obligatoires'
      };
    }
  
    try {
      // Vérification du numéro avant envoi
      const formattedNumber = formatIvorianNumber(phoneNumber);
      console.log('Envoi SMS à:', formattedNumber);
  
      const response = await fetch(`${window.location.origin}/api/sendSms`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          phoneNumber: formattedNumber,
          message,
          sender,
          smsType
        })
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Erreur API Brevo:', errorData);
        return {
          success: false,
          error: errorData.error || 'Erreur lors de l\'envoi du SMS'
        };
      }
  
      const data = await response.json();
      return {
        success: true,
        data: {
          messageId: data.data.messageId,
          numberUsed: data.data.numberUsed
        }
      };
    } catch (error) {
      console.error('Erreur réseau:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur réseau inconnue'
      };
    }
  }

  
