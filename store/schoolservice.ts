export const fetchClasses = async (opts: RequestInit = {}) => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/classe`, opts);
    return await response.json();
  } catch (error) {
    console.error("Erreur lors de la récupération des classes :", error);
    const storedData = localStorage.getItem("school-store");
    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData);
        console.log("classes récupérées depuis localStorage : ", parsedData);
        return parsedData.state.classes || [];
      } catch (error) {
        console.error("Erreur lors du parsing des données : ", error);
      }
    } else {
      return [];
    }
  }
};

export const fetchLevels = async (opts: RequestInit = {}) => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/level`, opts);
    return await response.json();
  } catch (error) {
    console.error("Erreur lors de la récupération des niveaux :", error);
    const storedData = localStorage.getItem("school-store");
    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData);
        console.log(
          "niveau récupérées depuis localStorage : ",
          parsedData.state.levels
        );
        return parsedData.state.levels || [];
      } catch (error) {
        console.error("Erreur lors du parsing des données : ", error);
      }
    } else {
      return [];
    }
  }
};

export const fetchAcademicYears = async (opts: RequestInit = {}) => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/academicYear`, opts);
    return await response.json();
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des années académiques :",
      error
    );
    const storedData = localStorage.getItem("school-store");
    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData);
        console.log(
          "années académiques récupérées depuis localStorage : ",
          parsedData.state.academicYear
        );
        return parsedData.state.academicYears || [];
      } catch (error) {
        console.error("Erreur lors du parsing des données : ", error);
      }
    } else {
      return [];
    }
  }
};

export const fetchStudents = async (opts: RequestInit = {}) => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/student`, opts);
    return await response.json();
  } catch (error) {
    console.error("Erreur lors de la récupération des élèves :", error);
    const storedData = localStorage.getItem("school-store");
    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData);
        console.log(
          "eleves récupérées depuis localStorage : ",
          parsedData.state.students
        );
        return parsedData.state.students || [];
      } catch (error) {
        console.error("Erreur lors du parsing des données : ", error);
      }
    } else {
      return [];
    }
  }
};

export const fetchUsers = async (opts: RequestInit = {}) => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users`, opts);
    return await response.json();
  } catch (error) {
    console.error("Erreur lors de la récupération des utilisateur :", error);
    const storedData = localStorage.getItem("school-store");
    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData);
        console.log(
          "utilisateur récupérées depuis localStorage : ",
          parsedData.state.users
        );
        return parsedData.state.users || [];
      } catch (error) {
        console.error("Erreur lors du parsing des données : ", error);
      }
    } else {
      return [];
    }
  }
};

export const fetchRoles = async (opts: RequestInit = {}) => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/role`, opts);
    return await response.json();
  } catch (error) {
    console.error("Erreur lors de la récupération des roles :", error);
    const storedData = localStorage.getItem("school-store");
    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData);
        console.log(
          "roles récupérées depuis localStorage : ",
          parsedData.state.roles
        );
        return parsedData.state.roles || [];
      } catch (error) {
        console.error("Erreur lors du parsing des données : ", error);
      }
    } else {
      return [];
    }
  }
};

export const fetchpricing = async (opts: RequestInit = {}) => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/pricing`, opts);
    return await response.json();
  } catch (error) {
    console.error("Erreur lors de la récupération des tarification :", error);
    const storedData = localStorage.getItem("school-store");
    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData);
        console.log(
          "tarification récupérées depuis localStorage : ",
          parsedData.state.pricing
        );
        return parsedData.state.pricing || [];
      } catch (error) {
        console.error("Erreur lors du parsing des données : ", error);
      }
    } else {
      return [];
    }
  }
};

export const fetchRegistration = async (opts: RequestInit = {}) => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/registration`, opts);
    return await response.json();
  } catch (error) {
    console.error("Erreur lors de la récupération des inscription :", error);
    const storedData = localStorage.getItem("school-store");
    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData);
        console.log(
          "inscription récupérées depuis localStorage : ",
          parsedData.state.registrations
        );
        return parsedData.state.registrations || [];
      } catch (error) {
        console.error("Erreur lors du parsing des données : ", error);
      }
    } else {
      return [];
    }
  }
};

