"use client"
import { usePathname } from "next/navigation"
import { useEffect, useRef } from "react"
import { useRegistrationStore } from "@/hooks/use-registration-store"

export function RegistrationReset() {
  const pathname = usePathname()
  const { reset } = useRegistrationStore()
  const previousPathname = useRef<string | null>(null)

  useEffect(() => {
    // Reset the registration store when navigating away from registration page
    if (previousPathname.current?.includes('/eleves/registration/new_registration') && 
        !pathname?.includes('/eleves/registration/new_registration')) {
      reset()
    }
    
    previousPathname.current = pathname
  }, [pathname, reset])

  return null
}