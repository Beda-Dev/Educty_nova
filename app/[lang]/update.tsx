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
      // console.log("Début du chargement des données...");

      try {
        const classes = await fetchClasses();
        const levels = await fetchLevels();
        const academicYears = await fetchAcademicYears();
        const students = await fetchStudents();
        const users = await fetchUsers();
        const roles = await fetchRoles();
        const pricing = await fetchpricing();
        const registrations = await fetchRegistration();
        const assigmentTypes = await fetchAssignmentType();
        const feeTypes = await fetchFeeType();
        const documentTypes = await fetchDocumentType();
        const payments = await fetchPayment();
        const installments = await fetchInstallment();
        const cashRegisters = await fetchCashRegister();
        const expenseTypes = await fetchExpenseType();
        const expenses = await fetchExpenses();
        const settings = await fetchSetting();
        const sessions = await fetchCashRegisterSessions()
        const methodPayment = await fetchPaymentMethods();
        

        

        reset();
        resetReinscription();
        // console.log("Données chargées avec succès :", {
        //   classes,
        //   levels,
        //   academicYears,
        //   students,
        //   users,
        //   roles,
        //   pricing,
        //   registrations,
        //   assigmentTypes,
        //   feeTypes,
        //   userOnline,
        //   documentTypes,
        //   documents,
        //   payments,
        //   installments,
        //   cashRegisters,
        //   expenseTypes,
        //   expenses,
        //   settings,
        //   permissions,
        //   sessions
        // });

        setClasses(classes);
        setLevels(levels);
        setAcademicYears(academicYears);
        if(academicYears){
          const currentAcademicYear: AcademicYear = academicYears.find((year: AcademicYear) => year.active === 1 && year.isCurrent === 1);
          setAcademicYearCurrent(currentAcademicYear);
        }
        setStudents(students);
        setUsers(users);
        setRoles(roles);
        setPricing(pricing);
        setRegistration(registrations);
        setAssigmentTypes(assigmentTypes);
        setFeeTypes(feeTypes);
        setDocumentTypes(documentTypes);
        setPayments(payments);
        setExpenses(expenses)
        setInstallments(installments);
        setCashRegisters(cashRegisters);
        setExpenseTypes(expenseTypes);
        setSettings(settings);
        setmethodPayment(methodPayment);

        await updateStudentCountByClass(registrations, academicYearCurrent, classes);
        await checkAndBlockSessions(sessions, settings?.[0]?.session_closure_time)
        const sessionAfterBlock = await fetchCashRegisterSessions()
        setCashRegisterSessions(sessionAfterBlock);
      } catch (error) {
        console.error("Erreur lors du chargement des données :", error);
      }
    };

    // Charger les données immédiatement au montage du composant
    loadData();

    return () => {
      isMounted = false;
      abortController.abort();
      // console.log("Composant démonté - fetchs annulés");
    };
  }, []);

  return null;
};

export default DataFetcher;