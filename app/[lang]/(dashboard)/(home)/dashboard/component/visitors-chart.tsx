"use client";
import dynamic from "next/dynamic";
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });
import { useThemeStore } from "@/store";
import { useTheme } from "next-themes";
import { themes } from "@/config/thems";
import { getYAxisConfig, getLabel } from "@/lib/appex-chart-options";
import {Registration} from "@/lib/interface";

interface Props {
  height?: number;
  registrations: Registration[];
}
// Le composant RapportInscription affiche un graphique des inscriptions
// en fonction de la date d'inscription et de l'identifiant de l'étudiant.
// Il utilise la bibliothèque ApexCharts pour afficher le graphique
// et s'adapte au thème actuel de l'application.
const RapportInscription = ({ height = 300, registrations }:Props) => {
  const { theme: config } = useThemeStore();
  const { theme: mode } = useTheme();
  const theme = themes.find((theme) => theme.name === config);

  // Transformation des données
  const series = [
    {
      name: "Registrations",
      data: registrations.map((registration) => ({
        x: new Date(registration.registration_date).getTime(),
        y: registration.student_id,
      })),
    },
  ];

  const options = {
    chart: {
      zoom: {
        type: "x" as "x" | "y" | "xy" | undefined, // Explicitly cast to the correct union type
        enabled: true,
        autoScaleYaxis: true,
      },
      toolbar: {
        show: false,
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      curve: "smooth" as "smooth" | "straight" | "stepline" | "linestep" | "monotoneCubic",
      width: 3,
    },
    colors: [
      `hsl(${theme?.cssVars[mode === "dark" ? "dark" : "light"].success})`,
    ],
    tooltip: {
      theme: mode === "dark" ? "dark" : "light",
    },
    grid: {
      show: false,
    },
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        inverseColors: false,
        opacityFrom: 0.5,
        opacityTo: 0,
        stops: [20, 100, 100],
      },
    },
    yaxis: getYAxisConfig(
      `hsl(${theme?.cssVars[mode === "dark" ? "dark" : "light"].chartLabel})`
    ),
    xaxis: {
      type: "datetime" as "datetime" | "category" | "numeric" | undefined,
      labels: getLabel(
        `hsl(${
          theme?.cssVars[
            mode === "dark" || mode === "system" ? "dark" : "light"
          ].chartLabel
        })`
      ),
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
    },
    padding: {
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
    },
  };

  return (
    <Chart options={options} series={series} type="area" height={height} width={"100%"} />
  );
};

export default RapportInscription;
