"use client"

import React, { useEffect, useState } from 'react'
import { useSchoolStore } from '@/store'
import PaymentTable from './table'
import { verificationPermission } from '@/lib/fonction'
import ErrorPage from '@/app/[lang]/non-Autoriser'
import { Card } from '@/components/ui/card'
import { Payment } from '@/lib/interface'

function PaymentPage() {
  const { payments, userOnline } = useSchoolStore()
  const [paymentFiltered, setPaymentFiltered] = useState<Payment[]>([])

  const permissionVoir = ["voir paiement", "voir historique_Depenses"]
  const permissionVoirTous = ["voir_tous historique_Paiement"]

  const canView = verificationPermission(
    { permissionNames: userOnline?.permissionNames || [] },
    permissionVoir
  )

  const canViewAll = verificationPermission(
    { permissionNames: userOnline?.permissionNames || [] },
    permissionVoirTous
  )

  useEffect(() => {
    if (canView && !canViewAll && userOnline) {
      const filtered = payments.filter(
        (payment) => payment.cash_register.id === userOnline.id
      )
      setPaymentFiltered(filtered)
    }
  }, [canView, canViewAll, payments, userOnline])

  // if (!canView && !canViewAll) {
  //   return (
  //     <Card className="w-full h-full flex items-center justify-center">
  //       <ErrorPage />
  //     </Card>
  //   )
  // }

  const dataToShow = canViewAll ? payments : paymentFiltered

  return <PaymentTable data={dataToShow} />
}

export default PaymentPage
