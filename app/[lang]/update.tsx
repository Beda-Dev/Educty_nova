"use client";

import { useEffect } from "react";
import { useSchoolStore } from "@/store";
import {
  fetchClasses,
  fetchLevels,
  fetchAcademicYears,
  fetchStudents,
  fetchUsers,
  fetchRoles,
  fetchpricing,
  fetchRegistration,
  fetchAssignmentType,
  fetchDocumentType,
  fetchDocument,
  fetchPayment,
  fetchInstallment,
  fetchCashRegister,
  fetchExpenseType,
  fetchExpenses,
  fetchSetting,
  fetchCashRegisterSessions,
  fetchPaymentMethods,
  fetchFeeType
} from "@/store/schoolservice";
import {AcademicYear} from '@/lib/interface'
import {updateStudentCountByClass} from "@/lib/fonction";
import { useRegistrationStore } from "@/hooks/use-registration-store";
import { useReinscriptionStore } from "@/hooks/use-reinscription-store";
import {checkAndBlockSessions} from "@/lib/utils"

// Utilitaire pour créer un délai
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Utilitaire pour traiter les requêtes par lots avec rate limiting
const processBatch = async <T,>(
  promises: (() => Promise<T>)[],
  batchSize: number = 3,
  delayBetweenBatches: number = 300
): Promise<T[]> => {
  const results: T[] = [];
  
  for (let i = 0; i < promises.length; i += batchSize) {
    const batch = promises.slice(i, i + batchSize);
    
    try {
      // Exécuter le lot en parallèle
      const batchResults = await Promise.all(batch.map(fn => fn()));
      results.push(...batchResults);
      
      // Délai entre les lots (sauf pour le dernier)
      if (i + batchSize < promises.length) {
        await delay(delayBetweenBatches);
      }
    } catch (error) {
      console.error(`Erreur lors du traitement du lot ${Math.floor(i / batchSize) + 1}:`, error);
      // Ajouter des valeurs par défaut en cas d'erreur
      results.push(...new Array(batch.length).fill([]));
    }
  }
  
  return results;
};

// Utilitaire pour retry automatique avec backoff exponentiel
const fetchWithRetry = async <T,>(
  fetchFn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> => {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fetchFn();
    } catch (error: any) {
      // Si c'est une erreur 429, on attend plus longtemps
      if (error?.status === 429 || error?.message?.includes('429')) {
        const retryAfter = error?.headers?.['retry-after'];
        const waitTime = retryAfter ? 
          parseInt(retryAfter) * 1000 : 
          baseDelay * Math.pow(2, attempt);
        
        console.warn(`Erreur 429 détectée, tentative ${attempt + 1}/${maxRetries}. Attente de ${waitTime}ms...`);
        
        if (attempt < maxRetries - 1) {
          await delay(waitTime);
          continue;
        }
      }
      
      // Pour les autres erreurs, on fait un backoff normal
      if (attempt < maxRetries - 1) {
        await delay(baseDelay * Math.pow(2, attempt));
        continue;
      }
      
      throw error;
    }
  }
  throw new Error(`Échec après ${maxRetries} tentatives`);
};

