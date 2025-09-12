import { createIndexedDBStorage } from '@/lib/indexedDB-store';

// Instance du storage IndexedDB
const indexedDBStorage = createIndexedDBStorage();

interface StoredState {
  [key: string]: any; // Or define more specific types if you know the structure
}

interface StoredData {
  state: StoredState;
  // Add other properties if they exist in your stored data
}

// Fonction utilitaire pour récupérer les données depuis IndexedDB
const getDataFromIndexedDB = async (key: string) => {
  try {
    const storedData = await indexedDBStorage.getItem("school-store") as StoredData;
    if (storedData && storedData.state && storedData.state[key]) {
      return storedData.state[key];
    }
    return [];
  } catch (error) {
    console.error(`Erreur lors de la récupération de ${key} depuis IndexedDB:`, error);
    return [];
  }
};

export const fetchClasses = async (opts: RequestInit = {}) => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/classe`, opts);
    return await response.json();
  } catch (error) {
    console.error("Erreur lors de la récupération des classes :", error);
    return await getDataFromIndexedDB('classes');
  }
};

export const fetchLevels = async (opts: RequestInit = {}) => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/level`, opts);
    return await response.json();
  } catch (error) {
    console.error("Erreur lors de la récupération des niveaux :", error);
    return await getDataFromIndexedDB('levels');
  }
};

export const fetchAcademicYears = async (opts: RequestInit = {}) => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/academicYear`, opts);
    return await response.json();
  } catch (error) {
    console.error("Erreur lors de la récupération des années académiques :", error);
    return await getDataFromIndexedDB('academicYears');
  }
};

export const fetchStudents = async (opts: RequestInit = {}) => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/student`, opts);
    return await response.json();
  } catch (error) {
    console.error("Erreur lors de la récupération des élèves :", error);
    return await getDataFromIndexedDB('students');
  }
};

export const fetchUsers = async (opts: RequestInit = {}) => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users`, opts);
    return await response.json();
  } catch (error) {
    console.error("Erreur lors de la récupération des utilisateurs :", error);
    return await getDataFromIndexedDB('users');
  }
};

export const fetchRoles = async (opts: RequestInit = {}) => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/role`, opts);
    return await response.json();
  } catch (error) {
    console.error("Erreur lors de la récupération des rôles :", error);
    return await getDataFromIndexedDB('roles');
  }
};

export const fetchpricing = async (opts: RequestInit = {}) => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/pricing`, opts);
    return await response.json();
  } catch (error) {
    console.error("Erreur lors de la récupération des tarifications :", error);
    return await getDataFromIndexedDB('pricing');
  }
};

export const fetchRegistration = async (opts: RequestInit = {}) => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/registration`, opts);
    return await response.json();
  } catch (error) {
    console.error("Erreur lors de la récupération des inscriptions :", error);
    return await getDataFromIndexedDB('registrations');
  }
};

export const fetchAssignmentType = async (opts: RequestInit = {}) => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/assignmentType`, opts);
    return await response.json();
  } catch (error) {
    console.error("Erreur lors de la récupération des types de statut des élèves :", error);
    return await getDataFromIndexedDB('assignmentTypes');
  }
};

export const fetchFeeType = async (opts: RequestInit = {}) => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/feeType`, opts);
    return await response.json();
  } catch (error) {
    console.error("Erreur lors de la récupération des types de frais :", error);
    return await getDataFromIndexedDB('feeTypes');
  }
};

export const fetchDocumentType = async (opts: RequestInit = {}) => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/documentType`, opts);
    return await response.json();
  } catch (error) {
    console.error("Erreur lors de la récupération des types de document :", error);
    return await getDataFromIndexedDB('documentTypes');
  }
};

export const fetchDocument = async (opts: RequestInit = {}) => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/document`, opts);
    return await response.json();
  } catch (error) {
    console.error("Erreur lors de la récupération des documents :", error);
    return await getDataFromIndexedDB('documents');
  }
};

