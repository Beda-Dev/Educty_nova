"use client";

import RevinueChart from "./components/revinue-chart";
import TopBrowserChart from "./components/top-browser-chart";
import TopCustomers from "./components/top-customers";
import RapportInscription from "./components/visitors-chart";
import CustomerStatistics from "./components/customer-statistics";
import Transaction from "./components/transaction";
import Payment from "./components/Payment";
import TopCountries from "./components/top-countries";
import Products from "./components/products";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import DashboardSelect from "@/components/dasboard-select";
import SchoolStats from "./components/school-stats";
import RecentInscription from "./components/recentRegistrations";
import { ScrollArea } from "@/components/ui/scroll-area";
import DashboardDropdown from "@/components/dashboard-dropdown";
import DatePickerWithRange from "@/components/date-picker-with-range";
import { useSchoolStore } from "@/store";
import GroupedStackBar from "./components/tauxRecouvrement";
import { calculerRecouvrementParClasse } from "./fonction";
import { AcademicYear, Registration } from "@/lib/interface";
import { useEffect, useState } from "react";
import { BarChart2, Info } from "lucide-react";
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
interface DashbordViewProps {
  trans: {
    [key: string]: string;
  };
}
const DashbordView = ({ trans }: DashbordViewProps) => {
  const {
    registrations,
    classes,
    users,
    academicYearCurrent,
    pricing,
    students,
    installements,
    payments,
  } = useSchoolStore();
  const data = calculerRecouvrementParClasse(
    academicYearCurrent,
    registrations,
    pricing,
    students,
    installements,
    payments
  );
  const [doto, setData] = useState<string | null>(null);

  let seriesData: { name: string; data: number[] }[] = [];
  let categories: string[] = [];

  if (data) {
    // console.log("erreur : ", data);

    // Récupérer toutes les classes
    categories = data.map((classe) => classe.classeLabel);

    // Récupérer tous les types de frais distincts
    const fraisTypesSet = new Set<string>();
    data.forEach((classe) => {
      classe.tauxRecouvrementParFrais.forEach((frais) => {
        fraisTypesSet.add(frais.typeFrais);
      });
    });
    const fraisTypes = Array.from(fraisTypesSet);

    // Construire seriesData : un objet par type de frais avec les taux par classe
    seriesData = fraisTypes.map((typeFrais) => ({
      name: typeFrais,
      data: data.map((classe) => {
        const frais = classe.tauxRecouvrementParFrais.find(
          (f) => f.typeFrais === typeFrais
        );
        return frais ? frais.tauxRecouvrement : 0;
      }),
    }));
  }

  // useEffect(() => {
  //   // Récupération des données depuis localStorage
  //   const storedData = localStorage.getItem("school-store");
  //   if (storedData) {
  //     try {
  //       const parsedData = JSON.parse(storedData);
  //       console.log("Données récupérées depuis localStorage : ", parsedData.state);
  //       setData(parsedData);
  //     } catch (error) {
  //       console.error("Erreur lors du parsing des données : ", error);
  //     }
  //   }
  // }, []);

  return (
    <div className="space-y-6">
      {/*
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <div className="text-2xl font-medium text-default-800">
          Ecommerce Dashboard
        </div>
        <DatePickerWithRange />
      </div>
       */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            <SchoolStats
              registrations={
                registrations?.filter(
                  (item: Registration) =>
                    item.academic_year_id === academicYearCurrent.id
                ) || []
              }
              classes={classes}
              users={users}
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-12">
          <Card>
            <CardHeader className="border-none pb-0 mb-0">
              <div className="flex flex-wrap items-center gap-3">
                <CardTitle className="flex-1 whitespace-nowrap">
                  Nombre d'eleve par classe
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="px-0">
              <RevinueChart classesData={classes} />
            </CardContent>
          </Card>
        </div>
        {/* 
        <div className="col-span-12 lg:col-span-4">
          <Card className="py-2.5">
            <CardHeader className="flex-row items-center justify-between gap-4 border-none">
              <CardTitle>Top Browser</CardTitle>
            </CardHeader>
            <CardContent className="px-0 pb-8">
              <TopBrowserChart />
            </CardContent>
          </Card>
        </div>
        */}
      </div>
      <div className="grid grid-cols-12  gap-6">
        <div className="col-span-12 lg:col-span-4 2xl:col-span-5">
          <Card>
            <CardHeader className="mb-0">
              <div className="flex flex-wrap items-center gap-3">
                <CardTitle className="flex-1 whitespace-nowrap">
                  Recentes inscriptions
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="px-0 pt-0 h-[420px] pb-2">
              <ScrollArea className="h-full">
                <RecentInscription
                  inscriptions={registrations}
                  academicYear={academicYearCurrent}
                />
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
        <div className="col-span-12 lg:col-span-8 2xl:col-span-7">
          <Card>
            <CardHeader>
              <div className="flex flex-wrap items-center gap-3">
                <CardTitle className="flex-1 whitespace-nowrap">
                  Taux de recouvrement des frais par classe
                </CardTitle>
                <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="w-4 h-4 text-gray-400" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Le taux de recouvrement représente le pourcentage des frais payés par rapport au total attendu</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
              </div>
            </CardHeader>
            <CardContent>
              {seriesData?.length && categories?.length && data ? (
                <GroupedStackBar
                  seriesData={seriesData}
                  categories={categories}
                  rawData={data}
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-64 gap-2 text-center">
                  <BarChart2 className="w-12 h-12 text-gray-400" />
                  <p className="text-gray-500 font-medium">
                    Aucune donnée de recouvrement disponible
                  </p>
                  <p className="text-sm text-gray-400">
                    {!academicYearCurrent
                      ? "Aucune année académique sélectionnée"
                      : "Les données seront disponibles après les premières inscriptions"}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-12">
          <Card>
            <CardHeader className=" gap-4 border-none pb-0 mb-0">
              <div className="flex flex-wrap items-center gap-3">
                <CardTitle className="flex-1 whitespace-nowrap">
                  Rapport des inscriptions
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="px-4 pt-0">
              <RapportInscription registrations={registrations} />
            </CardContent>
          </Card>
        </div>
        {/*<div className="col-span-12 lg:col-span-4">
          <CustomerStatistics />
        </div>*/}
      </div>
      <div className="grid grid-cols-12 gap-6">
        {/* <div className="col-span-12 lg:col-span-4">
          <Card>
            <CardHeader className="flex-row justify-between items-center gap-4 mb-0 border-none p-6 pb-4">
              <CardTitle className="whitespace-nowrap">
                Transaction History
              </CardTitle>
              <DashboardDropdown />
            </CardHeader>
            <CardContent className="px-0 pt-0 h-[580px] pb-0">
              <ScrollArea className="h-full">
                <Transaction />
              </ScrollArea>
            </CardContent>
          </Card>
        </div> */}
        <div className="col-span-12 lg:col-span-12">
          <Payment
            data={payments}
            academic={academicYearCurrent}
            installments={installements}
          />
        </div>
      </div>
      {/* <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-6">
          <TopCountries />
        </div>
        <div className="col-span-12 lg:col-span-6">
          <Products />
        </div>
      </div> */}
    </div>
  );
};

export default DashbordView;
