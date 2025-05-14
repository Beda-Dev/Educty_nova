"use client"

import React , {useEffect , useState} from 'react'
import { useSchoolStore } from '@/store'
import PaymentMethodsPage from './methodePaiement';
import { fetchPaymentMethods } from "@/store/schoolservice";


function methodePaiement() {
    const { methodPayment, setmethodPayment } = useSchoolStore();

useEffect(() => {

    const fetchMethodPayment = async () => {
      if (methodPayment.length > 0) {
        return;
      }
        const updatedMethods = await fetchPaymentMethods();
        setmethodPayment(updatedMethods);
    };

    fetchMethodPayment();
}, [setmethodPayment]);

return (
    <PaymentMethodsPage />
    );
}

export default methodePaiement