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
  fetchFeeType,
  fetchDocumentType,
  fetchDocument,
  fetchPayment,
  fetchInstallment,
  fetchCashRegister,
  fetchExpenseType,
  fetchExpenses,
  fetchSetting,
  fetchPermissions,
  fetchCashRegisterSessions
} from "@/store/schoolservice";
import {AcademicYear} from '@/lib/interface'
import {updateStudentCountByClass} from "@/lib/fonction";
import { useRegistrationStore } from "@/hooks/use-registration-store";

const DataFetcher = () => {
  const {reset} = useRegistrationStore();
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
  const setDocuments = useSchoolStore((state) => state.setDocuments);
  const setPayments = useSchoolStore((state) => state.setPayments);
  const setInstallments = useSchoolStore((state) => state.setInstallments);
  const setCashRegisters = useSchoolStore((state) => state.setCashRegisters);
  const setExpenseTypes = useSchoolStore((state) => state.setExpenseTypes);
  const setSettings = useSchoolStore((state) => state.setSettings);
  const setAcademicYearCurrent = useSchoolStore((state) => state.setAcademicYearCurrent);
  const setPermission = useSchoolStore((state) => state.setPermission);
  const setCashRegisterSessions = useSchoolStore((state) => state.setCashRegisterSessions);




  useEffect(() => {
    console.log("Composant monté ou dépendances mises à jour");

    const loadData = async () => {
      console.log("Début du chargement des données...");

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
        const documents = await fetchDocument();
        const payments = await fetchPayment();
        const installments = await fetchInstallment();
        const cashRegisters = await fetchCashRegister();
        const expenseTypes = await fetchExpenseType();
        const expenses = await fetchExpenses();
        const settings = await fetchSetting();
        const permissions = await fetchPermissions();
        const sessions = await fetchCashRegisterSessions()

        // await updateStudentCountByClass(registrations, academicYearCurrent, classes);

        reset();
        console.log("Données chargées avec succès :", {
          classes,
          levels,
          academicYears,
          students,
          users,
          roles,
          pricing,
          registrations,
          assigmentTypes,
          feeTypes,
          userOnline,
          documentTypes,
          documents,
          payments,
          installments,
          cashRegisters,
          expenseTypes,
          expenses,
          settings,
          permissions,
          sessions
        });

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
        setDocuments(documents)
        setPayments(payments);
        setInstallments(installments);
        setCashRegisters(cashRegisters);
        setExpenseTypes(expenseTypes);
        setSettings(settings);
        setPermission(permissions);
        setCashRegisterSessions(sessions);
        if(sessions){

        }
      } catch (error) {
        console.error("Erreur lors du chargement des données :", error);
      }
    };

    // Charger les données immédiatement au montage du composant
    loadData();

    // // Configurer un intervalle pour recharger les données toutes les 5 secondes
    // const interval = setInterval(() => {
    //   console.log("Intervalle déclenché - Rechargement des données...");
    //   loadData();
    // }, 300000);

    // // Nettoyer l'intervalle lors du démontage du composant
    // return () => {
    //   console.log("Composant démonté - Nettoyage de l'intervalle");
    //   clearInterval(interval);
    // };
  }, [
    setClasses,
    setLevels,
    setAcademicYears,
    setStudents,
    setUsers,
    setRoles,
    setPricing,
    setRegistration,
    setAssigmentTypes,
    setFeeTypes,
    setDocumentTypes,
    setDocuments,
    setPayments,
    setInstallments,
    setCashRegisters,
    setExpenseTypes,
    setSettings,
    setPermission
  ]);

  return null;
};

export default DataFetcher;