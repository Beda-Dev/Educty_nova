import { create } from "zustand";
import { siteConfig } from "@/config/site";
import { persist, createJSONStorage } from "zustand/middleware";
import {
  AcademicYear,
  Student,
  Role,
  Pricing,
  FeeType,
  Registration,
  User,
  AssignmentType,
  Level,
  Classe,
  Document,
  DocumentType,
  CashRegister,
  Payment,
  Installment,
  Expense,
  ExpenseType,
  Permission,
  InterfaceOTP,
  PaymentMethod,
  ValidationExpense,
  Tutor,
  Transaction,
  CashRegisterSession,
  Setting,
  Matter,
  TypeEvaluation,
  StudentFormData,
  TutorFormData,
  RegistrationFormData,
  PaymentFormData,
  DocumentFormData,
  Period, 
  Demand
} from "@/lib/interface";

// Store pour le thème
interface ThemeStoreState {
  theme: string;
  setTheme: (theme: string) => void;
  radius: number;
  setRadius: (value: number) => void;
  layout: string;
  setLayout: (value: string) => void;
  navbarType: string;
  setNavbarType: (value: string) => void;
  footerType: string;
  setFooterType: (value: string) => void;
  isRtl: boolean;
  setRtl: (value: boolean) => void;
}

export const useThemeStore = create<ThemeStoreState>()(
  persist(
    (set) => ({
      theme: siteConfig.theme,
      setTheme: (theme) => set({ theme }),
      radius: siteConfig.radius,
      setRadius: (value) => set({ radius: value }),
      layout: siteConfig.layout,
      setLayout: (value) => {
        set({ layout: value });

        // Si le nouveau layout est "semibox", définir le sidebarType sur "popover"
        if (value === "semibox") {
          useSidebar.setState({ sidebarType: "popover" });
        }
        if (value === "horizontal") {
          useSidebar.setState({ sidebarType: "classic" });
        }
        if (value === "horizontal") {
          useThemeStore.setState({ navbarType: "sticky" });
        }
      },
      navbarType: siteConfig.navbarType,
      setNavbarType: (value) => set({ navbarType: value }),
      footerType: siteConfig.footerType,
      setFooterType: (value) => set({ footerType: value }),
      isRtl: false,
      setRtl: (value) => set({ isRtl: value }),
    }),
    {
      name: "theme-store",
      storage: createJSONStorage(() => localStorage),
    }
  )
);

// Store pour la sidebar
interface SidebarState {
  collapsed: boolean;
  setCollapsed: (value: boolean) => void;
  sidebarType: string;
  setSidebarType: (value: string) => void;
  subMenu: boolean;
  setSubmenu: (value: boolean) => void;
  sidebarBg: string;
  setSidebarBg: (value: string) => void;
  mobileMenu: boolean;
  setMobileMenu: (value: boolean) => void;
}

export const useSidebar = create<SidebarState>()(
  persist(
    (set) => ({
      collapsed: false,
      setCollapsed: (value) => set({ collapsed: value }),
      sidebarType:
        siteConfig.layout === "semibox" ? "popover" : siteConfig.sidebarType,
      setSidebarType: (value) => {
        set({ sidebarType: value });
      },
      subMenu: false,
      setSubmenu: (value) => set({ subMenu: value }),
      sidebarBg: siteConfig.sidebarBg,
      setSidebarBg: (value) => set({ sidebarBg: value }),
      mobileMenu: false,
      setMobileMenu: (value) => set({ mobileMenu: value }),
    }),
    {
      name: "sidebar-store",
      storage: createJSONStorage(() => localStorage),
    }
  )
);

// Store pour les données scolaires
interface SchoolStore {
  classes: Classe[];
  setClasses: (data: Classe[]) => void;

  levels: Level[];
  setLevels: (data: Level[]) => void;

  academicYears: AcademicYear[];
  setAcademicYears: (data: AcademicYear[]) => void;

  students: Student[];
  setStudents: (data: Student[]) => void;

  assignmentTypes: AssignmentType[];
  setAssignmentTypes: (data: AssignmentType[]) => void;

  cashRegisters: CashRegister[];
  setCashRegisters: (data: CashRegister[]) => void;

  documents: Document[];
  setDocuments: (data: Document[]) => void;

  documentTypes: DocumentType[];
  setDocumentTypes: (data: DocumentType[]) => void;

  expenseTypes: ExpenseType[];
  setExpenseTypes: (data: ExpenseType[]) => void;

