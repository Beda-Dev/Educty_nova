"use client";
import { useState, useEffect, useCallback } from "react";
import { useSchoolStore } from "@/store";
import { Registration, Pricing, Student, AcademicYear, Installment, Payment } from "@/lib/interface";
import PaymentDetail from "./detail_registration";
import {obtenirDetailsPaiement , DetailsPaiement} from './fonction'

interface Props {
  params: { 
    id: string;
  };
}

const DetailPaymentPage = ({ params }: Props) => {
  const [paiement , setPaiement] = useState<Payment | null>(null);
  const [detail , setDetail]= useState<DetailsPaiement | null>(null);
  const { students, registrations, pricing, installements, academicYears , payments } = useSchoolStore();
  const { id } = params;

  useEffect(() => {
    const paymentFind = payments.find((payment) => payment.id === Number(id));
    if(paymentFind){
      const Details = obtenirDetailsPaiement(paymentFind.id, payments, students, registrations, pricing, installements, academicYears);
      setDetail(Details);
      setPaiement(paymentFind);}

  }, [payments]);



  return (
    <>
      {paiement && detail && (
        <PaymentDetail 
          payment={paiement} 
          detail={detail}
        />
      )}
    </>
  );
};

export default DetailPaymentPage;