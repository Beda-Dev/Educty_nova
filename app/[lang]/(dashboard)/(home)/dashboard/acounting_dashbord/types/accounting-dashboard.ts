import type { CashRegisterSession, Registration, Student, User, Installment, PaymentMethod } from "@/lib/interface"

export interface AccountingDashboardProps {
  trans?: Record<string, string>
}

export interface CashierPerformance {
  cashier: User
  totalPayments: number
  totalExpenses: number
  transactionCount: number
  sessionsCount: number
  averageTransactionAmount: number
  lastSessionDate: string
}

export interface SessionIrregularity {
  session: CashRegisterSession
  previousSession?: CashRegisterSession
  discrepancy: number
  discrepancyType: "opening_closing" | "session_gap"
  severity: "low" | "medium" | "high"
  description: string
}

export interface FinancialSummary {
  totalRevenue: number
  totalExpenses: number
  netBalance: number
  pendingPayments: number
  overdueAmount: number
  cashInHand: number
  activeSessions: number
}

export interface PaymentMethodStats {
  method: PaymentMethod
  totalAmount: number
  transactionCount: number
  percentage: number
  averageAmount: number
}

export interface MonthlyFinancialData {
  month: string
  year: number
  revenue: number
  expenses: number
  netBalance: number
  transactionCount: number
}

export interface CashierSessionAnalysis {
  cashier: User
  sessions: CashRegisterSession[]
  totalSessions: number
  averageSessionDuration: number
  totalHandled: number
  irregularities: SessionIrregularity[]
}

export interface OverdueStudentPayment {
  student: Student
  registration: Registration
  installment: Installment
  daysOverdue: number
  amountDue: number
  lastPaymentDate?: string
}

export interface DemandAnalysis {
  totalDemands: number
  pendingDemands: number
  approvedDemands: number
  rejectedDemands: number
  totalPendingAmount: number
  totalApprovedAmount: number
  averageProcessingTime: number
}

export interface AccountingFilters {
  dateRange: {
    start: string
    end: string
  }
  academicYear: number
  cashier?: number
  cashRegister?: number
  paymentMethod?: number
  demandStatus?: string
  irregularityLevel?: "low" | "medium" | "high"
}
