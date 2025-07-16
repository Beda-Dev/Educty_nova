import {
  Registration, Student , Installment , Pricing 
} from "@/lib/interface" 

// Types pour les analyses
export interface MonthlyData {
  month: string
  year: number
  count: number
  amount: number
  avgAmount: number
}

export interface WeeklyData {
  day: string
  count: number
  amount: number
  percentage: number
}

export interface HourlyData {
  hour: string
  count: number
  amount: number
}

export interface PaymentMethodAnalysis {
  method: string
  count: number
  amount: number
  percentage: number
}

export interface OverduePayment {
  student: Student
  registration: Registration
  pricing: Pricing
  installment: Installment
  daysOverdue: number
}

export interface FinancialMetrics {
  topPayingStudents: Array<{
    student: Student
    amount: number
    studentId: number
  }>
  installmentAnalysis: {
    overdue: { count: number; amount: number }
    upcoming: { count: number; amount: number }
    thisMonth: { count: number; amount: number }
  }
  recoveryRate: number
  averagePaymentPerStudent: number
  totalStudentsWithPayments: number
}

export interface TemporalTrends {
  monthlyPayments: MonthlyData[]
  weeklyDistribution: WeeklyData[]
  hourlyDistribution: HourlyData[]
}

export interface PerformanceData {
  monthly: {
    payments: number
    paymentAmount: number
    expenses: number
    expenseAmount: number
  }
  weekly: {
    payments: number
    paymentAmount: number
    expenses: number
    expenseAmount: number
  }
}
