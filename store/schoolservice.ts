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
  
  
