"use client"

import React from 'react'
import CashRegisterTable from './tab'
import { useSchoolStore } from '@/store'

function PageCash() {
    const { cashRegisters } = useSchoolStore()
  return (
    <CashRegisterTable data={cashRegisters} />
  )
}

export default PageCash