export const fetchPayment = async (opts: RequestInit = {}) => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/payment`, opts);
    return await response.json();
  } catch (error) {
    console.error("Erreur lors de la récupération des paiements :", error);
    return await getDataFromIndexedDB('payments');
  }
};

export const fetchInstallment = async (opts: RequestInit = {}) => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/installment`, opts);
    return await response.json();
  } catch (error) {
    console.error("Erreur lors de la récupération des versements :", error);
    return await getDataFromIndexedDB('installements');
  }
};

export const fetchCashRegister = async (opts: RequestInit = {}) => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/cashRegister`, opts);
    return await response.json();
  } catch (error) {
    console.error("Erreur lors de la récupération des caisses :", error);
    return await getDataFromIndexedDB('cashRegisters');
  }
};

export const fetchSetting = async (opts: RequestInit = {}) => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/setting`, opts);
    return await response.json();
  } catch (error) {
    console.error("Erreur lors de la récupération des paramètres :", error);
    return await getDataFromIndexedDB('settings');
  }
};

export const fetchExpenseType = async (opts: RequestInit = {}) => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/expenseType`, opts);
    return await response.json();
  } catch (error) {
    console.error("Erreur lors de la récupération des types de dépense :", error);
    return await getDataFromIndexedDB('expenseTypes');
  }
};

export const fetchExpenses = async (opts: RequestInit = {}) => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/expense`, opts);
    return await response.json();
  } catch (error) {
    console.error("Erreur lors de la récupération des dépenses :", error);
    return await getDataFromIndexedDB('expenses');
  }
};

export const fetchPermissions = async (opts: RequestInit = {}) => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/permission`, opts);
    return await response.json();
  } catch (error) {
    console.error("Erreur lors de la récupération des permissions :", error);
    return await getDataFromIndexedDB('permissions');
  }
};

export const fetchPaymentMethods = async (opts: RequestInit = {}) => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/paymentMethod`, opts);
    return await response.json();
  } catch (error) {
    console.error("Erreur lors de la récupération des méthodes de paiement :", error);
    return await getDataFromIndexedDB('methodPayment');
  }
};

export const fetchValidationExpenses = async (opts: RequestInit = {}) => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/validationExpense`, opts);
    return await response.json();
  } catch (error) {
    console.error("Erreur lors de la récupération des validations de dépenses :", error);
    return await getDataFromIndexedDB('validationExpenses');
  }
};

export const fetchTutors = async (opts: RequestInit = {}) => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/tutor`, opts);
    return await response.json();
  } catch (error) {
    console.error("Erreur lors de la récupération des parents :", error);
    return await getDataFromIndexedDB('tutors');
  }
};

export const fetchTransactions = async (opts: RequestInit = {}) => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/transaction`, opts);
    return await response.json();
  } catch (error) {
    console.error("Erreur lors de la récupération des transactions :", error);
    return await getDataFromIndexedDB('transactions');
  }
};

export const fetchCashRegisterSessions = async (opts: RequestInit = {}) => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/cashRegisterSession`, opts);
    return await response.json();
  } catch (error) {
    console.error("Erreur lors de la récupération des sessions de caisse :", error);
    return await getDataFromIndexedDB('cashRegisterSessions');
  }
};

export const fetchMatters = async (opts: RequestInit = {}) => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/matter`, opts);
    return await response.json();
  } catch (error) {
    console.error("Erreur lors de la récupération des matières :", error);
    return await getDataFromIndexedDB('matters');
  }
};

export const fetchTypeEvaluations = async (opts: RequestInit = {}) => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/typeNote`, opts);
    return await response.json();
  } catch (error) {
    console.error("Erreur lors de la récupération des types d'évaluation :", error);
    return await getDataFromIndexedDB('typeEvaluations');
  }
};

