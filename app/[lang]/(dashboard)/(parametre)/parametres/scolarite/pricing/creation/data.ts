export interface Paiement {
  id: string;
  date: Date;
  montant: number;
}

export interface PricingData {
  assignment_type_id: number;
  academic_years_id: number;
  level_id: number;
  fee_type_id: number;
  label: string;
  amount: string;
}

export interface InstallmentData {
  pricing_id: string | number;
  amount_due: string;
  due_date: string;
  status: string;
}