  expenses: Expense[];
  setExpenses: (data: Expense[]) => void;

  payments: Payment[];
  setPayments: (data: Payment[]) => void;

  installements: Installment[];
  setInstallments: (data: Installment[]) => void;

  feeTypes: FeeType[];
  setFeeTypes: (data: FeeType[]) => void;

  settings: Setting[];
  setSettings: (data: Setting[]) => void;

  users: User[];
  setUsers: (data: User[]) => void;

  roles: Role[];
  setRoles: (data: Role[]) => void;

  pricing: Pricing[];
  setPricing: (data: Pricing[]) => void;

  registrations: Registration[];
  setRegistration: (data: Registration[]) => void;

  userOnline: User | null;
  setUserOnline: (data: User | null) => void;

  reRegistration: Registration | null;
  setReRegistrations: (data: Registration | null) => void;

  academicYearCurrent: AcademicYear;
  setAcademicYearCurrent: (data: AcademicYear) => void;

  permissions: Permission[];
  setPermission: (data: Permission[]) => void;

  CodeOTP: InterfaceOTP | null;
  setCodeOTP: (data: InterfaceOTP | null) => void;

  methodPayment: PaymentMethod[];
  setmethodPayment: (data: PaymentMethod[]) => void;

  validationExpenses: ValidationExpense[];
  setValidationExpenses: (data: ValidationExpense[]) => void;

  tutors: Tutor[];
  setTutors: (data: Tutor[]) => void;

  transactions: Transaction[];
  setTransactions: (data: Transaction[]) => void;

  cashRegisterSessions: CashRegisterSession[];
  setCashRegisterSessions: (data: CashRegisterSession[]) => void;

  cashRegisterSessionCurrent: CashRegisterSession | null;
  setCashRegisterSessionCurrent: (data: CashRegisterSession | null) => void;

  newRegistration: Registration | null;
  setNewRegistrations: (data: Registration | null) => void;

  cashRegisterCurrent: CashRegister | null;
  setCashRegisterCurrent: (data: CashRegister | null) => void;

  Newstudent: Student | null;
  setNewStudent: (data: Student | null) => void;

  matters: Matter[];
  setMatters: (data: Matter[]) => void;

  typeEvaluations: TypeEvaluation[];
  setTypeEvaluations: (data: TypeEvaluation[]) => void;

  periods: Period[];
  setPeriods: (data: Period[]) => void;

  demands: Demand[];
  setDemands: (data: Demand[]) => void;

  // Registration store data
  currentStep: number;
  setCurrentStep: (step: number) => void;

  studentData: StudentFormData | null;
  setStudentData: (data: StudentFormData) => void;

  selectedTutors: (Tutor & { is_tutor_legal: boolean })[];
  newTutors: TutorFormData[];
  setSelectedTutors: (tutors: (Tutor & { is_tutor_legal: boolean })[]) => void;
  setNewTutors: (tutors: TutorFormData[]) => void;
  addNewTutor: (tutor: TutorFormData) => void;
  removeNewTutor: (index: number) => void;

  registrationData: RegistrationFormData | null;
  setRegistrationData: (data: RegistrationFormData) => void;

  availablePricing: Pricing[];
  setAvailablePricing: (pricing: Pricing[]) => void;

  paymentsForm: PaymentFormData[];
  setPaymentsForm: (payments: PaymentFormData[]) => void;
  paidAmount: number;
  setPaidAmount: (amount: number) => void;

  documentsForm: DocumentFormData[];
  setDocumentsForm: (documents: DocumentFormData[]) => void;
  addDocumentForm: (document: DocumentFormData) => void;
  removeDocumentForm: (index: number) => void;

  resetRegistration: () => void;
}

