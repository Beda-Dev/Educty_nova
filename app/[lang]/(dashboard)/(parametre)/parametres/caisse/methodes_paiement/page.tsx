"use client";

import React, { useEffect } from "react";
import { useSchoolStore } from "@/store";
import PaymentMethodsPage from "./methodePaiement";
import { fetchPaymentMethods } from "@/store/schoolservice";

function MethodePaiement() {
  const { methodPayment, setmethodPayment } = useSchoolStore();

  useEffect(() => {
    const loadPaymentMethods = async () => {
      try {
        const updatedMethods = await fetchPaymentMethods();
        setmethodPayment(updatedMethods);
      } catch (error) {
        console.error("Failed to fetch payment methods:", error);
        // Option: handle error in UI or store
      }
    };

    loadPaymentMethods();
  }, [setmethodPayment]);

  return <PaymentMethodsPage data={methodPayment} />;
}

export default MethodePaiement;