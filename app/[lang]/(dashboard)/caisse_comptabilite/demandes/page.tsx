'use client'

import React, { useEffect, useState } from 'react'
import { useSchoolStore } from '@/store'
import { fetchDemands , fetchValidationExpenses , fetchSetting } from '@/store/schoolservice'
import DisbursementRequestsPage  from './composant'


export default function Page() {
    const { setDemands , setValidationExpenses , setSettings} = useSchoolStore()


  useEffect(() => {
    const fetchData = async () => {
        const demands = await fetchDemands()
        const validationExpenses = await fetchValidationExpenses()
        const settings = await fetchSetting()
        setDemands(demands)
        setValidationExpenses(validationExpenses)
        setSettings(settings)
    }

    fetchData()
  }, [])

  return (
    <DisbursementRequestsPage />
  )
}
