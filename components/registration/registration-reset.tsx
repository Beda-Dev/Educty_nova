"use client"
import { usePathname } from "next/navigation"
import { useEffect, useRef } from "react"
import { useRegistrationStore } from "@/hooks/use-registration-store"

export function RegistrationReset() {
  const pathname = usePathname()
  const { reset } = useRegistrationStore()
  const previousPathname = useRef<string | null>(null)

  useEffect(() => {
    if (previousPathname.current) {
      const wasRegistrationPage = previousPathname.current.includes('/eleves/registration/new_registration')
      const isNowRegistrationPage = pathname?.includes('/eleves/registration/new_registration')
      
      if (wasRegistrationPage && !isNowRegistrationPage) {
        reset()
      }
    }
    
    previousPathname.current = pathname
  }, [pathname, reset])

  return null
}