const DataFetcher = () => {
  const {reset} = useRegistrationStore();
  const {reset : resetReinscription} = useReinscriptionStore();
  const {userOnline ,  academicYearCurrent} = useSchoolStore();
  const setClasses = useSchoolStore((state) => state.setClasses);
  const setLevels = useSchoolStore((state) => state.setLevels);
  const setAcademicYears = useSchoolStore((state) => state.setAcademicYears);
  const setStudents = useSchoolStore((state) => state.setStudents);
  const setUsers = useSchoolStore((state) => state.setUsers);
  const setRoles = useSchoolStore((state) => state.setRoles);
  const setPricing = useSchoolStore((state) => state.setPricing);
  const setRegistration = useSchoolStore((state) => state.setRegistration);
  const setAssigmentTypes = useSchoolStore((state) => state.setAssignmentTypes);
  const setFeeTypes = useSchoolStore((state) => state.setFeeTypes);
  const setDocumentTypes = useSchoolStore((state) => state.setDocumentTypes);
  const setPayments = useSchoolStore((state) => state.setPayments);
  const setInstallments = useSchoolStore((state) => state.setInstallments);
  const setCashRegisters = useSchoolStore((state) => state.setCashRegisters);
  const setExpenseTypes = useSchoolStore((state) => state.setExpenseTypes);
  const setSettings = useSchoolStore((state) => state.setSettings);
  const setAcademicYearCurrent = useSchoolStore((state) => state.setAcademicYearCurrent);
  const setCashRegisterSessions = useSchoolStore((state) => state.setCashRegisterSessions);
  const setmethodPayment = useSchoolStore((state) => state.setmethodPayment);
  const setExpenses = useSchoolStore((state) => state.setExpenses);

  useEffect(() => {
    console.log("Composant monté ou dépendances mises à jour");
    const abortController = new AbortController();
    let isMounted = true;

    const loadData = async () => {
      try {
        reset();
        resetReinscription();

        // Définir les requêtes avec retry automatique
        const fetchFunctions = [
          // Lot prioritaire 1 - Données de base nécessaires
          () => fetchWithRetry(() => fetchClasses()),
          () => fetchWithRetry(() => fetchLevels()),
          () => fetchWithRetry(() => fetchAcademicYears()),
          
          // Lot prioritaire 2 - Utilisateurs et permissions
          () => fetchWithRetry(() => fetchUsers()),
          () => fetchWithRetry(() => fetchRoles()),
          () => fetchWithRetry(() => fetchSetting()),
          
          // Lot prioritaire 3 - Étudiants et inscriptions
          () => fetchWithRetry(() => fetchStudents()),
          () => fetchWithRetry(() => fetchRegistration()),
          () => fetchWithRetry(() => fetchpricing()),
          
          // Lot prioritaire 4 - Types et configurations
          () => fetchWithRetry(() => fetchAssignmentType()),
          () => fetchWithRetry(() => fetchFeeType()),
          () => fetchWithRetry(() => fetchDocumentType()),
          () => fetchWithRetry(() => fetchExpenseType()),
          
          // Lot prioritaire 5 - Données transactionnelles
          () => fetchWithRetry(() => fetchPayment()),
          () => fetchWithRetry(() => fetchInstallment()),
          () => fetchWithRetry(() => fetchCashRegister()),
          () => fetchWithRetry(() => fetchExpenses()),
          () => fetchWithRetry(() => fetchCashRegisterSessions()),
          () => fetchWithRetry(() => fetchPaymentMethods()),
        ];

        console.log("Début du chargement des données par lots...");
        
        // Traiter les requêtes par lots de 3 avec un délai de 300ms entre chaque lot
        const results = await processBatch(fetchFunctions, 3, 300);

        if (!isMounted) return;

        // Destructurer les résultats dans l'ordre
        const [
          classes, levels, academicYears,
          users, roles, settings,
          students, registrations, pricing,
          assigmentTypes, feeTypes, documentTypes, expenseTypes,
          payments, installments, cashRegisters, expenses, sessions, methodPayment
        ] = results;

        // Mise à jour du store
        setClasses(classes || []);
        setLevels(levels || []);
        setAcademicYears(academicYears || []);
        
        if(academicYears) {
          const currentAcademicYear: AcademicYear = academicYears.find(
            (year: AcademicYear) => year.active === 1 && year.isCurrent === 1
          );
          if (currentAcademicYear) {
            setAcademicYearCurrent(currentAcademicYear);
          }
        }
        
        setStudents(students || []);
        setUsers(users || []);
        setRoles(roles || []);
        setPricing(pricing || []);
        setRegistration(registrations || []);
        setAssigmentTypes(assigmentTypes || []);
        setFeeTypes(feeTypes || []);
        setDocumentTypes(documentTypes || []);
        setPayments(payments || []);
        setExpenses(expenses || [])
        setInstallments(installments || []);
        setCashRegisters(cashRegisters || []);
        setExpenseTypes(expenseTypes || []);
        setSettings(settings || []);
        setmethodPayment(methodPayment || []);

        // Opérations post-chargement avec gestion d'erreur
        try {
          if (registrations && classes) {
            await updateStudentCountByClass(registrations, academicYearCurrent, classes);
          }
          
          if (sessions && settings?.[0]?.session_closure_time) {
            await checkAndBlockSessions(sessions, settings[0].session_closure_time);
            const sessionAfterBlock = await fetchWithRetry(() => fetchCashRegisterSessions());
            setCashRegisterSessions(sessionAfterBlock || []);
          } else {
            setCashRegisterSessions(sessions || []);
          }
        } catch (postError) {
          console.warn("Erreur lors des opérations post-chargement :", postError);
        }

        console.log("Toutes les données ont été chargées avec succès");
        
      } catch (error) {
        console.error("Erreur lors du chargement des données :", error);
        // En cas d'erreur totale, on peut charger depuis localStorage comme fallback
        // (votre logique existante dans chaque fetch function)
      }
    };

    // Charger les données immédiatement au montage du composant
    loadData();

    return () => {
      isMounted = false;
      abortController.abort();
      console.log("Composant démonté - fetchs annulés");
    };
  }, []);

  return null;
};

export default DataFetcher;