export const useSchoolStore = create<SchoolStore>()(
  persist(
    (set) => ({
      classes: [],
      setClasses: (data) => set({ classes: data }),

      levels: [],
      setLevels: (data) => set({ levels: data }),

      academicYears: [],
      setAcademicYears: (data) => set({ academicYears: data }),

      students: [],
      setStudents: (data) => set({ students: data }),

      assignmentTypes: [],
      setAssignmentTypes: (data) => set({ assignmentTypes: data }),

      cashRegisters: [],
      setCashRegisters: (data) => set({ cashRegisters: data }),

      documents: [],
      setDocuments: (data) => set({ documents: data }),

      documentTypes: [],
      setDocumentTypes: (data) => set({ documentTypes: data }),

      expenseTypes: [],
      setExpenseTypes: (data) => set({ expenseTypes: data }),

      payments: [],
      setPayments: (data) => set({ payments: data }),

      installements: [],
      setInstallments: (data) => set({ installements: data }),

      expenses: [],
      setExpenses: (data) => set({ expenses: data }),

      feeTypes: [],
      setFeeTypes: (data) => set({ feeTypes: data }),

      settings: [],
      setSettings: (data) => set({ settings: data }),

      users: [],
      setUsers: (data) => set({ users: data }),

      roles: [],
      setRoles: (data) => set({ roles: data }),

      pricing: [],
      setPricing: (data) => set({ pricing: data }),

      registrations: [],
      setRegistration: (data) => set({ registrations: data }),

      userOnline: null,
      setUserOnline: (data) => set({ userOnline: data }),

      reRegistration: null,
      setReRegistrations: (data) => set({ reRegistration: data }),

      academicYearCurrent: {} as AcademicYear,
      setAcademicYearCurrent: (data) => set({ academicYearCurrent: data }),

      permissions: [],
      setPermission: (data) => set({ permissions: data }),

      CodeOTP: null,
      setCodeOTP: (data) => set({ CodeOTP: data }),

      methodPayment: [],
      setmethodPayment: (data: PaymentMethod[]) => set({ methodPayment: data }),

      validationExpenses: [],
      setValidationExpenses: (data: ValidationExpense[]) => set({ validationExpenses: data }),

      tutors: [],
      setTutors: (data: Tutor[]) => set({ tutors: data }),

      transactions: [],
      setTransactions: (data: Transaction[]) => set({ transactions: data }),

      cashRegisterSessions: [],
      setCashRegisterSessions: (data: CashRegisterSession[]) => set({ cashRegisterSessions: data }),

      cashRegisterSessionCurrent: null,
      setCashRegisterSessionCurrent: (data: CashRegisterSession | null) => set({ cashRegisterSessionCurrent: data }),

      newRegistration: null,
      setNewRegistrations: (data: Registration | null) => set({ newRegistration: data }),

      cashRegisterCurrent: null,
      setCashRegisterCurrent: (data: CashRegister | null) => set({ cashRegisterCurrent: data }),

      Newstudent: null,
      setNewStudent: (data: Student | null) => set({ Newstudent: data }),

      matters: [],
      setMatters: (data: Matter[]) => set({ matters: data }),

      typeEvaluations: [],
      setTypeEvaluations: (data: TypeEvaluation[]) => set({ typeEvaluations: data }),

      periods: [],
      setPeriods: (data: Period[]) => set({ periods: data }),

      demands: [],
      setDemands: (data: Demand[]) => set({ demands: data }),

      // Registration store implementation
      currentStep: 1,
      setCurrentStep: (step) => set({ currentStep: step }),

      studentData: null,
      setStudentData: (data) => set({ studentData: data }),

      selectedTutors: [],
      newTutors: [],
      setSelectedTutors: (tutors) => set({ selectedTutors: tutors }),
      setNewTutors: (tutors) => set({ newTutors: tutors }),
      addNewTutor: (tutor) => set((state) => ({ newTutors: [...state.newTutors, tutor] })),
      removeNewTutor: (index) =>
        set((state) => ({
          newTutors: state.newTutors.filter((_, i) => i !== index),
        })),

      registrationData: null,
      setRegistrationData: (data) => set({ registrationData: data }),

      availablePricing: [],
      setAvailablePricing: (pricing) => set({ availablePricing: pricing }),

      paymentsForm: [],
      setPaymentsForm: (payments) => set({ paymentsForm: payments }),
      paidAmount: 0,
      setPaidAmount: (amount) => set({ paidAmount: amount }),

      documentsForm: [],
      setDocumentsForm: (documents) => set({ documentsForm: documents }),
      addDocumentForm: (document) => set((state) => ({ documentsForm: [...state.documentsForm, document] })),
      removeDocumentForm: (index) =>
        set((state) => ({
          documentsForm: state.documentsForm.filter((_, i) => i !== index),
        })),

      resetRegistration: () =>
        set({
          currentStep: 1,
          studentData: null,
          selectedTutors: [],
          newTutors: [],
          registrationData: null,
          availablePricing: [],
          paymentsForm: [],
          paidAmount: 0,
          documentsForm: [],
        }),
    }),
    {
      name: "school-store",
      storage: createJSONStorage(() => localStorage),
    }
  )
);