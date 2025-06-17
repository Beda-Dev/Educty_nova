"use client"

import React, { useEffect, useState, useMemo } from 'react'
import { useSchoolStore } from '@/store'
import DemandDetailsPage from './componant'
import { Demand, ValidationExpense } from '@/lib/interface'
import Loading from './loading'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import { fetchDemands , fetchValidationExpenses } from '@/store/schoolservice'
import {
  Card,
} from "@/components/ui/card";

interface Props {
  params: {
    id: string
  }
}

function Page({ params }: Props) {
  const router = useRouter()
  const { demands, validationExpenses , setDemands , setValidationExpenses } = useSchoolStore()
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  const fetchInitialData = async() =>{
      const updateDemand = await fetchDemands()
      const updateValidation = await fetchValidationExpenses()
      setDemands(updateDemand)
      setValidationExpenses(updateValidation)
  }

  // Vérification de l'ID
  const validationId = useMemo(() => {
    const id = Number(params.id)
    return isNaN(id) ? null : id
  }, [params.id])

  // Récupération des données
  const { demande, validation } = useMemo(() => {
    if (!validationId) return { demande: null, validation: null }

    const validation = validationExpenses.find((v) => Number(v.id) === Number(validationId))
    const demande = demands.find((d) => Number(d.id) === Number(validation?.demand_id))

    return { demande, validation }
  }, [validationId, demands, validationExpenses])

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        
        // Vérifier si l'ID est valide
        if (!validationId) {
          setNotFound(true)
          return
        }

        // Charger les données si elles ne sont pas déjà dans le store
        if (demands.length === 0 || validationExpenses.length === 0) {
          await fetchInitialData()
        }

        // Vérifier si la demande existe après chargement
        const ValidationExist = validationExpenses.some(d => d.id === validationId)
        if (!ValidationExist) {
          setNotFound(true)
          toast.error('Demande non trouvée')
        }
      } catch (error) {
        console.error('Erreur de chargement:', error)
        toast.error('Erreur lors du chargement des données')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [validationId, fetchInitialData])

  // Redirection si ID invalide ou demande introuvable
  useEffect(() => {
    if (notFound) {
      const timer = setTimeout(() => router.push('/decaissement/validation/'), 2000)
      return () => clearTimeout(timer)
    }
  }, [notFound, router])

  if (notFound) {
    return (
      <Card className="flex flex-col items-center justify-center h-screen space-y-4">
        <h2 className="text-2xl font-bold">Demande introuvable</h2>
        <p>Redirection en cours...</p>
      </Card>
    )
  }

  if (loading || !demande || !validation) {
    return <Loading />
  }

  return <DemandDetailsPage demande={demande} validation={validation} />
}

export default Page