export const fetchAssignmentType = async (opts: RequestInit = {}) => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/assignmentType`, opts
    );
    return await response.json();
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des type de statut des eleve :",
      error
    );
    const storedData = localStorage.getItem("school-store");
    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData);
        console.log(
          "statut des eleve récupérées depuis localStorage : ",
          parsedData.state.assigmentTypes
        );
        return parsedData.state.assigmentTypes || [];
      } catch (error) {
        console.error("Erreur lors du parsing des données : ", error);
      }
    } else {
      return [];
    }
  }
};

export const fetchFeeType = async (opts: RequestInit = {}) => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/feeType`, opts);
    return await response.json();
  } catch (error) {
    console.error("Erreur lors de la récupération des type de frais :", error);
    const storedData = localStorage.getItem("school-store");
    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData);
        console.log(
          "type de frais récupérées depuis localStorage : ",
          parsedData.state.feeTypes
        );
        return parsedData.state.feeTypes || [];
      } catch (error) {
        console.error("Erreur lors du parsing des données : ", error);
      }
    } else {
      return [];
    }
  }
};

export const fetchDocumentType = async (opts: RequestInit = {}) => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/documentType`, opts);
    return await response.json();
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des types de document :",
      error
    );
    const storedData = localStorage.getItem("school-store");
    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData);
        console.log(
          "des types de document récupérées depuis localStorage : ",
          parsedData.state.documentTypes
        );
        return parsedData.state.documentTypes || [];
      } catch (error) {
        console.error("Erreur lors du parsing des données : ", error);
      }
    } else {
      return [];
    }
  }
};

export const fetchDocument = async (opts: RequestInit = {}) => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/document`, opts);
    return await response.json();
  } catch (error) {
    console.error("Erreur lors de la récupération des documents :", error);
    const storedData = localStorage.getItem("school-store");
    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData);
        console.log(
          "documents récupérées depuis localStorage : ",
          parsedData.state.documents
        );
        return parsedData.state.documents || [];
      } catch (error) {
        console.error("Erreur lors du parsing des données : ", error);
      }
    } else {
      return [];
    }
  }
};

export const fetchPayment = async (opts: RequestInit = {}) => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/payment`, opts);
    return await response.json();
  } catch (error) {
    console.error("Erreur lors de la récupération des payments :", error);
    const storedData = localStorage.getItem("school-store");
    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData);
        console.log(
          "payments récupérées depuis localStorage : ",
          parsedData.state.payments
        );
        return parsedData.state.payments || [];
      } catch (error) {
        console.error("Erreur lors du parsing des données : ", error);
      }
    } else {
      return [];
    }
  }
};

export const fetchInstallment = async (opts: RequestInit = {}) => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/installment`, opts);
    return await response.json();
  } catch (error) {
    console.error("Erreur lors de la récupération des versements :", error);
    const storedData = localStorage.getItem("school-store");
    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData);
        console.log(
          "versements récupérées depuis localStorage : ",
          parsedData.state.installements
        );
        return parsedData.state.installements || [];
      } catch (error) {
        console.error("Erreur lors du parsing des données : ", error);
      }
    } else {
      return [];
    }
  }
};

export const fetchCashRegister = async (opts: RequestInit = {}) => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/cashRegister`, opts);
    return await response.json();
  } catch (error) {
    console.error("Erreur lors de la récupération des caisse :", error);
    const storedData = localStorage.getItem("school-store");
    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData);
        console.log(
          "caisse  récupérées depuis localStorage : ",
          parsedData.state.cashRegisters
        );
        return parsedData.state.cashRegisters || [];
      } catch (error) {
        console.error("Erreur lors du parsing des données : ", error);
      }
    } else {
      return [];
    }
  }
};

export const fetchSetting = async (opts: RequestInit = {}) => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/setting`, opts);
    return await response.json();
  } catch (error) {
    console.error("Erreur lors de la récupération des parametres :", error);
    const storedData = localStorage.getItem("school-store");
    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData);
        console.log(
          "parametres récupérées depuis localStorage : ",
          parsedData.state.settings
        );
        return parsedData.state.settings || [];
      } catch (error) {
        console.error("Erreur lors du parsing des données : ", error);
      }
    } else {
      return [];
    }
  }
};

