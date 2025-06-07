// for calendar
export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  allDay: boolean;
  extendedProps: {
    calendar: string;
  };
}

export interface CalendarCategory {
  label: string;
  value: string;
  activeClass?: string;
  className?: string;
}

export interface PaymentMethod {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
  payments?: Payment[];
}

export interface Permission {
  id: number;
  name: string;
  guard_name: string;
  created_at: string;
  updated_at: string;
}

export interface AcademicYear {
  id: number;
  label: string;
  active: number;
  created_at: string;
  updated_at: string;
  start_date: string;
  end_date: string;
  isCurrent: number;
}

export interface FormatedAcademicYear {
  id: number;
  year: string;
  start: string;
  end: string;
  active: number;
  created_at: string;
  updated_at: string;
}

export interface RegistrationInStudent {
  id: number;
  class_id: number;
  academic_year_id: number;
  student_id: number;
  registration_date: string;
  created_at: string;
  updated_at: string;
}

export interface Level {
  id: number;
  label: string;
  slug: string;
  active: number;
  created_at: string;
  updated_at: string;
  class_count: number;
}

export interface Role {
  id: number;
  name: string;
  guard_name: string;
  created_at: string;
  updated_at: string;
  pivot: {
    model_type: string;
    model_id: number;
    role_id: number;
  };
  permissions?: Permission[];
}

export interface User {
  id: number;
  hierarchical_id?: number;
  name: string;
  email: string;
  email_verified_at: null;
  created_at: string;
  updated_at: string;
  roles: Role[];
  superior?: null;
  subordinates?: UserSingle[];
  avatar?: string | null;
  permissions?: Permission[];
  permissionNames?: string[];
}

export interface UserSingle {
  id: number;
  hierarchical_id?: number;
  name: string;
  email: string;
  email_verified_at: null;
  created_at: string;
  updated_at: string;
  superior?: null;
  subordinates?: UserSingle[];
  avatar?: string | null;
}

export type StudentPhoto = string | FileOrStored | null;

export interface Student {
  id: number;
  assignment_type_id: number;
  registration_number: string;
  name: string;
  first_name: string;
  birth_date: string;
  status: string;
  active: number;
  created_at: string;
  updated_at: string;
  photo: StudentPhoto;
  sexe: string;
  assignment_type: AssignmentType;
  documents: Document[];
  payments: Payment[];
  registrations: Registration[];
  tutors?: {
    id: number;
    name: string;
    first_name: string;
    phone_number: string;
    sexe: string;
    type_tutor: string;
    created_at: string;
    updated_at: string;
    pivot: {
      tutor_id: number;
      student_id: number;
      is_tutor_legal: 0 | 1;
      created_at: string;
      updated_at: string;
    };
  }[];
}

export interface StudentOnly {
  id: number;
  assignment_type_id: number;
  registration_number: string;
  name: string;
  first_name: string;
  birth_date: string;
  status: string;
  photo: StudentPhoto;
  active: number;
  created_at: string;
  updated_at: string;
  sexe: string;
}

export interface FeeType {
  id: number;
  label: string;
  slug: string;
  active: number;
  created_at: string;
  updated_at: string;
}

export interface AssignmentType {
  id: number;
  label: string;
  slug: string;
  active: number;
  created_at: string;
  updated_at: string;
}

export interface Pricing {
  id: number;
  assignment_type_id: number;
  academic_years_id: number;
  level_id: number;
  fee_type_id: number;
  label: string;
  amount: string;
  active: number;
  created_at: string;
  updated_at: string;
  assignment_type: AssignmentType;
  academic_year: AcademicYear;
  level: Level;
  fee_type: FeeType;
  installments?: Installment[];
}

export interface Classe {
  id: number;
  level_id: number;
  label: string;
  student_number: string;
  max_student_number: string;
  active: number;
  created_at: string;
  updated_at: string;
  level?: Level;
}

export interface Registration {
  id: number;
  class_id: number;
  academic_year_id: number;
  student_id: number;
  registration_date: string;
  created_at: string;
  updated_at: string;
  classe: Classe;
  academic_year: AcademicYear;
  student: StudentOnly;
}

export interface RegistrationMerge {
  id: number;
  class_id: number;
  academic_year_id: number;
  student_id: number;
  registration_date: string;
  created_at: string;
  updated_at: string;
  classe: Classe;
  academic_year: AcademicYear;
  student: Student;
}

export interface DocumentType {
  id: number;
  name: string;
  slug: string;
  active: number;
  created_at: string;
  updated_at: string;
}

export interface Document {
  id: number;
  document_type_id: number;
  student_id: number;
  label: string;
  active: number;
  created_at: string;
  updated_at: string;
  path: string | null;
  document_type: DocumentType;
  student: StudentOnly;
}

