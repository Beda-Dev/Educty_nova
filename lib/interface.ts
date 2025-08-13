import { Class } from '@/components/svg';

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
  isPrincipal: 0 | 1;
  payments: {  id: number;
    student_id: number;
    installment_id: number;
    cash_register_id: number;
    cashier_id: number;
    amount: string;
    created_at: string;
    updated_at: string;
    transaction_id: number;
    pivot: {
      payment_id: number;
      payment_method_id: number;
      montant: string;
      created_at: string;
      updated_at: string;
    };
  }[] | [];
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
  periods:{
    id: number;
    label: string;
    type_period_id: number;
    created_at: string;
    updated_at: string;
    pivot: {
      academic_year_id: number;
      period_id: number;
      start_date: string;
      end_date: string;
      created_at: string;
      updated_at: string;
    };
  }[] | [];
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
  permissions?: {
    id: number;
    name: string;
    guard_name: string;
    created_at: string;
    updated_at: string;
    pivot: {
      role_id: number;
      permission_id: number;
    }
  }[];
}

export interface User {
  id: number;
  hierarchical_id?: number;
  name: string;
  email: string;
  email_verified_at: null;
  created_at: string;
  updated_at: string;
  roles: {
    id: number;
    name: string;
    guard_name: string;
    created_at: string;
    updated_at: string;
    pivot: {
      model_type: string;
      model_id: number;
      role_id: number;
    }
  }[];
  superior?: null | UserSingle;
  subordinates?: UserSingle[];
  avatar?: string | null;
  active: 0 | 1 ;
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
  superior?: null | UserSingle;
  subordinates?: UserSingle[];
  avatar?: string | null;
  active: 0 | 1 ;
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
    }
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
  serie_id: number | null;
  level?: Level;
  serie?: {
    id: number;
    label: string;
    created_at: string;
    updated_at: string;
  } ;
  not_studied_matters: {
    id: number;
    name: string;
    active: 0 | 1 ;
    created_at: string;
    updated_at: string;
    pivot : {
      classe_id: number;
      matter_id: number;
    }
  }[] | []
}

export interface Registration {
  id: number;
  class_id: number;
  academic_year_id: number;
  student_id: number;
  registration_date: string;
  created_at: string;
  updated_at: string;
  classe: Omit<Classe, 'serie' | 'level'>;
  academic_year: Omit<AcademicYear, 'periods'>;
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
  transaction?: Transaction;
  payment_methods: {
    id: number;
    name: string;
    created_at: string;
    updated_at: string;
    isPrincipal: 0 | 1;
    pivot: {
        payment_id: number;
        payment_method_id: number;
        montant: string;
        created_at: string;
        updated_at: string;
      };
    }[] | [];
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
  validation_expense_id?: number;
  transaction?: Transaction;
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
  demand_id: number;
  validation_date: string;
  comment: string;
  validation_order: number;
  validation_status: string;
  created_at: string;
  updated_at: string;
  user?: User;
  demand?: Demand;
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
  registration_number_format?: string;
  created_at: string; // ou Date si vous convertissez les dates
  updated_at: string; // ou Date si vous convertissez les dates
  establishment_phone_1?: string;
  establishment_phone_2?: string | null;
  establishment_logo?: string | null; //  envoyer une image
  establishment_name?: string;
  approval_number?: string | null; // Numéro d'approbation
  status?: string; // status: string; // privé , public ,  semi privé dans un select
  address?: string;
  email?: string | null;
  longitude?: string | number | null; // plus précis que string pour les coordonnées
  latitude?: string | number | null; // plus précis que string pour les coordonnées
  expense_approval_level?: number; // niveau de validation des depenses dans select
  primary_validator?: string | null;
  currency?: string | null;
}

