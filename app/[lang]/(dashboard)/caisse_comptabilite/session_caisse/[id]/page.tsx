"use client";
import { useState, useEffect, useCallback } from "react";
import { useSchoolStore } from "@/store";
import { CashRegisterSession} from "@/lib/interface";


interface Props {
  params: { 
    id: string;
  };
}

const DetailSessionPage = ({ params }: Props) => {
  const [SessionCurrent , setSessionCurrent] = useState<CashRegisterSession[] | null>(null);
  const { cashRegisterSessions } = useSchoolStore();
  const { id } = params;

  useEffect(() => {
    const paymentFind = cashRegisterSessions.find((session) => session.id === Number(id));


  }, []);



  return (
    <>

    </>
  );
};

export default DetailSessionPage;