"use client"

import React , {useEffect , useState} from 'react'
import { useSchoolStore } from '@/store'
import PaymentMethodsPage from './methodePaiement';


function methodePaiement() {
    const { methodPayment, setmethodPayment } = useSchoolStore();

  return (
    <PaymentMethodsPage />
  )
}

export default methodePaiement