export const fetchExpenseType = async (opts: RequestInit = {}) => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/expenseType`, opts);
    return await response.json();
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des type de depense :",
      error
    );
    const storedData = localStorage.getItem("school-store");
    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData);
        console.log(
          "type de depense récupérées depuis localStorage : ",
          parsedData.state.expenseTypes
        );
        return parsedData.state.expenseTypes || [];
      } catch (error) {
        console.error("Erreur lors du parsing des données : ", error);
      }
    } else {
      return [];
    }
  }
};

export const fetchExpenses = async (opts: RequestInit = {}) => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/expense`, opts);
    return await response.json();
  } catch (error) {
    console.error("Erreur lors de la récupération des depenses :", error);
    const storedData = localStorage.getItem("school-store");
    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData);
        console.log(
          "depenses récupérées depuis localStorage : ",
          parsedData.state.expenses
        );
        return parsedData.state.expenses || [];
      } catch (error) {
        console.error("Erreur lors du parsing des données : ", error);
      }
    } else {
      return [];
    }
  }
};

export const fetchPermissions = async (opts: RequestInit = {}) => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/permission`, opts);
    return await response.json();
  } catch (error) {
    console.error("Erreur lors de la récupération des permission :", error);
    const storedData = localStorage.getItem("school-store");
    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData);
        console.log(
          "permission récupérées depuis localStorage : ",
          parsedData.state.permissions
        );
        return parsedData.state.permissions || [];
      } catch (error) {
        console.error("Erreur lors du parsing des données : ", error);
      }
    } else {
      return [];
    }
  }
};

export const fetchPaymentMethods = async (opts: RequestInit = {}) => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/paymentMethod`, opts
    );
    return await response.json();
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des methode de paiement :",
      error
    );
    const storedData = localStorage.getItem("school-store");
    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData);
        console.log(
          "methode de paiement récupérées depuis localStorage : ",
          parsedData.state.methodPayment
        );
        return parsedData.state.methodPayment || [];
      } catch (error) {
        console.error("Erreur lors du parsing des données : ", error);
      }
    } else {
      return [];
    }
  }
};

export const fetchValidationExpenses = async (opts: RequestInit = {}) => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/validationExpense`, opts
    );
    return await response.json();
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des validation de depenses :",
      error
    );
    const storedData = localStorage.getItem("school-store");
    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData);
        console.log(
          "validation de depensest récupérées depuis localStorage : ",
          parsedData.state.validationExpenses
        );
        return parsedData.state.validationExpenses || [];
      } catch (error) {
        console.error("Erreur lors du parsing des données : ", error);
      }
    } else {
      return [];
    }
  }
};

export const fetchTutors = async (opts: RequestInit = {}) => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/tutor`, opts);
    return await response.json();
  } catch (error) {
    console.error("Erreur lors de la récupération des parents :", error);
    const storedData = localStorage.getItem("school-store");
    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData);
        console.log(
          "parents récupérées depuis localStorage : ",
          parsedData.state.tutors
        );
        return parsedData.state.tutors || [];
      } catch (error) {
        console.error("Erreur lors du parsing des données : ", error);
      }
    } else {
      return [];
    }
  }
};

export const fetchTransactions = async (opts: RequestInit = {}) => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/transaction`, opts);
    return await response.json();
  } catch (error) {
    console.error("Erreur lors de la récupération des transactions :", error);
    const storedData = localStorage.getItem("school-store");
    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData);
        console.log(
          "transaction récupérées depuis localStorage : ",
          parsedData.state.transactions
        );
        return parsedData.state.transactions || [];
      } catch (error) {
        console.error("Erreur lors du parsing des données : ", error);
      }
    } else {
      return [];
    }
  }
};

export const fetchCashRegisterSessions = async (opts: RequestInit = {}) => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/cashRegisterSession`, opts
    );
    return await response.json();
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des sessions de caisse :",
      error
    );
    const storedData = localStorage.getItem("school-store");
    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData);
        console.log(
          "sessions de caisse récupérées depuis localStorage : ",
          parsedData.state.cashRegisterSessions
        );
        return parsedData.state.cashRegisterSessions || [];
      } catch (error) {
        console.error("Erreur lors du parsing des données : ", error);
      }
    } else {
      return [];
    } 
  }
};