export const fetchTypePeriods = async (opts: RequestInit = {}) => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/typePeriod`, opts);
    return await response.json();
  } catch (error) {
    console.error("Erreur lors de la récupération des types de période :", error);
    return await getDataFromIndexedDB('typePeriods');
  }
};

export const fetchPeriods = async (opts: RequestInit = {}) => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/period`, opts);
    return await response.json();
  } catch (error) {
    console.error("Erreur lors de la récupération des périodes :", error);
    return await getDataFromIndexedDB('periods');
  }
};

export const fetchDemands = async (opts: RequestInit = {}) => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/demand`, opts);
    return await response.json();
  } catch (error) {
    console.error("Erreur lors de la récupération des demandes :", error);
    return await getDataFromIndexedDB('demands');
  }
};

export const fetchProfessor = async (opts: RequestInit = {}) => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/professor`, opts);
    return await response.json();
  } catch (error) {
    console.error("Erreur lors de la récupération des professeurs :", error);
    return await getDataFromIndexedDB('professor');
  }
};

export const fetchSeries = async (opts: RequestInit = {}) => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/serie`, opts);
    return await response.json();
  } catch (error) {
    console.error("Erreur lors de la récupération des séries :", error);
    return await getDataFromIndexedDB('series');
  }
};

export const fetchTimetable = async (opts: RequestInit = {}) => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/timetable`, opts);
    return await response.json();
  } catch (error) {
    console.error("Erreur lors de la récupération des emplois du temps :", error);
    return await getDataFromIndexedDB('timetables');
  }
};

export const fetchNotes = async (opts: RequestInit = {}) => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/note`, opts);
    return await response.json();
  } catch (error) {
    console.error("Erreur lors de la récupération des notes :", error);
    return await getDataFromIndexedDB('notes');
  }
};

export const fetchCoefficient = async (opts: RequestInit = {}) => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/coefficient`, opts);
    return await response.json();
  } catch (error) {
    console.error("Erreur lors de la récupération des coefficients :", error);
    return await getDataFromIndexedDB('coefficients');
  }
};

export const fetchEvaluations = async (opts: RequestInit = {}) => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/evaluations`, opts);
    return await response.json();
  } catch (error) {
    console.error("Erreur lors de la récupération des évaluations :", error);
    return await getDataFromIndexedDB('evaluations');
  }
};

export const fetchOffices = async (opts: RequestInit = {}) => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/offices`, opts);
    return await response.json();
  } catch (error) {
    console.error("Erreur lors de la récupération des bureaux :", error);
    return await getDataFromIndexedDB('offices');
  }
};

export const fetchEmployees = async (opts: RequestInit = {}) => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/employees`, opts);
    return await response.json();
  } catch (error) {
    console.error("Erreur lors de la récupération des employés :", error);
    return await getDataFromIndexedDB('employees');
  }
};

export const fetchAverages = async (opts: RequestInit = {}) => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/averages`, opts);
    return await response.json();
  } catch (error) {
    console.error("Erreur lors de la récupération des moyennes :", error);
    return await getDataFromIndexedDB('averages');
  }
};

export const fetchReportCards = async (opts: RequestInit = {}) => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/report-cards`, opts);
    return await response.json();
  } catch (error) {
    console.error("Erreur lors de la récupération des bulletins de notes :", error);
    return await getDataFromIndexedDB('reportCards');
  }
};

export const fetchCorrespondencesBooks = async (opts: RequestInit = {}) => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/correspondence-books`, opts);
    return await response.json();
  } catch (error) {
    console.error("Erreur lors de la récupération des carnets de correspondance :", error);
    return await getDataFromIndexedDB('correspondencesBooks');
  }
};

export const fetchCorrespondencesEntries = async (opts: RequestInit = {}) => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/correspondence-entries`, opts);
    return await response.json();
  } catch (error) {
    console.error("Erreur lors de la récupération des entrées de correspondance :", error);
    return await getDataFromIndexedDB('correspondencesEntries');
  }
};

export const fetchHomeroomTeachers = async (opts: RequestInit = {}) => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/homeroom-teachers`, opts);
    return await response.json();
  } catch (error) {
    console.error("Erreur lors de la récupération des professeurs principaux :", error);
    return await getDataFromIndexedDB('homeroomTeachers');
  }
};