export interface Installment {
  id: number;
  pricing_id: number;
  amount_due: string;
  due_date: string;
  status: string;
  created_at: string;
  updated_at: string;
  pricing: Pricing;
}

export interface CashRegister {
  id: number;
  cash_register_number: string;
  active: number;
  created_at: string;
  updated_at: string;
}
export interface Payment {
  id: number;
  student_id: number;
  installment_id: number;
  cash_register_id: number;
  cashier_id: number;
  amount: string;
  created_at: string;
  updated_at: string;
  student: Student;
  installment: Installment;
  cash_register: CashRegister;
  cashier: UserSingle;
  transaction_id?: number;
  payment_method?: PaymentMethod[];
}

export interface ExpenseType {
  id: number;
  name: string;
  slug: string;
  active: number;
  created_at: string;
  updated_at: string;
}

export interface Expense {
  id: number;
  expense_type_id: number;
  cash_register_id: number;
  label: string;
  amount: string;
  expense_date: string;
  created_at: string;
  updated_at: string;
  expense_type: ExpenseType;
  cash_register: CashRegister;
  transaction_id?: number;
}

export interface InterfaceOTP {
  otp: number;
  email: string;
  expiresAt: string;
}

export interface CashRegisterSession {
  id: number;
  user_id: number;
  cash_register_id: number;
  opening_date: string;
  closing_date: string;
  opening_amount: string;
  closing_amount: string;
  status: "closed" | "open";
  created_at: string;
  updated_at: string;
  user: UserSingle;
  cash_register: CashRegister;
}

export interface Tutor {
  id: number;
  name: string;
  first_name: string;
  phone_number: string;
  sexe: string;
  type_tutor: string;
  created_at: string;
  updated_at: string;
  students?: {
    id: number;
    assignment_type_id: number;
    registration_number: string;
    name: string;
    first_name: string;
    birth_date: string;
    tutor_name: string;
    tutor_first_name: string;
    tutor_number: string;
    status: string;
    photo: string;
    sexe: string;
    pivot: {
      tutor_id: number;
      student_id: number;
      is_tutor_legal: 0 | 1;
      created_at: string;
      updated_at: string;
    };
  }[];
}

export interface ValidationExpense {
  id: number;
  user_id: number;
  expense_id: number;
  validation_date: string;
  comment: string;
  validation_order: number;
  validation_status: string;
  created_at: string;
  updated_at: string;
  user?: User;
  expense?: Expense;
}

export interface Transaction {
  id: number;
  user_id: number;
  cash_register_session_id: number;
  transaction_date: string;
  total_amount: string;
  transaction_type: string;
  created_at: string;
  updated_at: string;
  user?: User;
  cash_register_session?: CashRegisterSession;
}

export interface Setting {
  id: number;
  registration_number_format: string;
  created_at: string; // ou Date si vous convertissez les dates
  updated_at: string; // ou Date si vous convertissez les dates
  establishment_phone_1: string;
  establishment_phone_2: string | null;
  establishment_logo: string | null; // URL ou chemin du fichier
  establishment_name: string;
  approval_number: string | null;
  status: string;
  address: string;
  email: string | null;
  longitude: string | number | null; // plus précis que string pour les coordonnées
  latitude: string | number | null; // plus précis que string pour les coordonnées
  expense_approval_level: number;
  primary_validator: string | null;
  currency: string | null;
}

export interface Matter {
  id: number;
  name: string;
  coefficient: string;
  active: number;
  created_at: string;
  updated_at: string;
}

export interface TypeEvaluation {
  id: number;
  label: string;
  created_at: string;
  updated_at: string;
}


// interface liée au processus d'inscription

interface StoredFileReference {
  fileId: string // ID du fichier dans IndexedDB
  originalName: string
  size: number
  type: string
  isRestored?: boolean // Flag pour indiquer si le fichier a été restauré
}

export interface FileOrStored {
  file?: File // Fichier natif
  stored?: StoredFileReference // Référence vers IndexedDB
}


export interface StudentFormData {
  assignment_type_id: number
  registration_number: string
  name: string
  first_name: string
  birth_date: string
  status: string
  photo?: File | null | FileOrStored
  sexe: string
}

export interface TutorFormData {
  name: string
  first_name: string
  phone_number: string
  sexe: string
  type_tutor: string
  is_tutor_legal: boolean
}

export interface RegistrationFormData {
  class_id: number
  academic_year_id: number
  student_id: number
  registration_date: string
}

export interface PaymentFormData {
  student_id: string
  installment_id: string
  cash_register_id: string
  cashier_id: string
  amount: number
  transaction_id: string
  methods: Array<{
    id: number
    montant: string
  }>
}

export interface DocumentFormData {
  document_type_id: number
  student_id: number
  label: string
  path: File
}

