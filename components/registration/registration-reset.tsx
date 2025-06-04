"use client"
import { usePathname } from "next/navigation"
import { useEffect, useRef } from "react"
import { useSchoolStore } from "@/store/index"

export function RegistrationReset() {
  const pathname = usePathname()
  const { resetRegistration } = useSchoolStore()
  const previousPathname = useRef<string | null>(null)

  useEffect(() => {
    if (previousPathname.current) {
      const wasRegistrationPage = previousPathname.current.includes('/eleves/registration/new_registration')
      const isNowRegistrationPage = pathname?.includes('/eleves/registration/new_registration')
      
      if (wasRegistrationPage && !isNowRegistrationPage) {
        resetRegistration()
      }
    }
    
    previousPathname.current = pathname
  }, [pathname, resetRegistration])

  return null
}