export interface Matter {
  id: number;
  name: string;
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

export interface TypePeriod {
  id: number;
  label: string;
  created_at: string;
  updated_at: string;
}

export interface Period {
  id: number;
  label: string;
  type_period_id: number;
  created_at: string;
  updated_at: string;
}

export interface Demand {
  id: number;
  applicant_id: number;
  pattern: string;
  amount: number;
  status: 'en attente' | 'validée' | 'approuvée' | 'refusée';
  created_at: string;
  updated_at: string;
  applicant: UserSingle;
}

// interface liée au professeur

type UserInProfessor = Omit<UserSingle, 'subordinates' | 'superior'>;
export interface Professor {
  id: number;
  name: string;
  first_name: string;
  number: string;
  cni: string | null; // CNI peut être null si non fourni
  type: "permanent" | "vacataire";
  user_id: number;
  photo : string | null;
  number_of_years_of_teaching: number | null;
  date_of_teaching_authorization: string | null;
  subject_taught: string | null;
  graduate: string | null;
  service_rate: number | null;
  cnps_social_security_number: string | null;
  official: 0 | 1;
  created_at: string;
  updated_at: string;
  sexe: string | null; // Sexe peut être null si non fourni
  matricule: string | null; // Matricule peut être null si non fourni
  user?: UserInProfessor; // Optionnel, si vous souhaitez inclure les détails de l'utilisateur
  


}

export interface Serie {
  id: number;
  label: string;
  created_at: string;
  updated_at: string
}

// interface liée à l'emploi du temps

export interface TimetableFormData {
  academic_year_id: string;
  class_id: string;
  professor_id: string;
  matter_id: string;
  period_id: string;
  day: string;
  start_date: string; // Format: YYYY-MM-DD
  end_date: string;   // Format: YYYY-MM-DD
  room: string;
  start_time: string; // Format: HH:mm
  end_time: string;   // Format: HH:mm
}

type ClassWithoutData = Omit<Classe, 'serie' | 'level'>;

export interface Timetable {
  id: number;
  academic_year_id: number;
  class_id: number;
  professor_id: number;
  matter_id: number;
  period_id: number;
  day: string;
  start_date: string; // Format: YYYY-MM-DD
  end_date: string;   // Format: YYYY-MM-DD
  room: string;
  start_time: string; // Format: HH:mm
  end_time: string;   // Format: HH:mm
  created_at: string;
  updated_at: string;
  academic_year: Omit<AcademicYear, 'periods'>;
  professor: Omit<Professor, 'user'>;
  class: ClassWithoutData;
  period: Omit<Period, 'type_period'>;
  matter: Matter;
}

export interface Evaluation {
  id : number;
  period_id : number;
  professor_id : number;
  academic_id : number;
  matter_id : number;
  classe_id : number;
  type_note_id: number;
  maximum_note: number;
  coefficient : number;
  date_evaluation:string
  period: Omit<Period, 'type_period'>;
  matter: Matter;
  type_note: TypeEvaluation;

}

type RegistrationSimple = Omit<Registration, 'classe' | 'academic_year' | 'student'>

export interface Note {
  id: number;
  evaluation_id: number;
  registration_id: number;
  value: number;
  created_at: string;
  updated_at: string;
  registration: RegistrationSimple;

}

// interface liée aux coefficients

type LevelWithoutData = Omit<Level, 'class_count'>;
export interface Coefficient {
  id: number;
  matter_id: number;
  level_id: number;
  serie_id: number | null;
  label: number;
  created_at: string;
  updated_at: string;
  matter: Matter; 
  level: LevelWithoutData; // Ajout de l'interface Level pour le niveau
  serie: Serie | null; // Optionnel, car la série peut être null
}



export interface Office {
  id: number;
  name: string;
  category: string;
  is_active: 0 | 1 ;
  base_salary: string;
  description: string | null;
  created_at: string;
  updated_at: string;
  employees: EmployeeData[] | []

}

type OfficeWithouEmployer = Omit<Office, 'employees'>;

export interface Employee {
  id: number;
  office_id: number ;
  user_id: number;
  photo : string | number;
  last_name : string ;
  first_name : string ;
  gender : string ;
  birth_date : string | null ;
  birth_place : string | null ;
  phone : string ;
  address : string ; 
  registration_number : string ;
  hiring_date : string ;
  status : string ; 
  salary : string | null ;
  contract_type : string ;
  contract_end_date : string | null ;
  education_level : string ; 
  marital_status : string | null ;
  social_security_number : string | null ;
  office: OfficeWithouEmployer
  user : UserInProfessor
}

export interface EmployeeData {
  id: number;
  office_id: number ;
  user_id: number;
  photo : string | number;
  last_name : string ;
  first_name : string ;
  gender : string ;
  birth_date : string | null ;
  birth_place : string | null ;
  phone : string ;
  address : string ; 
  registration_number : string ;
  hiring_date : string ;
  status : string ; 
  salary : string | null ;
  contract_type : string ;
  contract_end_date : string | null ;
  education_level : string ; 
  marital_status : string | null ;
  social_security_number : string | null ;

}

export interface Average {
  id:number;
  value:number;
  rank:number;
  appreciation: string | null ;
  period_id : number ;
  report_card_id : number ;
  professor_id : number ;
  created_at : string ;
  updated_at : string ;
  period: Period;
  professor: Omit<Professor, 'user'>;
  report_card: Omit<ReportCard, 'period' | 'registration' | 'academic_year'>;



}

export interface ReportCard {
  id: number;
  rank: number;
  class_rank : number;
  report_type: string; // Trimestriel , Semestriel ou Annuelle
  general_average: string;
  council_decision: string | null;
  total_coefficient: number;
  mention: string | null;
  honor_roll: 0 | 1 ;
  registration_id: number;
  academic_year_id: number;
  period_id: number | null ; // null si c'est un bulletin anuelle
  created_at: string;
  updated_at: string;
  academic_year: Omit<AcademicYear, 'periods'>;
  period: Omit<Period, 'type_period'> | null; 
  registration: Omit<Registration, 'classe' | 'academic_year' | 'student'>;

}

export interface CorrespondenceBooks {
  id: number;
  registration_id: number;
  created_at: string;
  updated_at: string;
  registration: Omit<Registration, 'classe' | 'academic_year' | 'student'>;
} 

export interface CorrespondenceEntry {
  id: number;
  message_type: string;
  content: string;
  correspondence_book_id: number;
  created_at: string;
  updated_at: string;
  correspondence_book: Omit<CorrespondenceBooks, 'registration'>;
} 

export interface HomeroomTeacher {
  id: number;
  class_id: number;
  professor_id: number;
  academic_year_id: number;
  created_at: string;
  updated_at: string;
  class: Omit<Classe, 'serie' | 'level'>;
  professor: Omit<Professor, 'user'>;
  academic_year: Omit<AcademicYear, 'periods'>;
}

export interface Presence {
  id: number;
  date: string;
  status: 'present' | 'absent' | 'late' ;
  registration_id: number;
  justification: string;
  timetable_id: number;
  created_at: string;
  updated_at: string;
  registration: Omit<Registration, 'classe' | 'academic_year' | 'student'>;
  timetable: Omit<Timetable, 'academic_year' | 'period' | 'matter' | 'professor' | 'class'>;
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