export const fetchMatters = async (opts: RequestInit = {}) => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/matter`, opts);
    return await response.json();
  } catch (error) {
    console.error("Erreur lors de la récupération des matieres :", error);
    const storedData = localStorage.getItem("school-store");
    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData);
        console.log(
          "matieres récupérées depuis localStorage : ",
          parsedData.state.matters
        );
        return parsedData.state.matters || [];
      } catch (error) {
        console.error("Erreur lors du parsing des données : ", error);
      }
    } else {
      return [];
    }
  }
};

export const fetchTypeEvaluations = async (opts: RequestInit = {}) => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/typeNote`, opts);
    return await response.json();
  } catch (error) {
    console.error("Erreur lors de la récupération type d'evaluation :", error);
    const storedData = localStorage.getItem("school-store");
    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData);
        console.log(
          "type d'evaluation récupérées depuis localStorage : ",
          parsedData.state.typeEvaluations
        );
        return parsedData.state.typeEvaluations || [];
      } catch (error) {
        console.error("Erreur lors du parsing des données : ", error);
      }
    } else {
      return [];
    }
  }
};

export const fetchTypePeriods = async (opts: RequestInit = {}) => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/typePeriod`, opts);
    return await response.json();
  } catch (error) {
    console.error("Erreur lors de la récupération des type de periodes :", error);
    const storedData = localStorage.getItem("school-store");
    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData);
        console.log(
          "periodes récupérées depuis localStorage : ",
          parsedData.state.typePeriods
        );
        return parsedData.state.typePeriods || [];
      } catch (error) {
        console.error("Erreur lors du parsing des données : ", error);
      }
    } else {
      return [];
    }
  }
};

export const fetchPeriods = async (opts: RequestInit = {}) => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/period`, opts);
    return await response.json();
  } catch (error) {
    console.error("Erreur lors de la récupération des periodes :", error);
    const storedData = localStorage.getItem("school-store");
    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData);
        console.log(
          "periodes récupérées depuis localStorage : ",
          parsedData.state.periods
        );
        return parsedData.state.periods || [];
      } catch (error) {
        console.error("Erreur lors du parsing des données : ", error);
      }
    } else {
      return [];
    }
  }
};

export const fetchDemands = async (opts: RequestInit = {}) => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/demand`, opts);
    return await response.json();
  } catch (error) {
    console.error("Erreur lors de la récupération des demandes :", error);
    const storedData = localStorage.getItem("school-store");
    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData);
        console.log(
          "demandes récupérées depuis localStorage : ",
          parsedData.state.demands
        );
        return parsedData.state.demands || [];
      } catch (error) {
        console.error("Erreur lors du parsing des données : ", error);
      }
    } else {
      return [];
    }
  }
};

export const fetchProfessor = async (opts: RequestInit = {}) => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/professor`, opts);
    return await response.json();
  } catch (error) {
    console.error("Erreur lors de la récupération des professeur :", error);
    const storedData = localStorage.getItem("school-store");
    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData);
        console.log(
          "assignments récupérées depuis localStorage : ",
          parsedData.state.professor
        );
        return parsedData.state.professor || [];
      } catch (error) {
        console.error("Erreur lors du parsing des données : ", error);
      }
    } else {
      return [];
    }
  }
};

export const fetchSeries = async (opts: RequestInit = {}) => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/serie`, opts);
    return await response.json();
  } catch (error) {
    console.error("Erreur lors de la récupération des séries :", error);
    const storedData = localStorage.getItem("school-store");
    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData);
        console.log(
          "séries récupérées depuis localStorage : ",
          parsedData.state.series
        );
        return parsedData.state.series || [];
      } catch (error) {
        console.error("Erreur lors du parsing des données : ", error);
      }
    } else {
      return [];
    }
  }
};

export const fetchTimetable = async (opts: RequestInit = {}) => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/timetable`, opts);
    return await response.json();
  } catch (error) {
    console.error("Erreur lors de la récupération des emploi du temps :", error);
    const storedData = localStorage.getItem("school-store");
    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData);
        console.log(
          "assignments récupérées depuis localStorage : ",
          parsedData.state.timetables
        );
        return parsedData.state.timetables || [];
      } catch (error) {
        console.error("Erreur lors du parsing des données : ", error);
      }
    } else {
      return [];
    }
  }
};

