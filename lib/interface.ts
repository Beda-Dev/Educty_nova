
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
  label: string;
  created_at: string;
  updated_at: string;
}


export interface Permission {
  id: number;
  name: string;
  guard_name: string;
  created_at: string;
  updated_at: string;
}

export interface AcademicYear {
  [x: string]: any;
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
  name: string;
  email: string;
  email_verified_at: null;
  created_at: string;
  updated_at: string;
  roles: Role[];
  permissions?: Permission[];
  permissionNames?: string[];
}

export interface UserSingle {
  id: number;
  name: string;
  email: string;
  email_verified_at: null;
  created_at: string;
  updated_at: string;
}

export interface Student {
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
  active: number;
  created_at: string;
  updated_at: string;
  photo: string;
  sexe: string;
  assignment_type: {
    id: number;
    label: string;
    slug: string;
    active: number;
    created_at: string;
    updated_at: string;
  };
  documents: Document[];
  payments: Payment[];
  registrations: Registration[];
}

export interface StudentOnly {
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
}

export interface InterfaceOTP {
  otp: number;
  email: string;
  expiresAt: string;
}
