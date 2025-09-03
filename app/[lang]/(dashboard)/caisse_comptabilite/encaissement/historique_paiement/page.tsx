"use client"

import React, { useEffect, useState } from 'react'
import { useSchoolStore } from '@/store'
import PaymentTable from './table'
import { fetchPayment } from '@/store/schoolservice'

function PaymentPage() {
  const { payments, userOnline , setPayments } = useSchoolStore()



  useEffect(() => {
    if (userOnline) {
      const update = async () => {
        const filtered = await fetchPayment()
        setPayments(filtered)
      }
      update()
    }
  }, [])



  return <PaymentTable data={payments} />
}

export default PaymentPage
