'use client'
import React from 'react'
import { useSchoolStore } from '@/store'
import {UserDetails }from "./componant"

function ProfilPage() {
    const { userOnline } = useSchoolStore()
  return (
    <>
      {userOnline && <UserDetails user={userOnline} />}
    </>
  )
}

export default ProfilPage