export const fetchNotes = async (opts: RequestInit = {}) => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/note`, opts);
    return await response.json();
  } catch (error) {
    console.error("Erreur lors de la récupération des notes :", error);
    const storedData = localStorage.getItem("school-store");
    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData);
        console.log(
          "notes récupérées depuis localStorage : ",
          parsedData.state.notes
        );
        return parsedData.state.notes || [];
      } catch (error) {
        console.error("Erreur lors du parsing des données : ", error);
      }
    } else {
      return [];
    }
  }
};

export const fetchCoefficient = async (opts: RequestInit = {}) => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/coefficient`, opts);
    return await response.json();
  } catch (error) {
    console.error("Erreur lors de la récupération des coefficients :", error);
    const storedData = localStorage.getItem("school-store");
    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData);
        console.log(
          "coefficients récupérées depuis localStorage : ",
          parsedData.state.coefficients
        );
        return parsedData.state.coefficients || [];
      } catch (error) {
        console.error("Erreur lors du parsing des données : ", error);
      }
    } else {
      return [];
    }
  }
};

export const fetchEvaluations = async (opts: RequestInit = {}) => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/evaluations`, opts);
    return await response.json();
  } catch (error) {
    console.error("Erreur lors de la récupération des évaluations :", error);
    const storedData = localStorage.getItem("school-store");
    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData);
        console.log(
          "évaluations récupérées depuis localStorage : ",
          parsedData.state.evaluations
        );
        return parsedData.state.evaluations || [];
      } catch (error) {
        console.error("Erreur lors du parsing des données : ", error);
      }
    } else {
      return [];
    }
  }
};

export const fetchOffices = async (opts: RequestInit = {}) => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/offices`, opts);
    return await response.json();
  } catch (error) {
    console.error("Erreur lors de la récupération des fonction :", error);
    const storedData = localStorage.getItem("school-store");
    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData);
        console.log(
          "bureaux récupérés depuis localStorage : ",
          parsedData.state.offices
        );
        return parsedData.state.offices || [];
      } catch (error) {
        console.error("Erreur lors du parsing des données : ", error);
      }
    } else {
      return [];
    }
  }
};

export const fetchEmployees = async (opts: RequestInit = {}) => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/employee`,
      opts
    );
    return await response.json();
  } catch (error) {
    console.error("Erreur lors de la récupération des employés :", error);
    const storedData = localStorage.getItem("school-store");
    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData);
        console.log("employés récupérés depuis localStorage : ", parsedData.state.employees);
        return parsedData.state.employees || [];
      } catch (error) {
        console.error("Erreur lors du parsing des données : ", error);
      }
    } else {
      return [];
    }
  }
};

export const fetchAverages = async (opts: RequestInit = {}) => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/averages`,
      opts
    );
    return await response.json();
  } catch (error) {
    console.error("Erreur lors de la récupération des moyennes :", error);
    const storedData = localStorage.getItem("school-store");
    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData);
        console.log("moyennes récupérées depuis localStorage : ", parsedData.state.averages);
        return parsedData.state.averages || [];
      } catch (error) {
        console.error("Erreur lors du parsing des données : ", error);
      }
    } else {
      return [];
    }
  }
};

export const fetchReportCards = async (opts: RequestInit = {}) => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/report-cards`,
      opts
    );
    return await response.json();
  } catch (error) {
    console.error("Erreur lors de la récupération des bulletins de notes :", error);
    const storedData = localStorage.getItem("school-store");
    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData);
        console.log("bulletins de notes récupérés depuis localStorage : ", parsedData.state.reportCards);
        return parsedData.state.reportCards || [];
      } catch (error) {
        console.error("Erreur lors du parsing des données : ", error);
      }
    } else {
      return [];
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
  ]

  try {
    const results = await Promise.allSettled(refreshPromises)

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
    }

    // Log des erreurs s'il y en a
    results.forEach((result, index) => {
      if (result.status === "rejected") {
        console.error(`Erreur lors du rafraîchissement de la donnée ${index}:`, result.reason)
      }
    })

    return data
  } catch (error) {
    console.error("Erreur lors du rafraîchissement global des données:", error)
    throw error
  }
}






