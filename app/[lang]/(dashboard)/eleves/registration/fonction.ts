import { classes } from './../../vie_scolaire/notes/data';
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
  CashRegisterSession
} from "@/lib/interface";

export function paiementRegistration(
  niveau: Level,  
  tarifications : Pricing[],
  registration?: Registration,
  paymentMethod?: PaymentMethod,

) {
    let SommeTotale = 0

    const tarificationPourNiveau = tarifications.filter((tarif)=>(
        tarif.level_id === niveau.id
    ))
     
    tarificationPourNiveau.forEach((tarif)=>(
        SommeTotale = SommeTotale + Number(tarif.amount)
    ))

    console.log(`niveau est : ${niveau.label}`)

    console.log(`la somme totale a payer est : ${SommeTotale}`)


    

    


}