export const fetchPresences = async (opts: RequestInit = {}) => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/presences`, opts);
    return await response.json();
  } catch (error) {
    console.error("Erreur lors de la récupération des présences :", error);
    return await getDataFromIndexedDB('presences');
  }
};

// Fonction pour nettoyer le localStorage et migrer vers IndexedDB si nécessaire
export const cleanupLocalStorageAndMigrateToIndexedDB = async () => {
  try {
    // Vérifier s'il y a des données dans localStorage
    const localStorageData = localStorage.getItem("school-store");
    
    if (localStorageData) {
      console.log("Migration des données de localStorage vers IndexedDB...");
      
      try {
        const parsedData = JSON.parse(localStorageData);
        
        // Sauvegarder dans IndexedDB
        await indexedDBStorage.setItem("school-store", parsedData);
        console.log("Migration réussie vers IndexedDB");
        
        // Supprimer de localStorage après migration réussie
        localStorage.removeItem("school-store");
        console.log("LocalStorage nettoyé avec succès");
        
      } catch (parseError) {
        console.error("Erreur lors du parsing des données localStorage:", parseError);
        // Supprimer les données corrompues
        localStorage.removeItem("school-store");
      }
    } else {
      console.log("Aucune donnée à migrer depuis localStorage");
    }
    
    // // Nettoyer également les autres stores qui pourraient utiliser localStorage
    // const themeStoreData = localStorage.getItem("theme-store");
    // const sidebarStoreData = localStorage.getItem("sidebar-store");
    
    // Ces stores peuvent rester dans localStorage car ils sont moins volumineux
    // et n'ont pas besoin de la persistance complexe d'IndexedDB
    console.log("Nettoyage terminé");
    
  } catch (error) {
    console.error("Erreur lors du nettoyage/migration:", error);
    // En cas d'erreur, supprimer quand même le localStorage pour éviter les conflits
    try {
      localStorage.removeItem("school-store");
    } catch (removeError) {
      console.error("Impossible de supprimer school-store du localStorage:", removeError);
    }
  }
};

export const refreshAllData = async () => {
  const refreshPromises = [
    fetchClasses(),
    fetchLevels(),
    fetchAcademicYears(),
    fetchStudents(),
    fetchUsers(),
    fetchRoles(),
    fetchpricing(),
    fetchRegistration(),
    fetchPayment(),
    fetchInstallment(),
    fetchTutors(),
    fetchTransactions(),
    fetchExpenses(),
  ];

  try {
    const results = await Promise.allSettled(refreshPromises);

    const data = {
      classes: results[0].status === "fulfilled" ? results[0].value : [],
      levels: results[1].status === "fulfilled" ? results[1].value : [],
      academicYears: results[2].status === "fulfilled" ? results[2].value : [],
      students: results[3].status === "fulfilled" ? results[3].value : [],
      users: results[4].status === "fulfilled" ? results[4].value : [],
      roles: results[5].status === "fulfilled" ? results[5].value : [],
      pricing: results[6].status === "fulfilled" ? results[6].value : [],
      registrations: results[7].status === "fulfilled" ? results[7].value : [],
      payments: results[8].status === "fulfilled" ? results[8].value : [],
      installments: results[9].status === "fulfilled" ? results[9].value : [],
      tutors: results[10].status === "fulfilled" ? results[10].value : [],
      transactions: results[11].status === "fulfilled" ? results[11].value : [],
      expenses: results[12].status === "fulfilled" ? results[12].value : [],
    };

    // Log des erreurs s'il y en a
    results.forEach((result, index) => {
      if (result.status === "rejected") {
        console.error(`Erreur lors du rafraîchissement de la donnée ${index}:`, result.reason);
      }
    });

    return data;
  } catch (error) {
    console.error("Erreur lors du rafraîchissement global des données:", error);
    throw error;
  }
};