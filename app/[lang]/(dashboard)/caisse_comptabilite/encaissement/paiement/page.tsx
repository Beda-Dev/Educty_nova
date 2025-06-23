"use client";

import { useEffect, useState, useCallback } from "react";
import { useSchoolStore } from "@/store";
import PaymentManagementPage from "./componant";
import { fetchPayment, fetchPaymentMethods } from "@/store/schoolservice";

const PaymentPage = () => {
  const { setPayments, setmethodPayment } = useSchoolStore();
  const [loading, setLoading] = useState(true);

  const fetchForUpdate = useCallback(async () => {
    try {
      const [payments, methods] = await Promise.all([
        fetchPayment(),
        fetchPaymentMethods(),
      ]);

      if (payments) setPayments(payments);
      if (methods) setmethodPayment(methods);
    } catch (error) {
      console.error("Erreur lors de la mise à jour des paiements :", error);
    } finally {
      setLoading(false);
    }
  }, [setPayments, setmethodPayment]);

  useEffect(() => {
    fetchForUpdate();
  }, [fetchForUpdate]);

  return <PaymentManagementPage />;
};

export default PaymentPage;
  